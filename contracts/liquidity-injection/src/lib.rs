#![no_std]

use gstd::{msg, prelude::*};

use io::{BASE_RATE, InitLiquidity, LiquidityAction, LiquidityPool, RISK_MULTIPLIER};

static mut LIQUIDITY_POOL: Option<LiquidityPool> = None;

#[no_mangle]
extern fn init() {
    let config: InitLiquidity = msg::load().expect("Unable to decode InitConfig");
    let liquidity_pool = LiquidityPool {
        owner: msg::source(),
        stablecoin_address: config.stablecoin_address,
        base_rate: BASE_RATE,
        risk_multiplier: RISK_MULTIPLIER,
        ..Default::default()
    };
    unsafe { LIQUIDITY_POOL = Some(liquidity_pool) };
}

#[gstd::async_main]
async fn main() {
    let action: LiquidityAction = msg::load().expect("Could not load Action");
    let msg_source = msg::source();
    let liquidity_pool = unsafe {
        LIQUIDITY_POOL.as_mut().expect("Liquidity pool not initialized")
    };
    let result = match action {
        LiquidityAction::Deposit(amount) => {
            let result = liquidity_pool.deposit(msg_source, amount).await;
            result
        },
        LiquidityAction::WithdrawLiquidity(amount) => {
            let result = liquidity_pool.withdraw_liquidity(msg_source, amount).await;
            result
        },
        LiquidityAction::WithdrawRewards => {
            let result = liquidity_pool.withdraw_rewards(msg_source).await;
            result
        },
        LiquidityAction::ModifyTotalBorrowed(amount) => {
            let result = liquidity_pool.modify_total_borrowed(amount);
            result
        },
        LiquidityAction::ModifyAvailableRewardsPool(amount) => {
            let result = liquidity_pool.modify_available_rewards_pool(amount);
            result
        },
    };

    msg::reply(result, 0).expect("Failed to encode or reply with `Result<LiquidityEvent, Error>`");
}

#[no_mangle]
extern fn state() {
    let liquidity_pool = unsafe {
        LIQUIDITY_POOL.as_mut().expect("Liquidity pool not initialized")
    };
    liquidity_pool.update_all_rewards();
    msg::reply(liquidity_pool, 0).expect("Failed to encode or reply");
}


