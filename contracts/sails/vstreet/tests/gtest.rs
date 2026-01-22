use sails_rs::{calls::*, gtest::{calls::*, System}, ActorId};
use vstreet_client::traits::*;

const ACTOR_ID: u64 = 42;
const ACTOR_ID_2: u64 = 44;
const VFT_CONTRACT_ID: u64 = 43;
const LTV: u128 = 70;
const DEPOSIT_AMOUNT: u128 = 10_000_000_000;
const COLLATERAL_AMOUNT: u128 = 50_000_000_000_000; // 50 TVARA (1 TVARA = 1_000_000_000_000)

// Setup Helpers

async fn setup_system() -> (GTestRemoting, ActorId) {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);
    system.mint_to(ACTOR_ID_2, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);
    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), LTV)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    (remoting, program_id)
}

// Admin & Configuration Tests

#[tokio::test]
async fn test_contract_owner() {
    let (remoting, program_id) = setup_system().await;
    let service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let result = service_client
        .contract_owner()
        .recv(program_id)
        .await;
    
    assert!(result.is_ok());
    let owner = result.unwrap();
    assert!(owner.starts_with("0x"));
}

#[tokio::test]
async fn test_set_vft_contract_id() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let result = service_client
        .set_vft_contract_id(VFT_CONTRACT_ID.into())
        .send_recv(program_id)
        .await;

    assert!(result.is_ok());
    
    // Verify VFT contract ID was set
    let vft_id = service_client
        .vft_contract_id()
        .recv(program_id)
        .await;
    
    assert!(vft_id.is_ok());
    let vft_id_str = vft_id.unwrap();
    assert!(vft_id_str.starts_with("0x"));
}

#[tokio::test]
async fn test_set_ltv() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let new_ltv = 80u128;
    let result = service_client
        .set_ltv(new_ltv)
        .send_recv(program_id)
        .await;

    assert!(result.is_ok());
    assert!(result.unwrap().contains(&new_ltv.to_string()));
}

#[tokio::test]
async fn test_add_admin() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let result = service_client
        .add_admin(ACTOR_ID_2.into())
        .send_recv(program_id)
        .await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn test_remove_admin() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Add an admin
    let _ = service_client
        .add_admin(ACTOR_ID_2.into())
        .send_recv(program_id)
        .await;

    // Remove the admin
    let result = service_client
        .remove_admin(ACTOR_ID_2.into())
        .send_recv(program_id)
        .await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn test_set_vara_price() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let new_price = 5_000_000u128;
    let result = service_client
        .set_vara_price(new_price)
        .send_recv(program_id)
        .await;

    assert!(result.is_ok());
    assert!(result.unwrap().contains(&new_price.to_string()));
}

#[tokio::test]
async fn test_modify_available_rewards_pool() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let result = service_client
        .modify_available_rewards_pool(1_000_000)
        .send_recv(program_id)
        .await;

    assert!(result.is_ok());
}

// Liquidity Supply Tests

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_deposit_liquidity() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let result = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Deposit failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }

    // Verify user balance
    let balance = service_client
        .user_balance(ACTOR_ID.into())
        .recv(program_id)
        .await;
    
    assert!(balance.is_ok());
}

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_withdraw_liquidity() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    // Withdraw liquidity
    let withdraw_amount = DEPOSIT_AMOUNT / 2;
    let result = service_client
        .withdraw_liquidity(withdraw_amount)
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Withdrawal failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_withdraw_rewards() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    // Withdraw rewards
    let result = service_client
        .withdraw_rewards()
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Withdraw rewards failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_user_rewards() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    // Check user rewards
    let rewards_result = service_client
        .user_rewards(ACTOR_ID.into())
        .recv(program_id)
        .await;

    assert!(rewards_result.is_ok());
}

// Collateral Tests

#[tokio::test]
async fn test_deposit_collateral() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let result = service_client
        .deposit_collateral()
        .with_value(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Collateral deposit failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

#[tokio::test]
async fn test_withdraw_collateral() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit collateral
    let _ = service_client
        .deposit_collateral()
        .with_value(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await;

    // Withdraw collateral
    let withdraw_amount_tvara = 25u128;
    let result = service_client
        .withdraw_collateral(withdraw_amount_tvara)
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Collateral withdrawal failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

// Borrowing Tests

#[tokio::test]
#[ignore] // Requires actual VFT contract and liquidity pool
async fn test_take_loan() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit collateral
    let _ = service_client
        .deposit_collateral()
        .with_value(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await;

    // Deposit some liquidity to the pool
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    // Take a loan
    let loan_amount = DEPOSIT_AMOUNT / 4;
    let result = service_client
        .take_loan(loan_amount)
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Take loan failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

#[tokio::test]
#[ignore] // Requires actual VFT contract and active loan
async fn test_pay_loan() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit collateral and take a loan
    let _ = service_client
        .deposit_collateral()
        .with_value(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await;

    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    let loan_amount = DEPOSIT_AMOUNT / 4;
    let _ = service_client
        .take_loan(loan_amount)
        .send_recv(program_id)
        .await;

    // Pay partial loan
    let pay_amount = loan_amount / 2;
    let result = service_client
        .pay_loan(pay_amount)
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Pay loan failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

#[tokio::test]
#[ignore] // Requires actual VFT contract and active loan
async fn test_pay_all_loan() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit collateral and take a loan
    let _ = service_client
        .deposit_collateral()
        .with_value(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await;

    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    let loan_amount = DEPOSIT_AMOUNT / 4;
    let _ = service_client
        .take_loan(loan_amount)
        .send_recv(program_id)
        .await;

    // Pay all loan
    let result = service_client
        .pay_all_loan()
        .send_recv(program_id)
        .await;

    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Pay all loan failed: {:?}", e),
        Err(e) => panic!("Transaction error: {:?}", e),
    }
}

// Query Tests

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_user_balance_query() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit some liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    let balance = service_client
        .user_balance(ACTOR_ID.into())
        .recv(program_id)
        .await;

    assert!(balance.is_ok());
}

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_user_info_query() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit some liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    let user_info = service_client
        .user_info(ACTOR_ID.into())
        .recv(program_id)
        .await;

    assert!(user_info.is_ok());
    assert!(user_info.unwrap().contains("User Info:"));
}

#[tokio::test]
async fn test_all_users_query() {
    let (remoting, program_id) = setup_system().await;
    let service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let users = service_client
        .all_users()
        .recv(program_id)
        .await;

    assert!(users.is_ok());
}

#[tokio::test]
async fn test_contract_info_query() {
    let (remoting, program_id) = setup_system().await;
    let service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    let info = service_client
        .contract_info()
        .recv(program_id)
        .await;

    assert!(info.is_ok());
    let info_str = info.unwrap();
    assert!(info_str.contains("APR:"));
    assert!(info_str.contains("Interest Rate:"));
    assert!(info_str.contains("Total Deposited:"));
    assert!(info_str.contains("Total Borrowed:"));
}

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_total_deposited_query() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit some liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    let total = service_client
        .total_deposited()
        .recv(program_id)
        .await;

    assert!(total.is_ok());
}

// Integration & Edge Case Tests

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_full_lending_cycle() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit liquidity to pool
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await
        .expect("Deposit liquidity failed");

    // Deposit collateral
    let _ = service_client
        .deposit_collateral()
        .with_value(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await
        .expect("Deposit collateral failed");

    // Take a loan
    let loan_amount = DEPOSIT_AMOUNT / 4;
    let _ = service_client
        .take_loan(loan_amount)
        .send_recv(program_id)
        .await
        .expect("Take loan failed");

    // Check user info
    let user_info = service_client
        .user_info(ACTOR_ID.into())
        .recv(program_id)
        .await;
    assert!(user_info.is_ok());

    // Pay back loan
    let _ = service_client
        .pay_all_loan()
        .send_recv(program_id)
        .await
        .expect("Pay loan failed");

    // Withdraw collateral
    let _ = service_client
        .withdraw_collateral(COLLATERAL_AMOUNT)
        .send_recv(program_id)
        .await
        .expect("Withdraw collateral failed");
}

#[tokio::test]
#[ignore] // Requires actual VFT contract deployment
async fn test_interest_accrual() {
    let (remoting, program_id) = setup_system().await;
    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit liquidity
    let _ = service_client
        .deposit_liquidity(DEPOSIT_AMOUNT)
        .send_recv(program_id)
        .await;

    // Check initial rewards
    let initial_rewards = service_client
        .user_rewards(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    // Perform another action to trigger time passage
    let _ = service_client
        .contract_info()
        .recv(program_id)
        .await;

    // Check rewards again (should be same or higher)
    let new_rewards = service_client
        .user_rewards(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    assert!(new_rewards >= initial_rewards);
}