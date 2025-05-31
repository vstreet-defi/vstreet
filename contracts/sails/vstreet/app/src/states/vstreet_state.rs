use core::fmt::Debug;
use sails_rs::{
    collections::BTreeMap,
    prelude::*,
};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Encode, Decode, TypeInfo)]
pub struct UserInfo {
    pub balance: u128,
    pub rewards: u128,
    pub rewards_withdrawn: u128,
    pub liquidity_last_updated: u128,
    pub borrow_last_updated: u128,
    pub balance_vara: u128,
    pub mla: u128,
    pub cv: u128,
    pub available_to_withdraw_vara: u128,
    pub loan_amount: u128,
    pub is_loan_active: bool,
    pub ltv: u128,
}

#[derive(Clone, Encode, TypeInfo)]
pub struct VstreetState {
    pub owner: ActorId,
    pub admins: Vec<ActorId>,
    pub vft_contract_id: Option<ActorId>,
    pub total_deposited: u128,
    pub total_borrowed: u128,
    pub available_rewards_pool: u128,
    pub total_rewards_distributed: u128,
    pub users: BTreeMap<ActorId, UserInfo>,
    pub utilization_factor: u128,
    pub interest_rate: u128,
    pub apr: u128,
    pub ltv: u128,
    pub config: Config,
}

#[derive(Clone, Encode, Decode, TypeInfo)]
pub struct Config {
    pub decimals_factor: u128,
    pub year_in_seconds: u128,
    pub base_rate: u128,
    pub risk_multiplier: u128,
    pub one_tvara: u128,
    pub vara_price: u128,
    pub dev_fee: u128,
    pub max_loan_amount: u128,
    pub max_collateral_withdraw: u128,
    pub max_liquidity_deposit: u128,
    pub max_liquidity_withdraw: u128,
    pub min_rewards_withdraw: u128
}

impl Default for Config {
    fn default() -> Self {
        Self {
            decimals_factor: 10_u128.pow(18),
            year_in_seconds: 31_536_000, // 365 * 24 * 60 * 60
            base_rate: 10_000,           // 0.01 * DECIMALS_FACTOR
            risk_multiplier: 40_000,     // 0.04 * DECIMALS_FACTOR
            one_tvara: 1_000_000_000_000, // Value of one TVara and Vara
            vara_price: 1000000,
            dev_fee: 15_000, // 1.5%
            max_loan_amount: 100000000000000000000,
            max_collateral_withdraw: 100000000000000000000,
            max_liquidity_deposit: 100000000000000000000,
            max_liquidity_withdraw: 100000000000000000000,
            min_rewards_withdraw: 100000
        }
    }
}