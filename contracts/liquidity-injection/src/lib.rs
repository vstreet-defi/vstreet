#![no_std]

use gstd::{ActorId, collections::BTreeMap, debug, exec, msg, prelude::*};

use io::{Error, FTAction, FTEvent, InitLiquidity, LiquidityAction, LiquidityEvent, UserInfo};

const DECIMALS_FACTOR: u128 = 10_u128.pow(6);
const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60

#[derive(Debug, Clone, Default, Encode)]
struct LiquidityPool {
    owner: ActorId,
    stablecoin_address: ActorId,
    apr: u128,
    total_deposited: u128,
    users: BTreeMap<ActorId, UserInfo>,
}

static mut LIQUIDITY_POOL: Option<LiquidityPool> = None;

#[no_mangle]
extern fn init() {
    let config: InitLiquidity = msg::load().expect("Unable to decode InitConfig");

    let liquidity_pool = LiquidityPool {
        owner: msg::source(),
        stablecoin_address: config.stablecoin_address,
        apr: DECIMALS_FACTOR / 10, // Representa 10% APR
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
        LiquidityAction::Deposit(amount) => liquidity_pool.deposit(msg_source, amount).await,
        LiquidityAction::WithdrawLiquidity(amount) => liquidity_pool.withdraw_liquidity(msg_source, amount).await,
        LiquidityAction::WithdrawRewards => liquidity_pool.withdraw_rewards(msg_source).await,
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
    fn update_all_rewards(&mut self) {
        let current_timestamp_in_millis = exec::block_timestamp() as u128;

        for user_info in self.users.values_mut() {
            let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
            let time_diff_in_seconds = time_diff_in_millis / 1000; // Convert to seconds
            if time_diff_in_seconds > 0 {
                let rewards = (user_info.balance * self.apr * time_diff_in_seconds) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);

                debug!(
                    "Calculando recompensas para el usuario: {:?}, balance: {}, APR: {}, tiempo: {}, recompensas: {}",
                    user_info, user_info.balance, self.apr, time_diff_in_seconds, rewards
                );

                user_info.rewards = user_info.rewards.saturating_add(rewards);
                user_info.rewards_usdc = user_info.rewards / DECIMALS_FACTOR;
                user_info.last_updated = current_timestamp_in_millis;
            }
        }
    }


    async fn deposit(&mut self, user: ActorId, amount_in_stablecoin: u128) -> Result<LiquidityEvent, Error> {
        if amount_in_stablecoin == 0 {
            return Err(Error::ZeroAmount);
        }

        let current_timestamp_in_millis = exec::block_timestamp() as u128;

        let user_info = self.users.entry(user).or_insert(UserInfo {
            balance: 0,
            rewards: 0,
            last_updated: current_timestamp_in_millis,
            balance_usdc: 0,
            rewards_usdc: 0,
        });

        // if !user_info.approved {
        //     return Err(Error::UserNotApproved);
        // }
        // Calcular recompensas acumuladas antes del depósito
        let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
        let time_diff_in_seconds = time_diff_in_millis / 1000; // Convert to seconds
        if time_diff_in_seconds > 0 {
            let rewards = (user_info.balance * self.apr * time_diff_in_seconds) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);

            debug!(
                "Calculando recompensas para el usuario en depósito: {:?}, balance: {}, APR: {}, tiempo: {}, recompensas: {}",
                user, user_info.balance, self.apr, time_diff_in_seconds, rewards
            );

            user_info.rewards = user_info.rewards.saturating_add(rewards);
            user_info.rewards_usdc = user_info.rewards / DECIMALS_FACTOR;
        }
        user_info.last_updated = current_timestamp_in_millis;
        user_info.balance = user_info.balance.saturating_add(amount_in_stablecoin * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        self.total_deposited = self.total_deposited.saturating_add(amount_in_stablecoin * DECIMALS_FACTOR);

        let token_address = self.stablecoin_address;
        let result = self.transfer_tokens_to_contract(&token_address, amount_in_stablecoin).await?;
        msg::send(user, result, 0).expect("Msg failed");
        Ok(LiquidityEvent::Deposited(amount_in_stablecoin))
    }

    async fn withdraw_liquidity(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        let current_timestamp_in_millis = exec::block_timestamp() as u128;

        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        if amount == 0 || amount > user_info.balance {
            return Err(Error::InvalidAmount);
        }

        // Calcular recompensas acumuladas antes del retiro
        let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
        let time_diff_in_seconds = time_diff_in_millis / 1000; // Convert to seconds
        if time_diff_in_seconds > 0 {
            let rewards = (user_info.balance * self.apr * time_diff_in_seconds) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);

            debug!(
                "Calculando recompensas para el usuario en retiro: {:?}, balance: {}, APR: {}, tiempo: {}, recompensas: {}",
                user, user_info.balance, self.apr, time_diff_in_seconds, rewards
            );

            user_info.rewards = user_info.rewards.saturating_add(rewards);
            user_info.rewards_usdc = user_info.rewards / DECIMALS_FACTOR;
        }
        user_info.last_updated = current_timestamp_in_millis;
        user_info.balance = user_info.balance.saturating_sub(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        self.total_deposited = self.total_deposited.saturating_sub(amount * DECIMALS_FACTOR);

        let token_address = self.stablecoin_address;
        self.transfer_tokens_from_contract(&token_address, amount).await?;

        Ok(LiquidityEvent::LiquidityWithdrawn(amount))
    }

    async fn withdraw_rewards(&mut self, user: ActorId) -> Result<LiquidityEvent, Error> {
        let current_timestamp_in_millis = exec::block_timestamp() as u128;

        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        // Calcular recompensas acumuladas antes del retiro de recompensas
        let time_diff_in_millis = current_timestamp_in_millis - user_info.last_updated;
        let time_diff_in_seconds = time_diff_in_millis / 1000; // Convert to seconds
        if time_diff_in_seconds > 0 {
            let rewards = (user_info.balance * self.apr * time_diff_in_seconds) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);

            debug!(
                "Calculando recompensas para el usuario en retiro de recompensas: {:?}, balance: {}, APR: {}, tiempo: {}, recompensas: {}",
                user, user_info.balance, self.apr, time_diff_in_seconds, rewards
            );

            user_info.rewards = user_info.rewards.saturating_add(rewards);
            user_info.rewards_usdc = user_info.rewards / DECIMALS_FACTOR;
        }
        user_info.last_updated = current_timestamp_in_millis;

        let rewards_to_withdraw = user_info.rewards;
        if rewards_to_withdraw == 0 {
            return Err(Error::ZeroRewards);
        }

        user_info.rewards = 0;
        user_info.rewards_usdc = 0;

        let token_address = self.stablecoin_address;
        self.transfer_tokens_from_contract(&token_address, rewards_to_withdraw).await?;

        Ok(LiquidityEvent::RewardsWithdrawn(rewards_to_withdraw))
    }

    // async fn approve_transactions_between_contract_and_stablecoin(
    //     &self,
    //     token_address: &ActorId,
    //     amount_in_stablecoin: u128) {
    //     let payload = FTAction::Approve { to: exec::program_id(), amount: amount_in_stablecoin };
    //     let _ = msg::send(*token_address, payload, 0);
    // }

    async fn transfer_tokens_from_contract(
        &self,
        token_address: &ActorId,
        amount: u128,
    ) -> Result<(), Error> {
        let payload = FTAction::Transfer { from: exec::program_id(), to: msg::source(), amount };
        let future = msg::send_for_reply_as(*token_address, payload, 0, 0)
            .map_err(|_| Error::TransferFailed)?;

        let result = future.await.map_err(|_| Error::TransferFailed)?;

        match result {
            FTEvent::Err => Err(Error::TransferFailed),
            _ => Ok(()),
        }
    }

    async fn transfer_tokens_to_contract(
        &self,
        token_address: &ActorId,
        amount_in_stablecoin: u128,
    ) -> Result<(), Error> {
        let payload = FTAction::Transfer { from: msg::source(), to: exec::program_id(), amount: amount_in_stablecoin };
        let future = msg::send_for_reply_as(*token_address, payload, 0, 0)
            .map_err(|_| Error::TransferFailed)?;

        let result = future.await.map_err(|_| Error::TransferFailed)?;

        match result {
            FTEvent::Err => Err(Error::TransferFailed),
            _ => Ok(()),
        }
    }
}
