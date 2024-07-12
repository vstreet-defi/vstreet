use gstd::ActorId;
use gtest::{Program, System};

use io::{BASE_RATE, DECIMALS_FACTOR, InitLiquidity, LiquidityAction, LiquidityPool, RISK_MULTIPLIER, YEAR_IN_SECONDS};

const BLOCKS_IN_A_YEAR: u32 = (YEAR_IN_SECONDS / 3) as u32;
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
    let program = initialize_contract(&sys);
    let state: LiquidityPool = program.read_state(()).unwrap();
    assert_eq!(state.stablecoin_address, STABLECOIN_PROGRAM_ID);
}

#[test]
fn deposit() {
    let sys = System::new();
    let program = initialize_contract(&sys);
    let deposit_amount: u128 = 1000; // 1000 USDC
    let res = program.send(2, LiquidityAction::Deposit(deposit_amount));
    assert!(!res.main_failed());

    let state: LiquidityPool = program.read_state(()).unwrap();
    assert_eq!(state.total_deposited, deposit_amount * DECIMALS_FACTOR);
    assert_eq!(state.users.get(&ActorId::from(2)).unwrap().balance, deposit_amount * DECIMALS_FACTOR);
}

#[test]
fn withdraw() {
    let sys = System::new();
    let program = initialize_contract(&sys);
    let deposit_amount: u128 = 1000; // 1000 USDC
    let withdraw_amount: u128 = 500; // 500 USDC

    program.send(2, LiquidityAction::Deposit(deposit_amount));

    let res = program.send(2, LiquidityAction::WithdrawLiquidity(withdraw_amount));
    assert!(!res.main_failed());

    let state: LiquidityPool = program.read_state(()).unwrap();
    assert_eq!(state.total_deposited, (deposit_amount - withdraw_amount) * DECIMALS_FACTOR);
    assert_eq!(state.users.get(&ActorId::from(2)).unwrap().balance, (deposit_amount - withdraw_amount) * DECIMALS_FACTOR);

    program.send(2, LiquidityAction::WithdrawLiquidity(withdraw_amount));
    let state: LiquidityPool = program.read_state(()).unwrap();
    assert_eq!(state.total_deposited, 0);
    assert_eq!(state.users.get(&ActorId::from(2)).unwrap().balance, 0);
}


#[test]
fn test_interest_rate_calculation() {
    let sys = System::new();
    let program = initialize_contract(&sys);
    let deposit_amount: u128 = 1_000_000; // 1,000,000 USDC
    let borrowed_amount: u128 = 500_000; // 500,000 USDC

    program.send(
        2,
        LiquidityAction::ModifyTotalBorrowed(borrowed_amount),
    );
    program.send(
        2,
        LiquidityAction::Deposit(deposit_amount),
    );

    let state: LiquidityPool = program.read_state(()).unwrap();

    let expected_interest_rate = calculate_expected_interest_rate(deposit_amount, borrowed_amount);

    println!("Expected Interest Rate: {}", expected_interest_rate);
    println!("Actual Interest Rate: {}", state.interest_rate);

    assert_eq!(state.interest_rate, expected_interest_rate);
}

#[test]
fn test_reward_allocation() {
    let sys = System::new();
    let program = initialize_contract(&sys);
    let deposit_amount: u128 = 1_000_000; // 1,000,000 USDC
    let borrowed_amount: u128 = 500_000; // 500,000 USDC
    let user: ActorId = 2.into();

    program.send(
        2,
        LiquidityAction::ModifyTotalBorrowed(borrowed_amount),
    );

    program.send(
        2,
        LiquidityAction::Deposit(deposit_amount),
    );

    sys.spend_blocks(BLOCKS_IN_A_YEAR);

    // Leer el estado del contrato para verificar las recompensas
    let state: LiquidityPool = program.read_state(()).unwrap();
    let user_info = state.users.get(&user).unwrap();

    // Calcular las recompensas esperadas manualmente
    let time_in_seconds: u128 = YEAR_IN_SECONDS;
    let expected_rewards = calculate_expected_rewards(deposit_amount, state.interest_rate, time_in_seconds);

    println!("Expected rewards: {}", expected_rewards);
    println!("Expected rewards (USD): {}", expected_rewards / DECIMALS_FACTOR);
    println!("User rewards: {}", user_info.rewards);
    println!("User rewards (USD): {}", user_info.rewards / DECIMALS_FACTOR);

    // Verificar si las recompensas calculadas y las obtenidas son iguales
    assert_eq!(user_info.rewards, expected_rewards);
}

// TODO TEST WITHDRAW REWARDS

// Interest rate
fn calculate_expected_interest_rate(deposit_amount: u128, borrowed_amount: u128) -> u128 {
    let utilization_factor = if deposit_amount == 0 {
        0
    } else {
        (borrowed_amount * DECIMALS_FACTOR) / deposit_amount
    };

    let interest_rate = BASE_RATE + (utilization_factor * RISK_MULTIPLIER / DECIMALS_FACTOR);

    interest_rate
}

// User rewards
fn calculate_expected_rewards(deposit_amount: u128, interest_rate: u128, time_in_seconds: u128) -> u128 {
    (deposit_amount * interest_rate * time_in_seconds) / YEAR_IN_SECONDS
}