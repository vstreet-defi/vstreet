use sails_rs::{
    prelude::*,
};

pub const ERROR_TRANSFER_FAILED: &str = "Error in VFT Transfer call";
pub const ERROR_INVALID_AMOUNT: &str = "Invalid Amount";
pub const ERROR_USER_NOT_FOUND: &str = "User not found";
pub const ERROR_REWARDS_POOL_INSUFFICIENT: &str = "Not enough rewards in the pool";
pub const ERROR_USER_REWARDS_INSUFFICIENT: &str = "Not enough rewards to withdraw";
pub const ERROR_INSUFFICIENT_ADMIN_PRIVILEGES: &str = "Only an administrator can perform this action";
pub const ERROR_ADMIN_ALREADY_EXISTS: &str = "Admin already exists";
pub const ERROR_ADMIN_DOESNT_EXIST: &str = "Admin does not exist";

pub trait EventNotifier {
    fn notify_deposit(&mut self, amount: u128);
    fn notify_vft_seted(&mut self, actor_id: ActorId);
    fn notify_withdraw_liquidity(&mut self, amount: u128);
    fn notify_withdraw_rewards(&mut self, amount_withdrawn: u128);
    fn notify_error(&mut self, message: String);
    fn notify_total_borrowed_modified(&mut self, borrowed: u128);
    fn notify_available_rewards_pool_modified(&mut self, pool: u128);
    fn notify_deposited_vara(&mut self, amount: u128);
    fn notify_withdrawn_vara(&mut self, amount: u128);
    fn notify_loan_taken(&mut self, amount: u128);
    fn notify_loan_payed(&mut self, amount: u128);
    fn notify_rewards_calculated(&mut self, current_timestamp: u128, liquidity_last_updated: u128, time_elapsed: u128, apr: u128, decimals_factor: u128, interest_per_second: u128, rewards: u128);
}