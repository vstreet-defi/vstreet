use sails_rs::{calls::*, gtest::{calls::*, System}};

use vstreet_client::traits::*;

const ACTOR_ID: u64 = 42;
const VFT_CONTRACT_ID: u64 = 43;

// #[tokio::test]
// async fn do_something_works() {
//     let system = System::new();
//     system.init_logger();
//     system.mint_to(ACTOR_ID, 100_000_000_000_000);

//     let remoting = GTestRemoting::new(system, ACTOR_ID.into());
//     remoting.system().init_logger();

//     // Submit program code into the system
//     let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

//     let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

//     let program_id = program_factory
//         .new(VFT_CONTRACT_ID.into()) // Call program's constructor (see app/src/lib.rs:29)
//         .send_recv(program_code_id, b"salt")
//         .await
//         .unwrap();

//     // let mut service_client = vstreet_client::Vstreet::new(remoting.clone());

//     // let result = service_client
//     //     .do_something() // Call service's method (see app/src/lib.rs:14)
//     //     .send_recv(program_id)
//     //     .await
//     //     .unwrap();

//     assert!(program_id.is_valid(), "Program ID should not be None");
// }

// #[tokio::test]
// async fn get_something_works() {
//     let system = System::new();
//     system.init_logger();
//     system.mint_to(ACTOR_ID, 100_000_000_000_000);

//     let remoting = GTestRemoting::new(system, ACTOR_ID.into());
//     remoting.system().init_logger();

//     // Submit program code into the system
//     let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

//     let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

//     let program_id = program_factory
//         .new() // Call program's constructor (see app/src/lib.rs:29)
//         .send_recv(program_code_id, b"salt")
//         .await
//         .unwrap();

//     let service_client = vstreet_client::Vstreet::new(remoting.clone());

//     let result = service_client
//         .get_something() // Call service's query (see app/src/lib.rs:19)
//         .recv(program_id)
//         .await
//         .unwrap();

//     assert_eq!(result, "Hello from Vstreet!".to_string());
// }

// #[tokio::test]
// async fn contract_owner_works() {
//     let system = System::new();
//     system.init_logger();
//     system.mint_to(ACTOR_ID, 100_000_000_000_000);

//     let remoting = GTestRemoting::new(system, ACTOR_ID.into());
//     remoting.system().init_logger();

//     // Submit program code into the system
//     let program_code_id = remoting.system().submit_code(vstreet::WASM_BINARY);

//     let program_factory = vstreet_client::VstreetFactory::new(remoting.clone());

//     let program_id = program_factory
//         .new_with_vft(VFT_CONTRACT_ID.into()) // Call program's constructor (see app/src/lib.rs:29)
//         .send_recv(program_code_id, b"salt")
//         .await
//         .unwrap();

//     let service_client = vstreet_client::LiquidityInjectionService::new(remoting.clone());

//     let result = service_client
//         .contract_owner() // Call service's query (see app/src/lib.rs:24)
//         .recv(program_id)
//         .await
//         .unwrap();

//     assert_eq!(result, "42".to_string());
// }


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

    let result = service_client
        .set_vft_contract_id(VFT_CONTRACT_ID.into()) // Call service's method (see app/src/lib.rs:14)
        .send_recv(program_id)
        .await
        .unwrap();

    assert_eq!(result, 43.to_string());
}