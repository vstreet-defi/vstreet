use gstd::ActorId;
use gtest::{Program, System};

use io::{InitLiquidity, IoGlobalState, LiquidityAction};

const DECIMALS_FACTOR: u128 = 10_u128.pow(6);
const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60
const BLOCKS_IN_A_YEAR: u128 = YEAR_IN_SECONDS / 3;
const STABLECOIN_PROGRAM_ID: ActorId = ActorId::new([1; 32]);

fn initialize_contract(sys: &System) -> Program {
    sys.init_logger();
    let program = Program::current(sys);

    let res = program.send(
        2,
        InitLiquidity {
            stablecoin_address: STABLECOIN_PROGRAM_ID,
        },
    );
    assert!(!res.main_failed());

    program
}

#[test]
fn init_liquidity() {
    let sys = System::new();
    initialize_contract(&sys);
}

#[test]
fn deposit() {
    let sys = System::new();
    let program = initialize_contract(&sys);
    let deposit_amount: u128 = 1000; // 1000 USDC

    program.send(
        2,
        LiquidityAction::Deposit(deposit_amount),
    );

    let state: IoGlobalState = program.read_state(()).unwrap();

    assert_eq!(state.total_deposited, deposit_amount * DECIMALS_FACTOR);
    assert_eq!(state.users.get(&ActorId::from(2)).unwrap().balance, deposit_amount * DECIMALS_FACTOR);
}

#[test]
fn test_reward_allocation() {
    let sys = System::new();
    let program = initialize_contract(&sys);
    let deposit_amount: u128 = 1_000_000; // 1,000,000 USDC
    let user: ActorId = 2.into();

    program.send(
        2,
        LiquidityAction::Deposit(deposit_amount),
    );

    sys.spend_blocks(BLOCKS_IN_A_YEAR as u32);

    // Leer el estado del contrato para verificar las recompensas
    let state: IoGlobalState = program.read_state(()).unwrap();
    let user_info = state.users.get(&user).unwrap();

    // Calcular las recompensas esperadas manualmente
    let expected_rewards = (deposit_amount / 10) * DECIMALS_FACTOR; // 10% de ganancia anual

    // Imprimir las recompensas esperadas y las obtenidas
    println!("Expected rewards: {}", expected_rewards);
    println!("Expected rewards (USD): {}", expected_rewards / DECIMALS_FACTOR);
    println!("User rewards: {}", user_info.rewards);
    println!("User rewards (USD): {}", user_info.rewards / DECIMALS_FACTOR);

    // Verificar si las recompensas calculadas y las obtenidas son iguales
    assert_eq!(user_info.rewards, expected_rewards);
}
