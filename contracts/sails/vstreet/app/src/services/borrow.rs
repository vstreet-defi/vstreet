use sails_rs::{
    prelude::*,
    gstd::{
        msg,
        exec,
    }
};

use crate::clients::extended_vft_client::traits::Vft;
use crate::services::vst_liquidity_injection::LiquidityInjectionService;
use crate::services::utils::{
    EventNotifier,
    ERROR_TRANSFER_FAILED,
    ERROR_INVALID_AMOUNT,
    ERROR_USER_NOT_FOUND
};

// Public methods

//Take Loan
pub async fn take_loan<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128,
) -> Result<(), String> 
where
    VftClient: Vft,
{
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

    let mla = user_info.mla;
    let loan_amount = user_info.loan_amount;

    let scaled_amount = amount
        .checked_mul(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    let future_loan_amount = loan_amount
        .checked_add(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if amount > state_mut.config.max_loan_amount || amount == 0 || future_loan_amount > mla {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return Err(error_message);
    }

    // Transfer tokens from contract to user
    let result = service.transfer_tokens(exec::program_id(), caller, amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Update loan status and total borrowed
    user_info.is_loan_active = true;
    
    user_info.loan_amount = user_info
        .loan_amount
        .checked_add(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    state_mut.total_borrowed = state_mut
        .total_borrowed
        .checked_add(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    service.update_user_ltv(caller);
    let _ = service.calculate_apr();
    let _ = service.calculate_interest_rate();

    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);

    service.notify_loan_taken(amount);

    let _ = service.calculate_all_loan_interest_rate_amounts();

    Ok(())
}

//Pay All Loan
pub async fn pay_all_loan<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>
) -> Result<(), String>
where
    VftClient: Vft,
{
    let _ = service.calculate_all_loan_interest_rate_amounts();

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

    let loan_amount = user_info
        .loan_amount
        .checked_div(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if loan_amount == 0 {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    //loan_amount = loan_amount.ceil();

    // Transfer tokens from user to contract
    let result = service.transfer_tokens(caller, exec::program_id(), loan_amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Update loan amount and total borrowed
    user_info.is_loan_active = false;
    user_info.loan_amount = 0;

    state_mut.total_borrowed = state_mut
        .total_borrowed
        .checked_sub(
            user_info
                .loan_amount
                .checked_mul(decimals_factor)
                .ok_or_else(|| {
                    let error_message = ERROR_INVALID_AMOUNT.to_string();
                    service.notify_error(error_message.clone());
                    error_message
                })?,
        )
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;
    
    service.update_user_ltv(caller);
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);
    
    service.notify_loan_payed(loan_amount);

    let _ = service.calculate_apr();
    let _ = service.calculate_interest_rate();

    Ok(())
}

//Pay Loan
pub async fn pay_loan<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128
) -> Result<(), String>
where
    VftClient: Vft,
{
    let _ = service.calculate_all_loan_interest_rate_amounts();

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

    let loan_amount = user_info.loan_amount;
    let scaled_amount = amount
        .checked_mul(decimals_factor)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if amount > state_mut.config.max_loan_amount || amount == 0 || scaled_amount > loan_amount {
        let error_message = ERROR_INVALID_AMOUNT.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Transfer tokens from user to contract
    let result = service.transfer_tokens(caller, exec::program_id(), amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        let error_message = ERROR_TRANSFER_FAILED.to_string();
        service.notify_error(error_message.clone());
        return sails_rs::Err(error_message);
    }

    // Update loan amount and total borrowed
    user_info.loan_amount = user_info
        .loan_amount
        .checked_sub(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    state_mut.total_borrowed = state_mut
        .total_borrowed
        .checked_sub(scaled_amount)
        .ok_or_else(|| {
            let error_message = ERROR_INVALID_AMOUNT.to_string();
            service.notify_error(error_message.clone());
            error_message
        })?;

    if user_info.loan_amount == 0 {
        user_info.is_loan_active = false;
    }

    service.update_user_ltv(caller);
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);
    
    service.notify_loan_payed(amount);

    let _ = service.calculate_apr();
    let _ = service.calculate_interest_rate();

    Ok(())
}