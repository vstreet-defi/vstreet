use gstd::{collections::BTreeMap, ActorId, Encode};
use gtest::{Program, System};
use io::{InitLiquidity, LiquidityAction, LiquidityEvent, IoGlobalState, Error};

const DECIMALS_FACTOR: u128 = 10_u128.pow(18);
const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60

fn init_liquidity(sys: &System) -> Program<'_> {
    let program = Program::current(sys);

    let res = program.send(
        1,
        InitLiquidity {
            stablecoin_address: ActorId::from([1; 32]),
        },
    );

    // Verificamos que la inicialización sea exitosa.
    assert!(res.contains(&(1, Ok::<LiquidityEvent, Error>(LiquidityEvent::Initialized).encode())));

    program
}

#[test]
fn test_deposit_and_rewards() {
    let sys = System::new();
    sys.init_logger();

    let liquidity = init_liquidity(&sys);

    let user: u64 = 2; // ActorId se genera automáticamente desde el tipo `u64`
    let deposit_amount = 1_000_000_000_000_000_000u128;

    // Registrar usuario en el sistema
    sys.mint_to(user, deposit_amount * 10); // Mint some tokens to the user for testing

    // Send deposit action
    let res = liquidity.send(user, LiquidityAction::Deposit(deposit_amount));
    assert!(res.contains(&(user, Ok::<LiquidityEvent, Error>(LiquidityEvent::Deposited(deposit_amount)).encode())));

    // Simulate the passage of time (1 year)
    sys.spend_blocks((YEAR_IN_SECONDS / 12) as u32); // Simulate 1 month
    sys.spend_blocks((YEAR_IN_SECONDS / 12 * 11) as u32); // Simulate the remaining 11 months

    // Send withdraw rewards action
    let res = liquidity.send(user, LiquidityAction::WithdrawRewards);
    assert!(res.contains(&(user, Ok::<LiquidityEvent, Error>(LiquidityEvent::RewardsWithdrawn(deposit_amount / 10)).encode()))); // 10% of deposit_amount

    // Check the state after rewards withdrawal
    let state: IoGlobalState = liquidity.read_state(()).expect("Unable to read state");
    assert_eq!(state.users[&ActorId::from([2; 32])].rewards, 0);
    assert_eq!(state.total_deposited, deposit_amount);
    assert_eq!(state.users[&ActorId::from([2; 32])].balance, deposit_amount);
}

#[test]
fn test_withdraw_liquidity() {
    let sys = System::new();
    sys.init_logger();

    let liquidity = init_liquidity(&sys);

    let user: u64 = 2; // ActorId se genera automáticamente desde el tipo `u64`
    let deposit_amount = 1_000_000_000_000_000_000u128;

    // Registrar usuario en el sistema
    sys.mint_to(user, deposit_amount * 10); // Mint some tokens to the user for testing

    // Send deposit action
    let res = liquidity.send(user, LiquidityAction::Deposit(deposit_amount));
    assert!(res.contains(&(user, Ok::<LiquidityEvent, Error>(LiquidityEvent::Deposited(deposit_amount)).encode())));

    // Simulate the passage of time (half a year)
    sys.spend_blocks((YEAR_IN_SECONDS / 2) as u32);

    // Send withdraw liquidity action
    let withdraw_amount = 500_000_000_000_000_000u128; // Withdraw half the deposit
    let res = liquidity.send(user, LiquidityAction::WithdrawLiquidity(withdraw_amount));
    assert!(res.contains(&(user, Ok::<LiquidityEvent, Error>(LiquidityEvent::LiquidityWithdrawn(withdraw_amount)).encode())));

    // Check the state after withdrawal
    let state: IoGlobalState = liquidity.read_state(()).expect("Unable to read state");
    assert_eq!(state.total_deposited, deposit_amount - withdraw_amount);
    assert_eq!(state.users[&ActorId::from([2; 32])].balance, deposit_amount - withdraw_amount);
}
