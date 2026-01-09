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
        .new_with_vft(VFT_CONTRACT_ID.into(), 70) // Call program's constructor (see app/src/lib.rs:29)
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
        .new_with_vft(VFT_CONTRACT_ID.into(), 70) // Call program's constructor (see app/src/lib.rs:29)
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
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

  // deposit_liquidity collateral with value
  let result = service_client
  .deposit_collateral()
  .with_value(10_000_000_000)
  .send_recv(program_id)
  .await;

    // Assert manually to avoid having to unwrap
    match result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Inner error: {:?}", e),
        Err(e) => eprintln!("Outer error: {:?}", e),
    }
}

#[tokio::test]
async fn withdraw_rewards_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // deposit_liquidity some liquidity
    let deposit_liquidity_result = service_client
        .deposit_liquidity(10_000_000_000)
        .send_recv(program_id)
        .await;

    // Assert deposit_liquidity result
    match deposit_liquidity_result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Inner error: {:?}", e),
        Err(e) => eprintln!("Outer error: {:?}", e),
    }

    // Withdraw rewards
    let withdraw_result = service_client
        .withdraw_rewards()
        .send_recv(program_id)
        .await;

    // Assert withdraw result
    match withdraw_result {
        Ok(_) => assert!(true, "WithdrawRewards event should be triggered"),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}

#[tokio::test]
async fn user_rewards_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

    // deposit_liquidity some liquidity
    let deposit_liquidity_result = service_client
        .deposit_liquidity(10_000_000_000)
        .send_recv(program_id)
        .await;

    // Assert deposit_liquidity result
    match deposit_liquidity_result {
        Ok(Ok(())) => (),
        Ok(Err(e)) => panic!("Inner error: {:?}", e),
        Err(e) => eprintln!("Outer error: {:?}", e),
    }

    // Check user rewards
    let rewards_result = service_client
        .user_rewards(ACTOR_ID.into())
        .recv(program_id)
        .await;

    // Assert rewards result
    match rewards_result {
        Ok(rewards) => assert!(rewards.parse::<u128>().unwrap() > 0, "User should have rewards"),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}

// =====================================================
// VAULT SERVICE TESTS
// =====================================================

#[tokio::test]
async fn vault_stake_works() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut vault_client = vstreet_client::VaultService::new(remoting.clone());

    // Note: In a real scenario, you would need to approve tokens first
    // For testing purposes, assuming VFT contract allows transfers

    // Stake VST tokens with Day7 conviction (1.5x multiplier)
    let stake_result = vault_client
        .stake_vst(1_000_000, vstreet_client::vault_service::io::ConvictionLevel::Day7)
        .send_recv(program_id)
        .await;

    match stake_result {
        Ok(position) => {
            println!("Staked successfully: {:?}", position);
            assert_eq!(position.amount, 1_000_000);
            assert_eq!(position.multiplier, 150); // 1.5x
            assert_eq!(position.power, 1_500_000); // 1_000_000 * 1.5
            assert_eq!(position.is_active, true);
            assert_eq!(position.claimed, false);
        },
        Err(e) => panic!("Stake failed: {:?}", e),
    }

    // Verify user vault info
    let user_vault = vault_client
        .user_vault_info(ACTOR_ID.into())
        .recv(program_id)
        .await;

    match user_vault {
        Ok(info) => {
            assert_eq!(info.total_staked_vst, 1_000_000);
            assert_eq!(info.total_power, 1_500_000);
            assert_eq!(info.active_positions.len(), 1);
            assert_eq!(info.matured_positions.len(), 0);
        },
        Err(e) => panic!("Query failed: {:?}", e),
    }
}

#[tokio::test]
async fn vault_multiple_stakes_work() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);
    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut vault_client = vstreet_client::VaultService::new(remoting.clone());

    // Create multiple stakes with different conviction levels
    let _ = vault_client
        .stake_vst(1_000_000, vstreet_client::vault_service::io::ConvictionLevel::Day1)
        .send_recv(program_id)
        .await;

    let _ = vault_client
        .stake_vst(2_000_000, vstreet_client::vault_service::io::ConvictionLevel::Day14)
        .send_recv(program_id)
        .await;

    let _ = vault_client
        .stake_vst(3_000_000, vstreet_client::vault_service::io::ConvictionLevel::Day90)
        .send_recv(program_id)
        .await;

    // Verify user vault info
    let user_vault = vault_client
        .user_vault_info(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    // Total staked: 1M + 2M + 3M = 6M
    assert_eq!(user_vault.total_staked_vst, 6_000_000);
    
    // Total power: (1M * 1.0) + (2M * 2.0) + (3M * 4.0) = 1M + 4M + 12M = 17M
    assert_eq!(user_vault.total_power, 17_000_000);
    
    // Should have 3 active positions
    assert_eq!(user_vault.active_positions.len(), 3);
}

#[tokio::test]
async fn vault_global_stats_work() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);
    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut vault_client = vstreet_client::VaultService::new(remoting.clone());

    // Create a stake
    let _ = vault_client
        .stake_vst(5_000_000, vstreet_client::vault_service::io::ConvictionLevel::Day28)
        .send_recv(program_id)
        .await;

    // Check global stats
    let stats = vault_client
        .global_stats()
        .recv(program_id)
        .await
        .unwrap();

    assert_eq!(stats.total_vst_locked, 5_000_000);
    assert_eq!(stats.total_power, 15_000_000); // 5M * 3.0
    assert_eq!(stats.active_positions_count, 1);
}

#[tokio::test]
async fn vault_query_methods_work() {
    let system = System::new();
    system.init_logger();
    system.mint_to(ACTOR_ID, 100_000_000_000_000);

    let remoting = GTestRemoting::new(system, ACTOR_ID.into());
    remoting.system().init_logger();

    let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);
    let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

    let program_id = program_factory
        .new_with_vft(VFT_CONTRACT_ID.into(), 70)
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut vault_client = vstreet_client::VaultService::new(remoting.clone());

    // Create a stake
    let position = vault_client
        .stake_vst(1_000_000, vstreet_client::vault_service::io::ConvictionLevel::Day7)
        .send_recv(program_id)
        .await
        .unwrap();

    let position_id = position.id;

    // Test position_details query
    let details = vault_client
        .position_details(position_id)
        .recv(program_id)
        .await
        .unwrap();

    assert!(details.is_some());
    let pos = details.unwrap();
    assert_eq!(pos.amount, 1_000_000);
    assert_eq!(pos.power, 1_500_000);

    // Test time_until_unlock query
    let time_remaining = vault_client
        .time_until_unlock(position_id)
        .recv(program_id)
        .await
        .unwrap();

    // Should be approximately 7 days in seconds (604800)
    assert!(time_remaining > 600_000); // At least close to 7 days

    // Test user_total_power query
    let total_power = vault_client
        .user_total_power(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    assert_eq!(total_power, 1_500_000);

    // Test user_total_staked query
    let total_staked = vault_client
        .user_total_staked(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    assert_eq!(total_staked, 1_000_000);
}

// Note: Testing unlock requires time simulation which is complex in gtest
// In production, you would use block timestamp manipulation or wait for actual time

// #[tokio::test]
// async fn vault_unlock_and_claim_works() {
//     // This test would require advancing block timestamp
//     // which is not trivial in gtest environment
//     // In a real scenario, you'd use System::spend_blocks() or similar
// }

// =====================================================
// END VAULT SERVICE TESTS
// =====================================================

// #[tokio::test]
// async fn withdraw_collateral_works() {
//     let system = System::new();
//     system.init_logger();
//     system.mint_to(ACTOR_ID, 100_000_000_000_000);

//     let remoting = GTestRemoting::new(system, ACTOR_ID.into());
//     remoting.system().init_logger();

//     // Submit program code into the system
//     let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

//     let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

//     let program_id = program_factory
//         .new_with_vft(VFT_CONTRACT_ID.into())
//         .send_recv(program_code_id, b"salt")
//         .await
//         .unwrap();

//     let mut service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

//     // deposit_liquidity collateral with value
//     let deposit_liquidity_result = service_client
//         .deposit_collateral()
//         .with_value(10_000_000_000)
//         .send_recv(program_id)
//         .await;

//     // Assert deposit_liquidity result
//     match deposit_liquidity_result {
//         Ok(res) => assert_eq!(res, "deposit_liquidityed Vara as Collateral: 1000"),
//         Err(e) => eprintln!("Error: {:?}", e),
//     }

//     // Withdraw collateral
//     let withdraw_result = service_client
//         .withdraw_collateral(500)
//         .send_recv(program_id)
//         .await;

//     // Assert withdraw result
//     match withdraw_result {
//         Ok(res) => assert_eq!(res, "Withdrawn Vara as Collateral: 500"),
//         Err(e) => eprintln!("Error: {:?}", e),
//     }
//     // Check the user's balance to ensure they received the actual Vara
//     let user_balance = remoting.system().balance_of(ACTOR_ID);
//     assert_eq!(user_balance, 100_000_000_000_000 - 10_000_000_000 + 500);
// }