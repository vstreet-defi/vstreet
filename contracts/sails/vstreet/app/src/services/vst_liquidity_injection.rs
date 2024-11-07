#![no_std]

use sails_rs::calls::{Call, Query};
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
    TotalBorrowedModified{borrowed:u128},
    AvailableRewardsPoolModified{pool:u128},
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

    //Service's query user-balance
    pub fn user_balance(&self, user: ActorId) -> String {
        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();
        user_info.balance_usdc.to_string()
    }

    //Service's query all users
    pub fn all_users(&self) -> String {
        let state = self.state_ref();
        let users = state.users.keys().map(|id| id.to_string()).collect::<Vec<_>>();
        users.join(", ")
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
    pub async fn deposit(&mut self, amount: u128) -> String {
        debug!("Depositing funds");
        if amount == 0 {
            self.notify_on(LiquidityEvent::Error("Zero Amount".to_string()) )
            .expect("Notification Error");
            return "Zero Amount".to_string();
        }

     
        let state_mut = self.state_mut();

        state_mut.apr = self.calculate_apr();
        debug!("New APR after deposit: {}", state_mut.apr);
        
        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = state_mut.users
            .entry(msg::source())
            .or_insert_with(|| Self::create_new_user(current_timestamp));

        user_info.balance = user_info.balance.saturating_add(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        state_mut.total_deposited = state_mut.total_deposited.saturating_add(amount * DECIMALS_FACTOR);

        
       // Transfer tokens from user to contract
        let result = self.transfer_tokens(msg::source(), exec::program_id(), amount).await;

        if let Err(_) = result {
            self.notify_on(LiquidityEvent::Error("Error in VFT Transfer call".to_string()))
                .expect("Notification Error");
            return "Error in VFT Transfer call".to_string();
        }

        // Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);

        // Notify the deposit event
        let amount_deposited: u128 = amount * DECIMALS_FACTOR;
        self.notify_on(LiquidityEvent::Deposit { amount : amount_deposited })
                .expect("Notification Error");

                format!("New Liquidity Deposit: {:?}", amount_deposited)

        
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

    //Transfer tokens
    async fn transfer_tokens(&mut self, from: ActorId, to: ActorId, amount: u128) -> Result<(), String> {

        let state = self.state_ref();

        let response = self
        .vft_client
        .transfer_from(from, to, U256::from(amount))
        .send_recv(state.vft_contract_id.unwrap())
        .await;

        let Ok(transfer_status) = response else {
            self.notify_on(LiquidityEvent::Error("Error in VFT Contract".to_string()))
                .expect("Notification Error");
            return Err("Error in VFT Contract".to_string());
        };
    
        if !transfer_status {
            self.notify_on(LiquidityEvent::Error("Operation was not performed".to_string()))
                .expect("Notification Error");
            return Err("Operation was not performed".to_string());
        }
    
        Ok(())
    }

    pub async fn modify_total_borrowed(&mut self, amount: u128) -> Result<(), String> {
        let state_mut = self.state_mut();
        state_mut.total_borrowed = amount * DECIMALS_FACTOR;
        state_mut.apr = self.calculate_apr();

        // Notify the TotalBorrowedModified event
        let amount_borrowed: u128 = amount * DECIMALS_FACTOR;
        self.notify_on(LiquidityEvent::TotalBorrowedModified { borrowed : amount_borrowed })
                .expect("Notification Error");

        Ok(())
    }

    pub async fn modify_available_rewards_pool(&mut self, amount: u128) -> Result<(), String> {
        let state_mut = self.state_mut();
        state_mut.available_rewards_pool = amount * DECIMALS_FACTOR;

        // Notify the AvailableRewardsPoolModified event
        let new_rewards_pool: u128 = amount * DECIMALS_FACTOR;
        self.notify_on(LiquidityEvent::AvailableRewardsPoolModified { pool : new_rewards_pool })
                .expect("Notification Error");

        Ok(())
    }

    // Borrowers APR (INTEREST RATE + DEV FEE)
    fn calculate_apr(&mut self) -> u128 {
        let state_mut = self.state_mut();

        state_mut.utilization_factor = if state_mut.total_deposited == 0 {
            0
        } else {
            (state_mut.total_borrowed * DECIMALS_FACTOR) / state_mut.total_deposited
        };

        state_mut.interest_rate = state_mut.base_rate + (state_mut.utilization_factor * state_mut.risk_multiplier / DECIMALS_FACTOR);
        state_mut.dev_fee = state_mut.interest_rate / 100;

        state_mut.interest_rate + state_mut.dev_fee
    }
}
