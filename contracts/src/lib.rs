#![no_std]

use gstd::{collections::BTreeMap, exec, msg, prelude::*, ActorId};
use io::{LiquidityAction, LiquidityEvent, Error, InitLiquidity, UserInfo};

#[derive(Debug, Clone, Default, Encode)]
struct LiquidityPool {
    owner: ActorId,
    stablecoin_address: ActorId,
    apr: u128,
    total_deposited: u128,
    users: BTreeMap<ActorId, UserInfo>,
}

static mut LIQUIDITY_POOL: Option<LiquidityPool> = None;
const DECIMALS_FACTOR: u128 = 10_u128.pow(18);
const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60

impl LiquidityPool {
    fn update_all_rewards(&mut self) {
        let current_timestamp = exec::block_timestamp() as u128;

        for user_info in self.users.values_mut() {
            let time_diff = current_timestamp - user_info.last_updated;
            if time_diff > 0 {
                let rewards = (user_info.balance * self.apr * time_diff) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);
                user_info.rewards = user_info.rewards.saturating_add(rewards);
                user_info.last_updated = current_timestamp;
            }
        }
    }

    async fn deposit(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        if amount == 0 {
            return Err(Error::ZeroAmount);
        }

        let current_timestamp = exec::block_timestamp() as u128;

        let user_info = self.users.entry(user).or_insert(UserInfo {
            balance: 0,
            rewards: 0,
            last_updated: current_timestamp,
        });

        // Calcular recompensas acumuladas en el mismo contexto mutable
        let time_diff = current_timestamp - user_info.last_updated;
        if time_diff > 0 {
            let rewards = (user_info.balance * self.apr * time_diff) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);
            user_info.rewards = user_info.rewards.saturating_add(rewards);
        }
        user_info.last_updated = current_timestamp;
        user_info.balance = user_info.balance.saturating_add(amount);
        self.total_deposited = self.total_deposited.saturating_add(amount);

        let token_address = self.stablecoin_address;
        self.transfer_tokens(&token_address, &user, &exec::program_id(), amount).await?;

        Ok(LiquidityEvent::Deposited(amount))
    }

    async fn withdraw_liquidity(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        let current_timestamp = exec::block_timestamp() as u128;

        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        if amount == 0 || amount > user_info.balance {
            return Err(Error::InvalidAmount);
        }

        // Calcular recompensas acumuladas en el mismo contexto mutable
        let time_diff = current_timestamp - user_info.last_updated;
        if time_diff > 0 {
            let rewards = (user_info.balance * self.apr * time_diff) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);
            user_info.rewards = user_info.rewards.saturating_add(rewards);
        }
        user_info.last_updated = current_timestamp;
        user_info.balance = user_info.balance.saturating_sub(amount);
        self.total_deposited = self.total_deposited.saturating_sub(amount);

        let token_address = self.stablecoin_address;
        self.transfer_tokens(&token_address, &exec::program_id(), &user, amount).await?;

        Ok(LiquidityEvent::LiquidityWithdrawn(amount))
    }

    async fn withdraw_rewards(&mut self, user: ActorId) -> Result<LiquidityEvent, Error> {
        let current_timestamp = exec::block_timestamp() as u128;

        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        // Calcular recompensas acumuladas en el mismo contexto mutable
        let time_diff = current_timestamp - user_info.last_updated;
        if time_diff > 0 {
            let rewards = (user_info.balance * self.apr * time_diff) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);
            user_info.rewards = user_info.rewards.saturating_add(rewards);
        }
        user_info.last_updated = current_timestamp;

        let rewards_to_withdraw = user_info.rewards;
        if rewards_to_withdraw == 0 {
            return Err(Error::ZeroRewards);
        }

        user_info.rewards = 0;

        let token_address = self.stablecoin_address;
        self.transfer_tokens(&token_address, &exec::program_id(), &user, rewards_to_withdraw).await?;

        Ok(LiquidityEvent::RewardsWithdrawn(rewards_to_withdraw))
    }

    async fn transfer_tokens(
        &self,
        _token_address: &ActorId,
        _from: &ActorId,
        _to: &ActorId,
        _amount: u128,
    ) -> Result<(), Error> {
        // Implement token transfer logic here
        // Por simplicidad, asumiremos que la transferencia siempre es exitosa.
        // En un contrato real, deberías implementar la lógica de transferencia de tokens.
        Ok(())
    }
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
extern fn init() {
    let config: InitLiquidity = msg::load().expect("Unable to decode InitConfig");

    let liquidity_pool = LiquidityPool {
        owner: msg::source(),
        stablecoin_address: config.stablecoin_address,
        apr: DECIMALS_FACTOR / 10, // 10% APR
        ..Default::default()
    };

    unsafe { LIQUIDITY_POOL = Some(liquidity_pool) };
}

#[no_mangle]
extern fn state() {
    let mut liquidity_pool = unsafe { LIQUIDITY_POOL.take().expect("Unexpected error in taking state") };
    liquidity_pool.update_all_rewards();
    msg::reply::<LiquidityPool>(liquidity_pool.clone(), 0)
        .expect("Failed to encode or reply with `LiquidityPool` from `state()`");
    unsafe { LIQUIDITY_POOL = Some(liquidity_pool) };
}
