use core::fmt::Debug;
use sails_rs::{
    collections::BTreeMap,
    gstd::{msg, service},
    prelude::*,
};



#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Encode, Decode, TypeInfo)]
pub struct UserInfo {
    pub balance: u128,
    pub rewards: u128,
    pub rewards_withdrawn: u128,
    pub last_updated: u128,
    pub balance_usdc: u128,
    pub rewards_usdc: u128,
    pub rewards_usdc_withdrawn: u128,
    pub balance_vara: u128,
}

#[derive(Clone)]
pub struct VstreetState {
    pub owner: ActorId,
    pub vft_contract_id: Option<ActorId>,
    pub total_deposited: u128,
    pub total_borrowed: u128,
    pub available_rewards_pool: u128,
    pub total_rewards_distributed: u128,
    pub users: BTreeMap<ActorId, UserInfo>,
    pub base_rate: u128,
    pub risk_multiplier: u128,
    pub utilization_factor: u128,
    pub dev_fee: u128,
    pub interest_rate: u128,
    pub apr: u128,
}