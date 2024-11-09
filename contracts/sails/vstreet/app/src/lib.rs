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

//Import the BorrowWithCollateralService from the services module
use services::vst_borrow_with_vara::BorrowWithCollateralService;

//Import the VftClient from the clients module
use clients::extended_vft_client::Vft as VftClient;

//Import the VstreetState from the states module
use crate::states::vstreet_state::VstreetState;


#[derive(Default)]
pub struct VstreetProgram;

#[sails_rs::program]
impl VstreetProgram {
    
    // Program's constructor
    pub fn new_with_vft(vft_contract_id: ActorId) -> Self {
        LiquidityInjectionService::<VftClient<GStdRemoting>>::seed(
            msg::source(), 
            Some(vft_contract_id),
             0, 0, 0, 0, 
             BTreeMap::new(), 
             0, 0, 0, 0, 0, 0,);
             
        Self
    }

    // Expose liquidity Injection service
    #[route("LiquidityInjectionService")]
    pub fn vstreet(&self)-> LiquidityInjectionService<VftClient<GStdRemoting>>
    {
        let vft_client = VftClient::new(GStdRemoting);
        LiquidityInjectionService::new(vft_client)
    }

    // Expose BorrowWithCollateralService
    #[route("BorrowWithVaraService")]
    pub fn borrow_with_collateral(&self) -> BorrowWithCollateralService<VftClient<GStdRemoting>> {
        let vft_client = VftClient::new(GStdRemoting);
        BorrowWithCollateralService::new(vft_client)
    }
}
