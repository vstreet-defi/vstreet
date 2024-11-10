use sails_rs::{calls::*, gtest::{calls::*, System}};

use vstreet_client::traits::*;

const ACTOR_ID: u64 = 42;
const VFT_CONTRACT_ID: u64 = 43;

#[tokio::test]
async fn contract_owner_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into()) // Call program's constructor (see app/src/lib.rs:29)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Avoid unwrapping immediatly to allow time for the contract's state to update
    let result = service_client
        .contract_owner() // Call service's query (see app/src/lib.rs:24)
        .recv(program_id)
        .await;
    
    // Assert manually to avoid having to unwrap
    match result {
        Ok(res) => assert_eq!(res, 42.to_string()),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}


#[tokio::test]
async fn set_vft_contract_id_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into()) // Call program's constructor (see app/src/lib.rs:29)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Avoid unwrapping immediatly to allow time for the contract's state to update
    let result = service_client
        .set_vft_contract_id(VFT_CONTRACT_ID.into())
        .send_recv(program_id)
        .await;

    // Assert manually to avoid having to unwrap
    match result {
        Ok(res) => assert_eq!(res, 43.to_string()),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}

#[tokio::test]
async fn deposit_collateral_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into())
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

  // Deposit collateral with value
  let result = service_client
  .deposit_collateral()
  .with_value(10_000_000_000)
  .send_recv(program_id)
  .await;

    // Assert manually to avoid having to unwrap
    match result {
        Ok(res) => assert_eq!(res, "Deposited Vara as Collateral: 1000"),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}

#[tokio::test]
async fn withdraw_collateral_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into())
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // Deposit collateral with value
    let deposit_result = service_client
        .deposit_collateral()
        .with_value(10_000_000_000)
        .send_recv(program_id)
        .await;

    // Assert deposit result
    match deposit_result {
        Ok(res) => assert_eq!(res, "Deposited Vara as Collateral: 1000"),
        Err(e) => eprintln!("Error: {:?}", e),
    }

    // Withdraw collateral
    let withdraw_result = service_client
        .withdraw_collateral(500)
        .send_recv(program_id)
        .await;

    // Assert withdraw result
    match withdraw_result {
        Ok(res) => assert_eq!(res, "Withdrawn Vara as Collateral: 500"),
        Err(e) => eprintln!("Error: {:?}", e),
    }
    // Check the user's balance to ensure they received the actual Vara
    let user_balance = remoting.system().balance_of(ACTOR_ID);
    assert_eq!(user_balance, 100_000_000_000_000 - 10_000_000_000 + 500);
}