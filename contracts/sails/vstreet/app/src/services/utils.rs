use sails_rs::{
    prelude::*,
};

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
}