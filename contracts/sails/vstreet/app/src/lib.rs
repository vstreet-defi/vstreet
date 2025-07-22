#![no_std]

use sails_rs::{prelude::*, collections::BTreeMap};
use session_service::*;

pub mod services;
pub mod clients;
pub mod states;


use clients::extended_vft_client::Vft as VftClient;
use crate::states::vstreet_state;
use sails_rs::gstd::calls::GStdRemoting;
use crate::states::vstreet_state::Config as VSTConfig;

use services::vst_liquidity_injection::{LiquidityInjectionService, ActionsForSession, self};

use session_service::*;
generate_session_system!(ActionsForSession);

pub struct VstreetProgram;

#[program]
impl VstreetProgram {
    pub fn new(
        owner: ActorId,
        admins: Vec<ActorId>,
        vft_contract_id: Option<ActorId>,
        total_deposited: u128,
        total_borrowed: u128,
        available_rewards_pool: u128,
        total_rewards_distributed: u128,
        // users: sails_rs::collections::BTreeMap<ActorId, vstreet_state::UserInfo>,
        utilization_factor: u128,
        interest_rate: u128,
        apr: u128,
        ltv: u128,
        config: Config,
        vstreetConfig: VSTConfig
    ) -> Self {
        LiquidityInjectionService::<VftClient<GStdRemoting>>::seed(
            owner,
            admins,
            vft_contract_id,
            total_deposited,
            total_borrowed,
            available_rewards_pool,
            total_rewards_distributed,
            BTreeMap::new(),
            utilization_factor,
            interest_rate,
            apr,
            ltv,
            vstreetConfig,
        );

        SessionService::init(config);
        Self
    }

    #[route("Service")]
    pub fn service(&self) -> LiquidityInjectionService<VftClient<GStdRemoting>>{
        let vft_client = VftClient::new(GStdRemoting);
        // LiquidityInjectionService::new(vst_liquidity_injection::VftClient::default())
        LiquidityInjectionService::new(vft_client)
    }

    #[route("Session")]
    pub fn session(&self) -> SessionService {
        SessionService::new()
    }
}
