#![no_std]

use sails_rs::{
    prelude::*,
    gstd::{
        calls::GStdRemoting,
        msg,
    }
};
use sails_rs::collections::BTreeMap;

pub mod clients;
pub mod states;
pub mod services;

pub const BASE_RATE: u128 = 1_000_000; // 1% * DECIMALS_FACTOR
pub const RISK_MULTIPLIER: u128 = 1_200_000; // 1.2% * DECIMALS_FACTOR
pub const DEV_FEE: u128 = 1_500_000; // 1.5% * DECIMALS_FACTOR


//Import the Liquidity Injection LiquidityInjectionService from the services module
use services::vst_liquidity_injection::LiquidityInjectionService;

//Import the VftClient from the clients module
use clients::extended_vft_client::Vft as VftClient;

//Import the VstreetState from the states module
use crate::states::vstreet_state::VstreetState;


#[derive(Default)]
pub struct VstreetProgram;

#[sails_rs::program]
impl VstreetProgram {
    
    // Program's constructor
    pub fn new_with_vft(vft_contract_id: ActorId, ltv: u128) -> Self {
        LiquidityInjectionService::<VftClient<GStdRemoting>>::seed(
            msg::source(), 
            Some(vft_contract_id),
             0, 0, 0, 0, 
             BTreeMap::new(), 
              BASE_RATE, RISK_MULTIPLIER, 0, DEV_FEE, 0, 0, ltv, 0);

        Self
    }

    // Expose liquidity Injection service
    #[route("LiquidityInjectionService")]
    pub fn vstreet(&self)-> LiquidityInjectionService<VftClient<GStdRemoting>>
    {
        let vft_client = VftClient::new(GStdRemoting);
        LiquidityInjectionService::new(vft_client)
    }

}
