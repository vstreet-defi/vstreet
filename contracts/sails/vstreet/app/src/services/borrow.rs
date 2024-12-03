use sails_rs::{
    prelude::*,
    gstd::{
        msg,
        exec,
    }
};

use crate::clients::extended_vft_client::traits::Vft;
use crate::services::vst_liquidity_injection::LiquidityInjectionService;
//use crate::services::vst_liquidity_injection::LiquidityEvent;
use crate::services::vst_liquidity_injection::DECIMALS_FACTOR;

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

    let user_info = if let Some(user_info) = state_mut.users.get_mut(&caller) {
        user_info
    } else {
        service.notify_error_event("User not found".to_string()).await;
        return Err("User not found".to_string());
    };

    let mla = user_info.mla;
    let loan_amount = user_info.loan_amount;
    let future_loan_amount = loan_amount.saturating_add(amount * DECIMALS_FACTOR);

    if amount == 0 || future_loan_amount > mla {
        service.notify_error_event("Invalid Amount".to_string()).await;
        return sails_rs::Err("Invalid Amount".to_string());
    }

    // Transfer tokens from contract to user
    let result = service.transfer_tokens(exec::program_id(), msg::source(), amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        service.notify_error_event("Error in VFT Transfer call".to_string()).await;
        return sails_rs::Err("Error in VFT Transfer call".to_string());
    }

    // Update loan status and total borrowed
    user_info.is_loan_active = true;
    user_info.loan_amount = user_info.loan_amount.saturating_add(amount * DECIMALS_FACTOR);
    user_info.loan_amount_usdc = user_info.loan_amount / DECIMALS_FACTOR;
    service.update_user_ltv(caller);
    state_mut.total_borrowed = state_mut.total_borrowed.saturating_add(amount * DECIMALS_FACTOR);
    service.calculate_apr();

    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);

    //service.notify_event(LiquidityEvent::LoanTaken{ amount : amount}).await;

    Ok(())
}

//Pay All Loan
pub async fn pay_all_loan<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>
) -> String
where
    VftClient: Vft,
{
    let state_mut = service.state_mut();
    let user_info = state_mut.users.get_mut(&msg::source()).unwrap();

    let loan_amount = user_info.loan_amount / DECIMALS_FACTOR;

    if loan_amount == 0 {
        service.notify_error_event("Invalid Amount".to_string()).await;
        return "Invalid Amount".to_string();
    }

    // Transfer tokens from user to contract
    let result = service.transfer_tokens(msg::source(), exec::program_id(), loan_amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        service.notify_error_event("Error in VFT Transfer call".to_string()).await;
        return "Error in VFT Transfer call".to_string();
    }

    // Update loan amount and total borrowed
    user_info.is_loan_active = false;
    user_info.loan_amount = 0;
    user_info.loan_amount_usdc = 0;
    service.update_user_ltv(msg::source());
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);
    state_mut.total_borrowed = state_mut.total_borrowed.saturating_sub(loan_amount * DECIMALS_FACTOR);

    //service.notify_event(LiquidityEvent::LoanPayed{amount : loan_amount}).await;

    format!("New Loan Payed: {:?}", loan_amount)
}

//Pay Loan
pub async fn pay_loan<VftClient>(
    service: &mut LiquidityInjectionService<VftClient>,
    amount: u128
) -> String
where
    VftClient: Vft,
{
    let state_mut = service.state_mut();
    let user_info = state_mut.users.get_mut(&msg::source()).unwrap();

    let loan_amount = user_info.loan_amount_usdc;

    if amount == 0 || amount > loan_amount {
        service.notify_error_event("Invalid Amount".to_string()).await;
        return "Invalid Amount".to_string();
    }

    // Transfer tokens from user to contract
    let result = service.transfer_tokens(msg::source(), exec::program_id(), amount).await;

    // Check if transfer was successful
    if let Err(_) = result {
        service.notify_error_event("Error in VFT Transfer call".to_string()).await;
        return "Error in VFT Transfer call".to_string();
    }

    // Update loan amount and total borrowed
    user_info.loan_amount = user_info.loan_amount.saturating_sub(amount * DECIMALS_FACTOR);
    user_info.loan_amount_usdc = user_info.loan_amount_usdc.saturating_sub(amount);
    service.update_user_ltv(msg::source());
    LiquidityInjectionService::<VftClient>::update_user_available_to_withdraw_vara(user_info);
    state_mut.total_borrowed = state_mut.total_borrowed.saturating_sub(amount * DECIMALS_FACTOR);

    if user_info.loan_amount == 0 {
        user_info.is_loan_active = false;
    }
    
    //service.notify_event(LiquidityEvent::LoanPayed{amount : amount}).await;

    format!("New Loan Payed: {:?}", amount)
}