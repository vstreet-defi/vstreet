#![no_std]

use gstd::{collections::BTreeMap, exec, msg, prelude::*, ActorId};
use io::{LiquidityAction, LiquidityEvent, Error, InitLiquidity, UserInfo, FTAction};

#[derive(Debug, Clone, Default, Encode)]
struct LiquidityPool {
    owner: ActorId,
    stablecoin_address: ActorId,
    apr: u128,
    total_deposited: u128,
    total_borrowed: u128,
    base_lender_rate: u128,
    lender_spread: u128,
    base_borrower_rate: u128,
    borrower_spread: u128,
    users: BTreeMap<ActorId, UserInfo>,
}

static mut LIQUIDITY_POOL: Option<LiquidityPool> = None;
const DECIMALS_FACTOR: u128 = 10_u128.pow(18);
const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60

#[no_mangle]
extern fn init() {
    let config: InitLiquidity = msg::load().expect("Unable to decode InitConfig");

    let liquidity_pool = LiquidityPool {
        owner: msg::source(),
        stablecoin_address: config.stablecoin_address,
        apr: DECIMALS_FACTOR / 10, // 10% APR
        base_lender_rate: DECIMALS_FACTOR / 20, // 5% base lender rate
        lender_spread: DECIMALS_FACTOR / 20, // 5% lender spread
        base_borrower_rate: DECIMALS_FACTOR / 10, // 10% base borrower rate
        borrower_spread: DECIMALS_FACTOR / 10, // 10% borrower spread
        ..Default::default()
    };

    unsafe { LIQUIDITY_POOL = Some(liquidity_pool) };
}

#[gstd::async_main]
async fn main() {
    let liquidity_pool = unsafe { LIQUIDITY_POOL.get_or_insert(LiquidityPool::default()) };

    let action: LiquidityAction = msg::load().expect("Could not load Action");
    let msg_source = msg::source();

    let result = match action {
        LiquidityAction::Deposit(amount) => {
            liquidity_pool.deposit(msg_source, amount).await.expect("Deposit action failed");
        },
        LiquidityAction::WithdrawLiquidity(amount) => {
            liquidity_pool.withdraw_liquidity(msg_source, amount).await.expect("Liquidity withdraw action failed");
        },
        LiquidityAction::WithdrawRewards => {
            liquidity_pool.withdraw_rewards(msg_source).await.expect("Rewards withdraw action failed");
        },
        LiquidityAction::Borrow(amount) => {
            liquidity_pool.borrow(msg_source, amount).await.expect("Borrow action failed");
        },
        LiquidityAction::Repay(amount) => {
            liquidity_pool.repay(msg_source, amount).await.expect("Repay action failed");
        },
    };

    msg::reply(result, 0).expect("Failed to encode or reply with `Result<LiquidityEvent, Error>`");
}

#[no_mangle]
extern fn state() {
    let mut liquidity_pool = unsafe { LIQUIDITY_POOL.take().expect("Unexpected error in taking state") };
    liquidity_pool.update_all_rewards();
    msg::reply::<LiquidityPool>(liquidity_pool.clone(), 0)
        .expect("Failed to encode or reply with `LiquidityPool` from `state()`");
    unsafe { LIQUIDITY_POOL = Some(liquidity_pool) };
}

impl LiquidityPool {
    fn calculate_utilization(&self) -> u128 {
        if self.total_deposited == 0 {
            return 0;
        }
        self.total_borrowed.saturating_mul(DECIMALS_FACTOR) / self.total_deposited
    }

    fn calculate_lender_rate(&self) -> u128 {
        let utilization = self.calculate_utilization();
        self.base_lender_rate + (utilization.saturating_mul(self.lender_spread) / DECIMALS_FACTOR)
    }

    fn calculate_borrower_rate(&self) -> u128 {
        let utilization = self.calculate_utilization();
        self.base_borrower_rate + (utilization.saturating_mul(self.borrower_spread) / DECIMALS_FACTOR)
    }

    fn update_all_rewards(&mut self) {
        let current_timestamp_in_millis = exec::block_timestamp() as u128;
        let lender_rate = self.calculate_lender_rate();

        for user_info in self.users.values_mut() {
            let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
            let time_diff_in_seconds = time_diff_in_millis / 1000;
            if time_diff_in_seconds > 0 {
                let rewards = (user_info.balance.saturating_mul(lender_rate).saturating_mul(time_diff_in_seconds)) / (YEAR_IN_SECONDS.saturating_mul(DECIMALS_FACTOR));
                user_info.rewards = user_info.rewards.saturating_add(rewards);
                user_info.last_updated = current_timestamp_in_millis;
            }
        }
    }

    async fn deposit(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        if amount == 0 {
            return Err(Error::ZeroAmount);
        }

        let lender_rate = self.calculate_lender_rate();
        let current_timestamp_in_millis = exec::block_timestamp() as u128;
        let user_info = self.users.entry(user).or_insert(UserInfo {
            balance: 0,
            rewards: 0,
            loan: 0,
            last_updated: current_timestamp_in_millis,
        });

        let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
        let time_diff_in_seconds = time_diff_in_millis / 1000;
        if time_diff_in_seconds > 0 {
            let rewards = (user_info.balance.saturating_mul(lender_rate).saturating_mul(time_diff_in_seconds)) / (YEAR_IN_SECONDS.saturating_mul(DECIMALS_FACTOR));
            user_info.rewards = user_info.rewards.saturating_add(rewards);
        }
        user_info.last_updated = current_timestamp_in_millis;
        user_info.balance = user_info.balance.saturating_add(amount);
        self.total_deposited = self.total_deposited.saturating_add(amount);

        let token_address = self.stablecoin_address;
        self.transfer_tokens_to_contract(&token_address, &user, amount).await?;

        Ok(LiquidityEvent::Deposited(amount))
    }

    async fn borrow(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        let current_timestamp_in_millis = exec::block_timestamp() as u128;
        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        let max_borrow_amount = user_info.balance.saturating_mul(70) / 100;
        if amount > max_borrow_amount {
            return Err(Error::InvalidAmount);
        }

        user_info.loan = user_info.loan.saturating_add(amount);
        self.total_borrowed = self.total_borrowed.saturating_add(amount);

        let token_address = self.stablecoin_address;
        self.transfer_tokens_from_contract(&token_address, &user, amount).await?;

        Ok(LiquidityEvent::Borrowed(amount))
    }

    async fn repay(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        if amount > user_info.loan {
            return Err(Error::InvalidAmount);
        }

        user_info.loan = user_info.loan.saturating_sub(amount);
        self.total_borrowed = self.total_borrowed.saturating_sub(amount);

        let token_address = self.stablecoin_address;
        self.transfer_tokens_to_contract(&token_address, &user, amount).await?;

        Ok(LiquidityEvent::Repaid(amount))
    }

    async fn withdraw_liquidity(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        let lender_rate = self.calculate_lender_rate();
        let current_timestamp_in_millis = exec::block_timestamp() as u128;
        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        if amount == 0 || amount > user_info.balance {
            return Err(Error::InvalidAmount);
        }

        let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
        let time_diff_in_seconds = time_diff_in_millis / 1000;
        if time_diff_in_seconds > 0 {
            let rewards = (user_info.balance.saturating_mul(lender_rate).saturating_mul(time_diff_in_seconds)) / (YEAR_IN_SECONDS.saturating_mul(DECIMALS_FACTOR));
            user_info.rewards = user_info.rewards.saturating_add(rewards);
        }
        user_info.last_updated = current_timestamp_in_millis;
        user_info.balance = user_info.balance.saturating_sub(amount);
        self.total_deposited = self.total_deposited.saturating_sub(amount);

        let token_address = self.stablecoin_address;
        self.transfer_tokens_from_contract(&token_address, &user, amount).await?;

        Ok(LiquidityEvent::LiquidityWithdrawn(amount))
    }

    async fn withdraw_rewards(&mut self, user: ActorId) -> Result<LiquidityEvent, Error> {
        let lender_rate = self.calculate_lender_rate();
        let current_timestamp_in_millis = exec::block_timestamp() as u128;
        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
        let time_diff_in_seconds = time_diff_in_millis / 1000;
        if time_diff_in_seconds > 0 {
            let rewards = (user_info.balance.saturating_mul(lender_rate).saturating_mul(time_diff_in_seconds)) / (YEAR_IN_SECONDS.saturating_mul(DECIMALS_FACTOR));
            user_info.rewards = user_info.rewards.saturating_add(rewards);
        }
        user_info.last_updated = current_timestamp_in_millis;

        let rewards_to_withdraw = user_info.rewards;
        if rewards_to_withdraw == 0 {
            return Err(Error::ZeroRewards);
        }

        user_info.rewards = 0;

        let token_address = self.stablecoin_address;
        self.transfer_tokens_from_contract(&token_address, &user, rewards_to_withdraw).await?;

        Ok(LiquidityEvent::RewardsWithdrawn(rewards_to_withdraw))
    }

    async fn transfer_tokens_from_contract(
        &self,
        token_address: &ActorId,
        to: &ActorId,
        amount: u128,
    ) -> Result<(), Error> {
        let payload = FTAction::Transfer { from: exec::program_id(), to: *to, amount };
        msg::send(*token_address, payload, 0).map_err(|_| Error::TransferFailed)?;
        Ok(())
    }

    async fn transfer_tokens_to_contract(
        &self,
        token_address: &ActorId,
        from: &ActorId,
        amount: u128,
    ) -> Result<(), Error> {
        let payload = FTAction::Transfer { from: *from, to: exec::program_id(), amount };
        msg::send(*token_address, payload, 0).map_err(|_| Error::TransferFailed)?;
        Ok(())
    }
}
