
mod tests {
    use super::*;
    use gstd::testing::*;

    #[test]
    fn test_deposit_collateral() {
        let mut state = GlobalState::default();
        let amount = 100;

        // Call the deposit_collateral function
        state.deposit_collateral(amount).now_or_never();

        // Assert that the lender entry is created and the liquidity is updated
        assert_eq!(state.lenders.len(), 1);
        assert_eq!(state.lenders[&msg::source()].liquidity, amount);

        // Assert that the total_stablecoin_deposited is updated
        assert_eq!(state.total_stablecoin_deposited, amount);
    }

    #[test]
    fn test_withdraw_collateral() {
        let mut state = GlobalState::default();
        let amount = 100;

        // Add a lender entry with liquidity
        state.lenders.insert(
            msg::source(),
            UserLender {
                status: UserStatus::Active,
                liquidity: amount,
            },
        );

        // Call the withdraw_collateral function
        state.withdraw_collateral(amount).now_or_never();

        // Assert that the liquidity is updated
        assert_eq!(state.lenders[&msg::source()].liquidity, 0);

        // Assert that the total_stablecoin_deposited is updated
        assert_eq!(state.total_stablecoin_deposited, 0);
    }

    #[test]
    fn test_deposit_synthetic() {
        let mut state = GlobalState::default();
        let amount = 100;

        // Call the deposit_synthetic function
        state.deposit_synthetic(amount).now_or_never();

        // Assert that the borrower entry is created and the loanamount is updated
        assert_eq!(state.borrowers.len(), 1);
        assert_eq!(state.borrowers[&msg::source()].loanamount, amount / 2);

        // Assert that the total_syntetic_deposited is updated
        assert_eq!(state.total_syntetic_deposited, amount);
    }

    #[test]
    fn test_main() {
        // Create a test harness
        let mut harness = TestHarness::default();

        // Set up the initial state
        let state = GlobalState::default();
        harness.set_initial_state(state);

        // Set up the input message
        let action = Action::DepositFunds(100);
        harness.set_input_message(action);

        // Call the main function
        harness.call_handle();

        // Get the updated state
        let updated_state: GlobalState = harness.get_updated_state();

        // Assert the expected changes in the state
        assert_eq!(updated_state.total_stablecoin_deposited, 100);
        assert_eq!(updated_state.lenders[&msg::source()].liquidity, 100);
    }

}