use sails_rs::{
    prelude::*,
    gstd::{
        msg,
        debug,
        exec,
    }
};

use crate::clients::extended_vft_client::traits::Vft;
use crate::services::vst_liquidity_injection::LiquidityInjectionService;
use crate::services::vst_liquidity_injection::LiquidityEvent;
use crate::services::vst_liquidity_injection::DECIMALS_FACTOR;
use crate::services::vst_liquidity_injection::ONE_TVARA;
use crate::services::utils::EventNotifier;

// Public methods

// DepositLiquidty method
pub async fn deposit_liquidity<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128,
) -> Result<(), String>
where
    VftClient: Vft,
{
    service.update_all_rewards();

    debug!("Depositing funds");
    if amount == 0 {
        service.notify_error("Zero Amount".to_string());
        return sails_rs::Err("Zero Amount".to_string());
    }
 
    let state_mut = service.state_mut();

    // Transfer tokens from user to contract
    let result = service.transfer_tokens(msg::source(), exec::program_id(), amount).await;

    if let Err(_) = result {
        service.notify_error("Error in VFT Transfer call".to_string());
        return sails_rs::Err("Error in VFT Transfer call".to_string());
    }

    // Update user balance
    let current_timestamp = exec::block_timestamp() as u128;
    let user_info = state_mut.users
        .entry(msg::source())
        .or_insert_with(|| LiquidityInjectionService::<VftClient>::create_new_user(current_timestamp));

    user_info.balance = user_info.balance.saturating_add(amount * DECIMALS_FACTOR);
    user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
    state_mut.total_deposited = state_mut.total_deposited.saturating_add(amount * DECIMALS_FACTOR);

    service.calculate_apr();
    debug!("New APR after deposit: {}", state_mut.apr);

    LiquidityInjectionService::<VftClient>::update_user_rewards(user_info, state_mut.interest_rate);

    // Notify the deposit event
    let amount_deposited: u128 = amount * DECIMALS_FACTOR;
    service.notify_deposit(amount_deposited);
    
    Ok(())
}

// WithdrawLiquidity method
pub async fn withdraw_liquidity<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128,
) -> Result<(), String>
where
    VftClient: Vft,
{
    service.update_all_rewards();

    let state_mut = service.state_mut();

    let user_info = state_mut.users.get_mut(&msg::source()).unwrap();

    // Check if amount is valid
    if amount == 0 || amount > user_info.balance {
        service.notify_error("Invalid Amount".to_string());
        return sails_rs::Err("Invalid Amount".to_string());
    }

    // Transfer tokens from contract to user
    let result = service.transfer_tokens(exec::program_id(), msg::source(), amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        service.notify_error("Error in VFT Transfer call".to_string());
        return sails_rs::Err("Error in VFT Transfer call".to_string());
    }

    // Update balance and rewards
    user_info.balance = user_info.balance.saturating_sub(amount * DECIMALS_FACTOR);
    user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
    state_mut.total_deposited = state_mut.total_deposited.saturating_sub(amount * DECIMALS_FACTOR);

    service.calculate_utilization_factor();

    state_mut.apr = service.calculate_apr();
    debug!("New APR after Withdraw: {}", state_mut.apr);

    LiquidityInjectionService::<VftClient>::update_user_rewards(user_info, state_mut.interest_rate);

    // Notify the withdraw event
    let amount_withdrawn: u128 = amount * DECIMALS_FACTOR;
    service.notify_withdraw_liquidity(amount_withdrawn);
    
    Ok(())
}

// Withdraw Rewards Method
pub async fn withdraw_rewards<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>
) -> Result<(), String>
where
    VftClient: Vft,
{
    service.update_all_rewards();
    service.update_all_collateral_available_to_withdraw();
    let state_mut = service.state_mut();
    state_mut.apr = service.calculate_apr();
    let user = msg::source();

    let user_info = if let Some(user_info) = state_mut.users.get_mut(&user) {
        user_info
    } else {
        service.notify_error("User not found".to_string());
        return sails_rs::Err("User not found".to_string());

    };

    LiquidityInjectionService::<VftClient>::update_user_rewards(user_info, state_mut.interest_rate);
    let rewards_to_withdraw = user_info.rewards.saturating_sub(user_info.rewards_withdrawn);

    if rewards_to_withdraw == 0 || rewards_to_withdraw > state_mut.available_rewards_pool {
        service.notify_error("Invalid amount".to_string());
        return sails_rs::Err("Invalid amount".to_string());
    }

    user_info.rewards = user_info.rewards.saturating_sub(rewards_to_withdraw);
    user_info.rewards_withdrawn = user_info.rewards_withdrawn.saturating_add(rewards_to_withdraw);
    user_info.rewards_usdc = user_info.rewards_usdc.saturating_sub(user_info.rewards_usdc);
    user_info.rewards_usdc_withdrawn = user_info.rewards_usdc_withdrawn.saturating_add(user_info.rewards_usdc);

    state_mut.total_rewards_distributed = state_mut.total_rewards_distributed.saturating_add(rewards_to_withdraw);

    service.transfer_tokens(
        exec::program_id(),
        msg::source(),
        rewards_to_withdraw / DECIMALS_FACTOR
    ).await.expect("Transfer tokens failed during the rewards withdrawal");

    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);
    
    // Notify the WithdrawRewards event
    let amount: u128 = rewards_to_withdraw / DECIMALS_FACTOR;
    service.notify_withdraw_rewards(amount);

    Ok(())
}

// Deposit Vara as Collateral
pub async fn deposit_collateral<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>
) -> Result<(), String>
where
    VftClient: Vft,
{
    let value = msg::value();
    let caller = msg::source();

    if value == 0 {
        service.notify_error("No value sent".to_string());
        return sails_rs::Err("No value sent".to_string());
    }

    let state_mut = service.state_mut();

    // Update user collateral
    let current_timestamp = exec::block_timestamp() as u128;
    let user_info = state_mut.users
        .entry(msg::source())
        .or_insert_with(|| LiquidityInjectionService::<VftClient>::create_new_user(current_timestamp));

    user_info.balance_vara = user_info.balance_vara.saturating_add(value);

    //Update CV and MLA
    service.calculate_cv(caller);
    service.calculate_mla(caller);

    // Calculate available to withdraw vara
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);

    let amount = value / ONE_TVARA;

    service.calculate_apr();

    // Notify the deposit event
    service.notify_deposited_vara(amount);

    Ok(())
}

// Withdraw Vara as Collateral
pub async fn withdraw_collateral<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128
) -> Result<(), String>
where
    VftClient: Vft,
{
    let caller = msg::source();
    let state_mut = service.state_mut();
    
    let user_info = if let Some(user_info) = state_mut.users.get_mut(&caller) {
            user_info
        } else {
            service.notify_error("User not found".to_string());
            return sails_rs::Err("User not found".to_string());
        };

    let amount_vara = amount * ONE_TVARA;

    // Check if amount is valid
    if amount_vara == 0 || amount_vara > user_info.available_to_withdraw_vara {
        service.notify_error("Invalid Amount".to_string());
        return sails_rs::Err("Invalid Amount".to_string());
    }

    msg::send(
        msg::source(),
        LiquidityEvent::WithdrawnVara { amount: amount }, 
        amount_vara
    )
    .expect("Error sending varas");

    // Update balance 
    user_info.balance_vara = user_info.balance_vara.saturating_sub(amount_vara);

    //Update CV and MLA
    service.calculate_cv(caller);
    service.calculate_mla(caller);

    service.update_user_ltv(caller);
   
    // Calculate available to withdraw vara
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);

    let _ = service.liquidate_user_loan(caller).await;

    service.calculate_utilization_factor();

    service.calculate_apr();

    // Notify the withdraw event
    let amount_withdrawn = amount;
    service.notify_withdrawn_vara(amount_withdrawn);

    Ok(())
}