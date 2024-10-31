#![no_std]

use sails_rs::{
    prelude::*,
    gstd::{
        calls::GStdRemoting,
        msg,
        debug,
        exec,
    }
};
use sails_rs::collections::BTreeMap;


use crate::clients::extended_vft_client::traits::Vft;
use crate::states::vstreet_state::VstreetState;
use crate::states::vstreet_state::UserInfo;

pub const DECIMALS_FACTOR: u128 = 10_u128.pow(6);
pub const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60
pub const BASE_RATE: u128 = 10000; // 0.01 * DECIMALS_FACTOR
pub const RISK_MULTIPLIER: u128 = 40000; // 0.04 * DECIMALS_FACTOR


static mut VSTREET_STATE: Option<VstreetState> = None;

#[derive(Encode, TypeInfo)]
enum LiquidityEvent {
    Deposit{amount:u128},
    VFTseted(ActorId),
    Withdraw(u128),
    WithdrawRewards(u128),
    Error(String),
}

// #[derive(Encode, Decode, TypeInfo)]
// #[codec(crate = sails_rs::scale_codec)]
// #[scale_info(crate = sails_rs::scale_info)]
// pub enum LiquidityError {
//     ZeroAmount,
//     InvalidAmount,
//     ZeroRewards,
//     UserNotFound,
//     TransferFailed,
// }

pub struct LiquidityInjectionService<VftClient>{
    pub vft_client: VftClient
}


#[sails_rs::service(events = LiquidityEvent)]
impl<VftClient> LiquidityInjectionService<VftClient> 
where VftClient: Vft, {

    // Service's constructor
    pub fn seed(
        owner: ActorId,
        vft_contract_id: Option<ActorId>,
        total_deposited: u128,
        total_borrowed: u128,
        available_rewards_pool: u128,
        total_rewards_distributed: u128,
        users: BTreeMap<ActorId, UserInfo>,
        base_rate: u128,
        risk_multiplier: u128,
        utilization_factor: u128,
        dev_fee: u128,
        interest_rate: u128,
        apr: u128,

      
    ) {
        unsafe {
            VSTREET_STATE = Some(
                VstreetState {
                    owner,
                    vft_contract_id,
                    total_deposited,
                    total_borrowed,
                    available_rewards_pool,
                    total_rewards_distributed,
                    users,
                    base_rate,
                    risk_multiplier,
                    utilization_factor,
                    dev_fee,
                    interest_rate,
                    apr,
                   
                }
            );
        };
    }

    pub fn new(
        vft_client: VftClient
    ) -> Self {
        Self {
            vft_client
        }
    }

     // ## Change vft contract id
    // Only the contract owner can perform this action
    pub fn set_vft_contract_id(&mut self, vft_contract_id: ActorId) -> String {
        let state = self.state_mut();

        if msg::source() != state.owner {
            self.notify_on(LiquidityEvent::Error("Only the contract owner can perform this action".to_string()))
                .expect("Notification Error");
                 return "Only the contract owner can perform this action".to_string();
        }

        state.vft_contract_id = Some(vft_contract_id);

        self.notify_on(LiquidityEvent::VFTseted(vft_contract_id))
                .expect("Notification Error");

        let new_vft_contract_id = state.vft_contract_id.unwrap();
        format!("New VFT Contract ID set: {:?}", new_vft_contract_id)
        
    }

    //Querys
    // Service's query owner of the contract
    pub fn contract_owner(&self) -> String {
        let state = self.state_ref();
        state.owner.to_string()
    } 

    //Service's query seted VFT of the contract
    pub fn vft_contract_id(&self) -> String {
        let state = self.state_ref();
        let contract_id = state.vft_contract_id.unwrap();
        contract_id.to_string() 
    } 

    // State mutable & ref functions
    fn state_mut(&self) -> &'static mut VstreetState {
        let state = unsafe { VSTREET_STATE.as_mut() };
        debug_assert!(state.is_none(), "state is not started!");
        unsafe { state.unwrap_unchecked() }
    }

    fn state_ref(&self) -> &'static VstreetState {
        let state = unsafe { VSTREET_STATE.as_ref() };
        debug_assert!(state.is_none(), "state is not started!");
        unsafe { state.unwrap_unchecked() }
    }
    

    // DepositLiquidty method
    pub fn deposit(&mut self, user: ActorId, amount: u128)  {
        debug!("Depositing funds");
        if amount == 0 {
            self.notify_on(LiquidityEvent::Error("Zero Amount".to_string()) )
            .expect("Notification Error");
            return;
        }

     
        let state_mut = self.state_mut();

        // self.apr = self.calculate_apr();
        // debug!("New APR after deposit: {}", self.apr);
        
        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = state_mut.users
            .entry(user)
            .or_insert_with(|| Self::create_new_user(current_timestamp));

        user_info.balance = user_info.balance.saturating_add(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        state_mut.total_deposited = state_mut.total_deposited.saturating_add(amount * DECIMALS_FACTOR);

        
        // Self::transfer_tokens(&self.stablecoin_address, msg::source(), exec::program_id(), amount).await?;
        // Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);

        let amountDeposited: u128 = amount * DECIMALS_FACTOR;

        self.notify_on(LiquidityEvent::Deposit { amount: amountDeposited })
                .expect("Notification Error");

        
    }

    fn create_new_user(timestamp: u128) -> UserInfo {
        UserInfo {
            balance: 0,
            rewards: 0,
            rewards_withdrawn: 0,
            last_updated: timestamp,
            balance_usdc: 0,
            rewards_usdc: 0,
            rewards_usdc_withdrawn: 0,
        }
    }

}
