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

    let result = unsafe {
        LIQUIDITY_POOL.as_mut()
            .expect("Liquidity pool not initialized")
            .handle_action(action, msg_source)
            .await
    };

    msg::reply(result, 0).expect("Failed to encode or reply");
}

#[no_mangle]
extern fn state() {
    let liquidity_pool = unsafe {
        LIQUIDITY_POOL.as_mut().expect("Liquidity pool not initialized")
    };
    liquidity_pool.update_all_rewards();
    msg::reply(liquidity_pool, 0).expect("Failed to encode or reply");
}


