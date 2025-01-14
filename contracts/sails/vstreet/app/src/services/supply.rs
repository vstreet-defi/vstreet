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
use crate::services::utils::{
    EventNotifier,
    ERROR_TRANSFER_FAILED,
    ERROR_INVALID_AMOUNT,
    ERROR_USER_NOT_FOUND,
    ERROR_REWARDS_POOL_INSUFFICIENT,
    ERROR_USER_REWARDS_INSUFFICIENT
};

// Public methods

// DepositLiquidty method
pub async fn deposit_liquidity<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128
) -> Result<(), String>
where
    VftClient: Vft,
{
    service.update_all_rewards();
    let state_mut = service.state_mut();

    debug!("Depositing funds");
    if amount > state_mut.config.max_liquidity_deposit || amount == 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }
 
    let caller = msg::source();
    let decimals_factor = state_mut.config.decimals_factor;

    // Transfer tokens from user to contract
    let result = service.transfer_tokens(caller, exec::program_id(), amount).await;

    if let Err(_) = result {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    let scaled_amount = amount
        .checked_mul(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    // Update user balance
    let current_timestamp = exec::block_timestamp() as u128;
    let user_info = state_mut.users
        .entry(caller)
        .or_insert_with(|| LiquidityInjectionService::<VftClient>::create_new_user(current_timestamp));

    user_info.balance = user_info
        .balance
        .checked_add(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if user_info.balance % decimals_factor != 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return Err(error_message);
    }

    user_info.balance_usdc = user_info
        .balance
        .checked_div(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    state_mut.total_deposited = state_mut
        .total_deposited
        .checked_add(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    service.calculate_apr();
    debug!("New APR after deposit: {}", state_mut.apr);

    LiquidityInjectionService::<VftClient>::update_user_rewards(user_info, state_mut.apr, state_mut.config.decimals_factor, state_mut.config.year_in_seconds);

    // Notify the deposit event
    service.notify_deposit(scaled_amount);
    
    Ok(())
}

// WithdrawLiquidity method
pub async fn withdraw_liquidity<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128
) -> Result<(), String>
where
    VftClient: Vft,
{
    service.update_all_rewards();

    let state_mut = service.state_mut();
    let caller = msg::source();
    let decimals_factor = state_mut.config.decimals_factor;

    let user_info = match state_mut.users.get_mut(&caller) {
        Some(user_info) => user_info,
        None => {
            let error_message = ERROR_USER_NOT_FOUND.to_string();
            service.notify_error(error_message.clone());
            return Err(error_message);
        }
    };

    // Check if amount is valid
    if amount > state_mut.config.max_liquidity_withdraw || amount == 0 || amount > user_info.balance {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    let scaled_amount = amount
        .checked_mul(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;
    
    // Check if scaled amount is valid
    if scaled_amount == 0 || scaled_amount > user_info.balance {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Transfer tokens from contract to user
    let result = service.transfer_tokens(exec::program_id(), caller, amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Update balance and rewards
    user_info.balance = user_info
        .balance
        .checked_sub(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;
    
    if user_info.balance % decimals_factor != 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return Err(error_message);
    }

    user_info.balance_usdc = user_info
        .balance
        .checked_div(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    state_mut.total_deposited = state_mut
        .total_deposited
        .checked_sub(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    service.calculate_utilization_factor();
    state_mut.apr = service.calculate_apr();

    debug!("New APR after Withdraw: {}", state_mut.apr);

    LiquidityInjectionService::<VftClient>::update_user_rewards(user_info, state_mut.apr, state_mut.config.decimals_factor, state_mut.config.year_in_seconds);

    // Notify the withdraw event
    service.notify_withdraw_liquidity(scaled_amount);
    
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
    let caller = msg::source();
    let decimals_factor = state_mut.config.decimals_factor;

    let user_info = match state_mut.users.get_mut(&caller) {
        Some(user_info) => user_info,
        None => {
            let error_message = ERROR_USER_NOT_FOUND.to_string();
            service.notify_error(error_message.clone());
            return Err(error_message);
        }
    };

    state_mut.apr = service.calculate_apr();
    LiquidityInjectionService::<VftClient>::update_user_rewards(user_info, state_mut.apr, state_mut.config.decimals_factor, state_mut.config.year_in_seconds);
    
    let rewards_to_withdraw = user_info
        .rewards
        .checked_sub(user_info.rewards_withdrawn)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if rewards_to_withdraw < state_mut.config.min_rewards_withdraw {
        let error_message = ERROR_USER_REWARDS_INSUFFICIENT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    if rewards_to_withdraw > state_mut.available_rewards_pool {
        let error_message = ERROR_REWARDS_POOL_INSUFFICIENT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    user_info.rewards = user_info
        .rewards
        .checked_sub(rewards_to_withdraw)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    user_info.rewards_withdrawn = user_info
        .rewards_withdrawn
        .checked_add(rewards_to_withdraw)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    user_info.rewards_usdc = user_info
        .rewards_usdc
        .checked_sub(user_info.rewards_usdc)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    user_info.rewards_usdc_withdrawn = user_info
        .rewards_usdc_withdrawn
        .checked_add(user_info.rewards_usdc)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    state_mut.total_rewards_distributed = state_mut
        .total_rewards_distributed
        .checked_add(rewards_to_withdraw)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;
    
    if rewards_to_withdraw % decimals_factor != 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return Err(error_message);
    }

    let amount = rewards_to_withdraw
        .checked_div(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if rewards_to_withdraw == 0 || rewards_to_withdraw > state_mut.available_rewards_pool {
        let error_message = ERROR_REWARDS_POOL_INSUFFICIENT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Transfer tokens from contract to user
    let result = service.transfer_tokens(exec::program_id(), caller, amount).await;

    if let Err(_) = result {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);
    
    // Notify the WithdrawRewards event
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
    let state_mut = service.state_mut();

    let value = msg::value();
    let caller = msg::source();
    let one_tvara = state_mut.config.one_tvara;

    if value == 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Update user collateral
    let current_timestamp = exec::block_timestamp() as u128;
    let user_info = state_mut.users
        .entry(caller)
        .or_insert_with(|| LiquidityInjectionService::<VftClient>::create_new_user(current_timestamp));

    user_info.balance_vara = user_info
        .balance_vara
        .checked_add(value)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    //Update CV and MLA
    service.calculate_cv(caller);
    service.calculate_mla(caller);

    // Calculate available to withdraw vara
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);

    LiquidityInjectionService::<VftClient>::calculate_all_loan_interest_rate_amounts();


    if value % one_tvara != 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return Err(error_message);
    }

    let amount = value
        .checked_div(one_tvara)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

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
    let state_mut = service.state_mut();
    let caller = msg::source();
    let one_tvara = state_mut.config.one_tvara;

    let user_info = match state_mut.users.get_mut(&caller) {
        Some(user_info) => user_info,
        None => {
            let error_message = ERROR_USER_NOT_FOUND.to_string();
            service.notify_error(error_message.clone());
            return Err(error_message);
        }
    };

    let amount_vara = amount
        .checked_mul(one_tvara)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    // Check if amount is valid
    if amount_vara > state_mut.config.max_collateral_withdraw || amount_vara <= 0 || amount_vara > user_info.available_to_withdraw_vara {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    if let Err(_err) = msg::send(
        caller,
        LiquidityEvent::WithdrawnVara { amount: amount }, 
        amount_vara
    ) {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Update balance 
    user_info.balance_vara = user_info
        .balance_vara
        .checked_sub(amount_vara)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

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
    service.notify_withdrawn_vara(amount);

    Ok(())
}