#![no_std]

use sails_rs::prelude::*;
use session_service::*;

pub mod services;
pub mod clients;
pub mod states;

use clients::extended_vft_client::Vft as VftClient;
use crate::states::vstreet_state;

use services::vst_liquidity_injection::{LiquidityInjectionService, ActionsForSession};

session_service::generate_session_system!(ActionsForSession);

pub struct Program;

#[program]
impl Program {
    pub fn new(
        owner: ActorId,
        admins: Vec<ActorId>,
        vft_contract_id: Option<ActorId>,
        total_deposited: u128,
        total_borrowed: u128,
        available_rewards_pool: u128,
        total_rewards_distributed: u128,
        users: sails_rs::collections::BTreeMap<ActorId, services::vstreet_state::UserInfo>,
        utilization_factor: u128,
        interest_rate: u128,
        apr: u128,
        ltv: u128,
        config: services::vstreet_state::Config,
    ) -> Self {
        LiquidityInjectionService::<services::vst_liquidity_injection::VftClient>::seed(
            owner,
            admins,
            vft_contract_id,
            total_deposited,
            total_borrowed,
            available_rewards_pool,
            total_rewards_distributed,
            users,
            utilization_factor,
            interest_rate,
            apr,
            ltv,
            config,
        );
        SessionService::init(Default::default());
        Self
    }

    #[route("Service")]
    pub fn service(&self) -> LiquidityInjectionService<services::vst_liquidity_injection::VftClient> {
        LiquidityInjectionService::new(services::vst_liquidity_injection::VftClient::default())
    }

    #[route("Session")]
    pub fn session(&self) -> SessionService {
        SessionService::new()
    }
}
