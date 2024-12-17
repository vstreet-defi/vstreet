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

//Import the Liquidity Injection LiquidityInjectionService from the services module
use services::vst_liquidity_injection::LiquidityInjectionService;

//Import the VftClient from the clients module
use clients::extended_vft_client::Vft as VftClient;

//Import the Config state struct
use crate::states::vstreet_state::Config;

#[derive(Default)]
pub struct VstreetProgram;

#[sails_rs::program]
impl VstreetProgram {
    
    // Program's constructor
    pub fn new_with_vft(vft_contract_id: ActorId, ltv: u128) -> Self {
        let owner = msg::source();

        LiquidityInjectionService::<VftClient<GStdRemoting>>::seed(
            owner.clone(), 
            vec![owner],
            Some(vft_contract_id),
             0, 0, 0, 0, 
             BTreeMap::new(), 
             0, 0, 0, ltv);

        Self
    }

    // Expose liquidity Injection service
    #[route("LiquidityInjectionService")]
    pub fn vstreet(&self)-> LiquidityInjectionService<VftClient<GStdRemoting>>
    {
        let vft_client = VftClient::new(GStdRemoting);
        let config = Config::default();

        LiquidityInjectionService::new(vft_client, config)
    }

}
