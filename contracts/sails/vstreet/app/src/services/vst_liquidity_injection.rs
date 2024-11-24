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
const ONE_TVARA: u128 = 1_000_000_000_000; // Value of one TVara and Vara


static mut VSTREET_STATE: Option<VstreetState> = None;

#[derive(Encode, TypeInfo)]
enum LiquidityEvent {
    Deposit{amount:u128},
    VFTseted(ActorId),
    WithdrawLiquidity{amount:u128},
    WithdrawRewards{amount_withdrawn:u128},
    Error(String),
    TotalBorrowedModified{borrowed:u128},
    AvailableRewardsPoolModified{pool:u128},
    DepositedVara{amount:u128},
    WithdrawnVara{amount:u128},
    LoanTaken{amount:u128},
    LoanPayed{amount:u128},
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
        ltv: u128,
        vara_price: u128,

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
                    ltv,
                    vara_price,
                   
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

    //Private methods

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

    //Change LTV
    // Only the contract owner can perform this action
    // LTV is a percentage value represented here in double digit format (e.g. 85% = 85)
    pub fn set_ltv(&mut self, ltv: u128) -> String {
        let state = self.state_mut();

        if msg::source() != state.owner {
            self.notify_on(LiquidityEvent::Error("Only the contract owner can perform this action".to_string()))
                .expect("Notification Error");
                 return "Only the contract owner can perform this action".to_string();
        }

        state.ltv = ltv;

        format!("New LTV set: {:?}", ltv)
    }

    //Change Vara Price
    // Only the contract owner can perform this action
    pub async fn set_vara_price(&mut self, vara_price: u128) -> String {
        let state = self.state_mut();

        if msg::source() != state.owner {
            self.notify_on(LiquidityEvent::Error("Only the contract owner can perform this action".to_string()))
                .expect("Notification Error");
                 return "Only the contract owner can perform this action".to_string();
        }

        state.vara_price = vara_price;
        
        //Todo: Check if needed async call
        self.update_cv_and_mla_for_all_users();

        //update ltv for all borrowers
        self.update_all_ltv().await;
        
        self.liquidate_all_loans().await;

        format!("New Vara Price set: {:?}", vara_price)
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

    //Service's query user-available-collateral
    pub fn user_available_to_withdraw(&self, user: ActorId, collateral: String) -> String {
        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();

        match collateral.as_str() {
            "VARA" => user_info.available_to_withdraw_vara.to_string(),
            _ => "INVALID COLLATERAL".to_string(),
        }
    }

    //Service's query user-rewards
    pub fn user_rewards(&self, user: ActorId) -> String {
        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();
        user_info.rewards_usdc.to_string()
    }

    //Service's query user info
    pub fn user_info(&self, user: ActorId) -> String {
        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();
        format!("User Info: {:?}", user_info)
    }

    //Service's query all users
    pub fn all_users(&self) -> String {
        let state = self.state_ref();
        let users = state.users.keys().map(|id| id.to_string()).collect::<Vec<_>>();
        users.join(", ")
    }

    //Service's query APR , interest rate, dev fee, total borrowed, available rewards pool, base rate, risk multiplier, utilization factor
    pub fn contract_info(&self) -> String {
        let state = self.state_ref();
        format!("APR: {}, Interest Rate: {}, Dev Fee: {}, Total Borrowed: {}, Available Rewards Pool: {}, Base Rate: {}, Risk Multiplier: {}, Utilization Factor: {}",
            state.apr, state.interest_rate, state.dev_fee, state.total_borrowed, state.available_rewards_pool, state.base_rate, state.risk_multiplier, state.utilization_factor)
    }
   

    //Service's query total deposited
    pub fn total_deposited(&self) -> String {
        let state = self.state_ref();
        state.total_deposited.to_string()
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
    
    //Public methods
    // DepositLiquidty method
    pub async fn deposit(&mut self, amount: u128) -> String {
        self.update_all_rewards();
        self.update_all_collateral_available_to_withdraw();

        debug!("Depositing funds");
        if amount == 0 {
            self.notify_on(LiquidityEvent::Error("Zero Amount".to_string()) )
            .expect("Notification Error");
            return "Zero Amount".to_string();
        }
     
        let state_mut = self.state_mut();

        state_mut.apr = self.calculate_apr();
        debug!("New APR after deposit: {}", state_mut.apr);

          
       // Transfer tokens from user to contract
       let result = self.transfer_tokens(msg::source(), exec::program_id(), amount).await;

       if let Err(_) = result {
           self.notify_on(LiquidityEvent::Error("Error in VFT Transfer call".to_string()))
               .expect("Notification Error");
           return "Error in VFT Transfer call".to_string();
       }

       // Update user balance
        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = state_mut.users
            .entry(msg::source())
            .or_insert_with(|| Self::create_new_user(current_timestamp));

        user_info.balance = user_info.balance.saturating_add(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        state_mut.total_deposited = state_mut.total_deposited.saturating_add(amount * DECIMALS_FACTOR);

        Self::update_user_rewards(user_info, current_timestamp, state_mut.interest_rate);

        // Notify the deposit event
        let amount_deposited: u128 = amount * DECIMALS_FACTOR;
        self.notify_on(LiquidityEvent::Deposit { amount : amount_deposited })
                .expect("Notification Error");

                format!("New Liquidity Deposit: {:?}", amount_deposited)

        
    }

    // WithdrawLiquidity method
    pub async fn withdraw_liquidity(&mut self, amount: u128) -> String {
        self.update_all_rewards();
        self.update_all_collateral_available_to_withdraw();

        let state_mut = self.state_mut();

        state_mut.apr = self.calculate_apr();
        debug!("New APR after deposit: {}", state_mut.apr);

        let current_timestamp = exec::block_timestamp() as u128;

        let user_info = state_mut.users.get_mut(&msg::source()).unwrap();

        // Check if amount is valid
        if amount == 0 || amount > user_info.balance {
            self.notify_on(LiquidityEvent::Error("Invalid Amount".to_string()))
                .expect("Notification Error");
            return "Invalid Amount".to_string();
        }

        // Transfer tokens from contract to user
        let result = self.transfer_tokens(exec::program_id(), msg::source(), amount).await;

        // Check if transfer was successful
        if let Err(_) = result {
            self.notify_on(LiquidityEvent::Error("Error in VFT Transfer call".to_string()))
                .expect("Notification Error");
            return "Error in VFT Transfer call".to_string();
        }

        // Update balance and rewards
        user_info.balance = user_info.balance.saturating_sub(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        state_mut.total_deposited = state_mut.total_deposited.saturating_sub(amount * DECIMALS_FACTOR);
        Self::update_user_rewards(user_info, current_timestamp, state_mut.interest_rate);

        // Notify the withdraw event
        let amount_withdrawn: u128 = amount * DECIMALS_FACTOR;
        self.notify_on(LiquidityEvent::WithdrawLiquidity{amount: amount_withdrawn})
                .expect("Notification Error");

        format!("New Liquidity Withdrawn: {:?}", amount_withdrawn)
    }

   
    //Deposit Vara as Collateral
    pub async fn deposit_collateral(&mut self) -> String {
      
        let value = msg::value();
        let caller = msg::source();

        if value == 0 {
           self.notify_on(LiquidityEvent::Error("No value sent".to_string()))
                .expect("Notification Error");
            return "No value sent".to_string();
        }


        let state_mut = self.state_mut();



        // Update user collateral
        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = state_mut.users
            .entry(msg::source())
            .or_insert_with(|| Self::create_new_user(current_timestamp));

        user_info.balance_vara = user_info.balance_vara.saturating_add(value);

        //Update CV and MLA
        self.calculate_cv(caller);
        self.calculate_mla(caller);

        // Calculate available to withdraw vara
        Self::update_user_available_to_withdraw_vara(user_info);

        let amount = value / ONE_TVARA;

        // Notify the deposit event
        self.notify_on(LiquidityEvent::DepositedVara { amount: amount})
            .expect("Notification Error");

        format!("Deposited Vara as Collateral: {:?}", value)
    }

    //Withdraw Vara as Collateral
    pub async fn withdraw_collateral(&mut self, amount: u128) -> Result<(), String> {

        let caller = msg::source();
        let state_mut = self.state_mut();
        
        let user_info = if let Some(user_info) = state_mut.users.get_mut(&caller) {
                user_info
            } else {
                self.notify_on(LiquidityEvent::Error("User not found".to_string()))
                    .expect("Notification Error");
                return sails_rs::Err("User not found".to_string());
            };

        let amount_vara = amount * ONE_TVARA;

        // Check if amount is valid
        if amount_vara == 0 || amount_vara >= user_info.available_to_withdraw_vara {
            self.notify_on(LiquidityEvent::Error("Invalid Amount".to_string()))
                .expect("Notification Error");
                return sails_rs::Err("Invalid Amount".to_string());
        }

        msg::send(
            msg::source(),
            LiquidityEvent::WithdrawnVara { amount: amount }, 
            amount_vara
        )
        .expect("Error sending varas");

        // Update balance 
        user_info.balance_vara = user_info.balance_vara.saturating_sub(amount_vara);

        //Update CV and MLA
        self.calculate_cv(caller);
        self.calculate_mla(caller);

        self.update_user_ltv(caller);
       
        // Calculate available to withdraw vara
        Self::update_user_available_to_withdraw_vara(user_info);

        self.liquidate_user_loan(caller).await;
       
        let amount_withdrawn = amount;

        // Notify the withdraw event
        self.notify_on(LiquidityEvent::WithdrawnVara{ amount: amount_withdrawn})
            .expect("Notification Error");

        Ok(())
    }

    //Internal methods
     // Create new user
     fn create_new_user(timestamp: u128) -> UserInfo {
        UserInfo {
            balance: 0,
            rewards: 0,
            rewards_withdrawn: 0,
            last_updated: timestamp,
            balance_usdc: 0,
            rewards_usdc: 0,
            rewards_usdc_withdrawn: 0,
            balance_vara: 0,
            mla: 0,
            cv: 0,
            available_to_withdraw_vara: 0,
            loan_amount: 0,
            loan_amount_usdc: 0,
            is_loan_active: false,
            ltv: 0,

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
        self.update_all_rewards();
        self.update_all_collateral_available_to_withdraw();

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
        self.update_all_rewards();
        self.update_all_collateral_available_to_withdraw();

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

    pub fn update_all_rewards(&mut self) {
        let state_mut = self.state_mut();
        state_mut.apr = self.calculate_apr();

        let current_timestamp = exec::block_timestamp() as u128;

        for user_info in state_mut.users.values_mut() {
            Self::update_user_rewards(user_info, current_timestamp, state_mut.interest_rate);
        }
    }

    fn update_user_rewards(user_info: &mut UserInfo, current_timestamp: u128, interest_rate: u128) {
        let time_diff_seconds = (current_timestamp - user_info.last_updated) / 1000;
        if time_diff_seconds > 0 {
            let rewards = (user_info.balance * interest_rate * time_diff_seconds) / (YEAR_IN_SECONDS * DECIMALS_FACTOR);
            debug!("Calculated rewards: {}", rewards);
            user_info.rewards = user_info.rewards.saturating_add(rewards);
            user_info.rewards_usdc = user_info.rewards / DECIMALS_FACTOR;
            user_info.last_updated = current_timestamp;
        }
    }

    // Update all user's collateral available to withdraw.
    pub fn update_all_collateral_available_to_withdraw(&mut self) {
        let state_mut = self.state_mut();

        for user_info in state_mut.users.values_mut() {
            Self::update_user_available_to_withdraw_vara(user_info);
        }
    }

    // Calculate Collateral Available to Withdraw
    fn update_user_available_to_withdraw_vara(user_info: &mut UserInfo) {

        if user_info.is_loan_active == false {
            user_info.available_to_withdraw_vara = user_info.balance_vara;

        }else{
             //ToDo: Calculate using borrowed.
        let locked = (user_info.balance_vara * user_info.ltv) / 100;
        let available = user_info.balance_vara.saturating_sub(locked);
        debug!("Calculated available: {}", available);

        user_info.available_to_withdraw_vara = available;

        }
       
    }
    
    //Calculate Collateral Value
    // This functions need to be running every time vara price changes or user balance vara changes
    fn calculate_cv(&mut self, user: ActorId) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();
        let vara_price = state_mut.vara_price;

        let tvaras = user_info.balance_vara / ONE_TVARA;

        let cv = tvaras * vara_price;
        user_info.cv = cv;

        format!("CV: {:?}", cv)
    }

    //Calculate Maximum Loan Amount
    fn calculate_mla(&mut self, user: ActorId) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();

        let mla = (user_info.cv * state_mut.ltv) / 100;
        user_info.mla = mla;

        format!("MLA: {:?}", mla)
    }

    fn update_cv_and_mla_for_all_users(&mut self) {
        let state_mut = self.state_mut();

        for user in state_mut.users.keys().cloned().collect::<Vec<_>>() {
            let user_info = state_mut.users.get(&user).unwrap();
            if user_info.balance_vara >= ONE_TVARA {
                self.calculate_cv(user);
                self.calculate_mla(user);
            }
        }
    }

    fn update_user_ltv(&mut self, user: ActorId) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();

        user_info.ltv = (user_info.loan_amount * 100) / user_info.cv;

        format!("LTV: {:?}", user_info.ltv)
    }

    //Take Loan
    pub async fn take_loan(&mut self, amount: u128) -> Result<(), String> {
        let state_mut = self.state_mut();
        let caller = msg::source();

        let user_info = if let Some(user_info) = state_mut.users.get_mut(&caller) {
            user_info
        } else {
            self.notify_on(LiquidityEvent::Error("User not found".to_string()))
                .expect("Notification Error");
            return Err("User not found".to_string());
        };


        let mla = user_info.mla;
        let loan_amount = user_info.loan_amount;
        let future_loan_amount = loan_amount.saturating_add(amount);

        if amount == 0 || future_loan_amount > mla {
            self.notify_on(LiquidityEvent::Error("Invalid Amount".to_string()))
                .expect("Notification Error");
                return sails_rs::Err("Invalid Amount".to_string());
        }

        // Transfer tokens from contract to user
        let result = self.transfer_tokens(exec::program_id(), msg::source(), amount).await;

        // Check if transfer was successful
        if let Err(_) = result {
            self.notify_on(LiquidityEvent::Error("Error in VFT Transfer call".to_string()))
                .expect("Notification Error");
                return sails_rs::Err("Error in VFT Transfer call".to_string());
        }

        // Update loan status and total borrowed
        user_info.is_loan_active = true;
        user_info.loan_amount = user_info.loan_amount.saturating_add(amount);
        user_info.loan_amount_usdc = user_info.loan_amount / DECIMALS_FACTOR;
        self.update_user_ltv(caller);
        state_mut.total_borrowed = state_mut.total_borrowed.saturating_add(amount * DECIMALS_FACTOR);
        Self::update_user_available_to_withdraw_vara(user_info);

        self.notify_on(LiquidityEvent::LoanTaken{ amount : amount})
                .expect("Notification Error");

        Ok(())
    }

    //Pay All Loan
    pub async fn pay_all_loan(&mut self) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&msg::source()).unwrap();

        let loan_amount = user_info.loan_amount;

        if loan_amount == 0 {
            self.notify_on(LiquidityEvent::Error("Invalid Amount".to_string()))
                .expect("Notification Error");
            return "Invalid Amount".to_string();
        }

        // Transfer tokens from user to contract
        let result = self.transfer_tokens(msg::source(), exec::program_id(), loan_amount).await;

        // Check if transfer was successful
        if let Err(_) = result {
            self.notify_on(LiquidityEvent::Error("Error in VFT Transfer call".to_string()))
                .expect("Notification Error");
            return "Error in VFT Transfer call".to_string();
        }

        // Update loan amount and total borrowed
        user_info.is_loan_active = false;
        user_info.loan_amount = 0;
        user_info.loan_amount_usdc = 0;
        state_mut.total_borrowed = state_mut.total_borrowed.saturating_sub(loan_amount * DECIMALS_FACTOR);

        self.notify_on(LiquidityEvent::LoanPayed{amount : loan_amount})
                .expect("Notification Error");

        format!("New Loan Payed: {:?}", loan_amount)
    }

    //Pay Loan
    pub async fn pay_loan(&mut self, amount: u128) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&msg::source()).unwrap();

        let loan_amount = user_info.loan_amount;
        let amount_usdc = amount * DECIMALS_FACTOR;

        if amount == 0 || amount > loan_amount {
            self.notify_on(LiquidityEvent::Error("Invalid Amount".to_string()))
                .expect("Notification Error");
            return "Invalid Amount".to_string();
        }

        // Transfer tokens from user to contract
        let result = self.transfer_tokens(msg::source(), exec::program_id(), amount).await;

        // Check if transfer was successful
        if let Err(_) = result {
            self.notify_on(LiquidityEvent::Error("Error in VFT Transfer call".to_string()))
                .expect("Notification Error");
            return "Error in VFT Transfer call".to_string();
        }

        // Update loan amount and total borrowed
        user_info.loan_amount = user_info.loan_amount.saturating_sub(amount);
        user_info.loan_amount_usdc = user_info.loan_amount_usdc.saturating_sub(amount_usdc);
        self.update_user_ltv(msg::source());
        state_mut.total_borrowed = state_mut.total_borrowed.saturating_sub(amount * DECIMALS_FACTOR);

        if(user_info.loan_amount == 0) {
            user_info.is_loan_active = false;
        }
        
        self.notify_on(LiquidityEvent::LoanPayed{amount : amount})
                .expect("Notification Error");

        format!("New Loan Payed: {:?}", amount)
    }
  
  pub async fn withdraw_rewards(&mut self) -> Result<(), String> {
        self.update_all_rewards();
        self.update_all_collateral_available_to_withdraw();
        let state_mut = self.state_mut();
        state_mut.apr = self.calculate_apr();
        let user = msg::source();

        let current_timestamp = exec::block_timestamp() as u128;

        let user_info = if let Some(user_info) = state_mut.users.get_mut(&user) {
            user_info
        } else {
            self.notify_on(LiquidityEvent::Error("User not found".to_string()))
                .expect("Notification Error");
            return Err("User not found".to_string());
        };

        Self::update_user_rewards(user_info, current_timestamp, state_mut.interest_rate);
        let rewards_to_withdraw = user_info.rewards.saturating_sub(user_info.rewards_withdrawn);

        if rewards_to_withdraw == 0 || rewards_to_withdraw > state_mut.available_rewards_pool {
            self.notify_on(LiquidityEvent::Error("Invalid amount".to_string()))
                .expect("Notification Error");
                 return Err("Invalid amount".to_string());
        }

        user_info.rewards = user_info.rewards.saturating_sub(rewards_to_withdraw);
        user_info.rewards_withdrawn = user_info.rewards_withdrawn.saturating_add(rewards_to_withdraw);
        user_info.rewards_usdc = user_info.rewards_usdc.saturating_sub(user_info.rewards_usdc);
        user_info.rewards_usdc_withdrawn = user_info.rewards_usdc_withdrawn.saturating_add(user_info.rewards_usdc);

        state_mut.total_rewards_distributed = state_mut.total_rewards_distributed.saturating_add(rewards_to_withdraw);

        self.transfer_tokens(
            exec::program_id(),
            msg::source(),
            rewards_to_withdraw / DECIMALS_FACTOR
        ).await.expect("Transfer tokens failed during the rewards withdrawal");

        Self::update_user_rewards(user_info, current_timestamp, state_mut.interest_rate);
        
        // Notify the WithdrawRewards event
        let amount: u128 = rewards_to_withdraw / DECIMALS_FACTOR;
        self.notify_on(LiquidityEvent::WithdrawRewards { amount_withdrawn : amount })
                .expect("Notification Error");

        Ok(())
    }

    //Update all user's ltv
    async fn update_all_ltv(&mut self) {
        let state_mut = self.state_mut();

        for user in state_mut.users.keys().cloned().collect::<Vec<_>>() {
                let user_info = state_mut.users.get(&user).unwrap();
                if user_info.is_loan_active == true {
                self.update_user_ltv(user);
                }
        }
    }


    //Liquidate Loan
    async fn liquidate_user_loan(&mut self, user: ActorId) -> Result<(), String> {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();

        let loan_amount = user_info.loan_amount;
        let balance_vara = user_info.balance_vara;
      
        let locked = (balance_vara * user_info.ltv) / 100;

    //Condition to liquidate loan
        if user_info.ltv >= state_mut.ltv {

        //Set user loan status to false and reset all loan info values
            user_info.balance_vara = user_info.balance_vara.saturating_sub(locked);
            user_info.is_loan_active = false;
            user_info.loan_amount = 0;
            user_info.loan_amount_usdc = 0;
            self.update_user_ltv(user);
            self.calculate_cv(user);
            self.calculate_mla(user);
            state_mut.total_borrowed = state_mut.total_borrowed.saturating_sub(loan_amount);
            Self::update_user_available_to_withdraw_vara(user_info);

        }

            Ok(())      
    }

    //Liquidate all loans
    async fn liquidate_all_loans(&mut self) -> Result<(), String> {
        let state_mut = self.state_mut();

        for user in state_mut.users.keys().cloned().collect::<Vec<_>>() {
            let user_info = state_mut.users.get(&user).unwrap();
            //check if user has an active loan
            if user_info.is_loan_active == true {
                self.liquidate_user_loan(user).await;
            } 
        }

        Ok(())
    }
}