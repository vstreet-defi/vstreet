use sails_rs::calls::Call;
use sails_rs::{
    prelude::*,
    gstd::{
        msg,
        debug,
        exec,
    }
};
use sails_rs::collections::BTreeMap;

use crate::clients::extended_vft_client::traits::Vft;
use crate::states::vstreet_state::{VstreetState, UserInfo, Config};
use crate::services::{supply, borrow};
use crate::services::utils::{
    EventNotifier,
    ERROR_INSUFFICIENT_ADMIN_PRIVILEGES,
    ERROR_ADMIN_ALREADY_EXISTS,
    ERROR_ADMIN_DOESNT_EXIST
};

static mut VSTREET_STATE: Option<VstreetState> = None;

#[derive(Decode, Encode, TypeInfo)]
pub enum LiquidityEvent {
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
    pub vft_client: VftClient,
    pub config: Config
}

impl<VftClient> EventNotifier for LiquidityInjectionService<VftClient>
where
    VftClient: Vft,
{
    fn notify_deposit(&mut self, amount: u128) {
        self.notify_on(LiquidityEvent::Deposit { amount })
            .expect("Notification Error");
    }

    fn notify_vft_seted(&mut self, actor_id: ActorId) {
        self.notify_on(LiquidityEvent::VFTseted(actor_id))
            .expect("Notification Error");
    }

    fn notify_withdraw_liquidity(&mut self, amount: u128) {
        self.notify_on(LiquidityEvent::WithdrawLiquidity { amount })
            .expect("Notification Error");
    }

    fn notify_withdraw_rewards(&mut self, amount_withdrawn: u128) {
        self.notify_on(LiquidityEvent::WithdrawRewards { amount_withdrawn })
            .expect("Notification Error");
    }

    fn notify_error(&mut self, message: String) {
        self.notify_on(LiquidityEvent::Error(message))
            .expect("Notification Error");
    }

    fn notify_total_borrowed_modified(&mut self, borrowed: u128) {
        self.notify_on(LiquidityEvent::TotalBorrowedModified { borrowed })
            .expect("Notification Error");
    }

    fn notify_available_rewards_pool_modified(&mut self, pool: u128) {
        self.notify_on(LiquidityEvent::AvailableRewardsPoolModified { pool })
            .expect("Notification Error");
    }

    fn notify_deposited_vara(&mut self, amount: u128) {
        self.notify_on(LiquidityEvent::DepositedVara { amount })
            .expect("Notification Error");
    }

    fn notify_withdrawn_vara(&mut self, amount: u128) {
        self.notify_on(LiquidityEvent::WithdrawnVara { amount })
            .expect("Notification Error");
    }

    fn notify_loan_taken(&mut self, amount: u128) {
        self.notify_on(LiquidityEvent::LoanTaken { amount })
            .expect("Notification Error");
    }

    fn notify_loan_payed(&mut self, amount: u128) {
        self.notify_on(LiquidityEvent::LoanPayed { amount })
            .expect("Notification Error");
    }
}

#[sails_rs::service(events = LiquidityEvent)]
impl<VftClient> LiquidityInjectionService<VftClient> 
where VftClient: Vft, {
    // Service's constructor
    pub fn seed(
        owner: ActorId,
        admins: Vec<ActorId>,
        vft_contract_id: Option<ActorId>,
        total_deposited: u128,
        total_borrowed: u128,
        available_rewards_pool: u128,
        total_rewards_distributed: u128,
        users: BTreeMap<ActorId, UserInfo>,
        utilization_factor: u128,
        interest_rate: u128,
        apr: u128,
        ltv: u128,
    ) {
        unsafe {
            VSTREET_STATE = Some(
                VstreetState {
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
                }
            );
        };
    }

    pub fn new(
        vft_client: VftClient,
        config: Config
    ) -> Self {
        Self {
            vft_client,
            config
        }
    }

    // Admin Management methods

    fn ensure_admin(&mut self) -> Result<(), String> {
        let state = self.state_mut();

        if !state.admins.contains(&msg::source()) {
            let error_message = ERROR_INSUFFICIENT_ADMIN_PRIVILEGES.to_string();

            self.notify_on(LiquidityEvent::Error(error_message.clone()))
                .expect("Notification Error");
            
            return Err(error_message);
        }

        Ok(())
    }

    fn ensure_admin_ref(&self) -> Result<(), String> {
        let state = self.state_ref();

        if !state.admins.contains(&msg::source()) {
            let error_message = ERROR_INSUFFICIENT_ADMIN_PRIVILEGES.to_string();

            return Err(error_message)
        }

        Ok(())
    }

    fn ensure_admin_or_panic(&self) {
        if let Err(error_message) = self.ensure_admin_ref() {
            panic!("{}", error_message);
        }
    }

    pub fn add_admin(&mut self, new_admin: ActorId) -> Result<(), String> {
        self.ensure_admin()?;

        let state = self.state_mut();

        if state.admins.contains(&new_admin) {
            let error_message = ERROR_ADMIN_ALREADY_EXISTS.to_string();

            self.notify_on(LiquidityEvent::Error(error_message.clone()))
                .expect("Notification Error");
            
            return Err(error_message);
        }

        state.admins.push(new_admin);

        Ok(())
    }

    pub fn remove_admin(&mut self, admin: ActorId) -> Result<(), String> {
        self.ensure_admin()?;

        let state = self.state_mut();

        if let Some(pos) = state.admins.iter().position(|x| *x == admin) {
            state.admins.remove(pos);
        } else {
            let error_message = ERROR_ADMIN_DOESNT_EXIST.to_string();
            self.notify_on(LiquidityEvent::Error(error_message.clone()))
                .expect("Notification Error");
            return Err(error_message)
        }

        Ok(())
    }

    // Private methods
    // Only administrators of the contract can perform this actions.

    // ## Change vft contract id
    pub fn set_vft_contract_id(&mut self, vft_contract_id: ActorId) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_mut();

        state.vft_contract_id = Some(vft_contract_id);

        self.notify_on(LiquidityEvent::VFTseted(vft_contract_id))
                .expect("Notification Error");

        let new_vft_contract_id = state.vft_contract_id.unwrap();
        format!("New VFT Contract ID set: {:?}", new_vft_contract_id)
    }

    //Change LTV
    // LTV is a percentage value represented here in double digit format (e.g. 85% = 85)
    pub fn set_ltv(&mut self, ltv: u128) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_mut();

        state.ltv = ltv;

        format!("New LTV set: {:?}", ltv)
    }

    // Config Setters

    pub fn set_decimals_factor(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.decimals_factor = new_value;
        Ok(())
    }

    pub fn set_year_in_seconds(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.year_in_seconds = new_value;
        Ok(())
    }

    pub fn set_base_rate(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.base_rate = new_value;
        Ok(())
    }

    pub fn set_risk_multiplier(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.risk_multiplier = new_value;
        Ok(())
    }

    pub fn set_one_tvara(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.one_tvara = new_value;
        Ok(())
    }

    pub async fn set_vara_price(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.update_cv_and_mla_for_all_users();
        self.update_all_ltv().await;
        
        let _ = self.liquidate_all_loans();

        self.config.vara_price = new_value;
        Ok(())
    }

    pub fn set_dev_fee(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.dev_fee = new_value;
        Ok(())
    }

    pub fn set_max_loan_amount(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.max_loan_amount = new_value;
        Ok(())
    }

    pub fn set_max_collateral_withdraw(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.max_collateral_withdraw = new_value;
        Ok(())
    }

    pub fn set_max_liquidity_deposit(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.max_liquidity_deposit = new_value;
        Ok(())
    }

    pub fn set_max_liquidity_withdraw(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.max_liquidity_withdraw = new_value;
        Ok(())
    }

    pub fn set_min_rewards_withdraw(&mut self, new_value: u128) -> Result<(), String> {
        self.ensure_admin()?;

        self.config.min_rewards_withdraw = new_value;
        Ok(())
    }

    // Config Getters

    pub fn get_decimals_factor(&self) -> u128 {
        self.config.decimals_factor
    }

    pub fn get_year_in_seconds(&self) -> u128 {
        self.config.year_in_seconds
    }

    pub fn get_base_rate(&self) -> u128 {
        self.config.base_rate
    }

    pub fn get_risk_multiplier(&self) -> u128 {
        self.config.risk_multiplier
    }

    pub fn get_one_tvara(&self) -> u128 {
        self.config.one_tvara
    }

    pub fn get_vara_price(&self) -> u128 {
        self.config.vara_price
    }

    pub fn get_dev_fee(&self) -> u128 {
        self.config.dev_fee
    }

    pub fn get_max_loan_amount(&self) -> u128 {
        self.config.max_loan_amount
    }

    pub fn get_max_collateral_withdraw(&self) -> u128 {
        self.config.max_collateral_withdraw
    }

    pub fn get_max_liquidity_deposit(&self) -> u128 {
        self.config.max_liquidity_deposit
    }

    pub fn get_max_liquidity_withdraw(&self) -> u128 {
        self.config.max_liquidity_withdraw
    }

    pub fn get_min_rewards_withdraw(&self) -> u128 {
        self.config.min_rewards_withdraw
    }

    // Queries

    // Service's query owner of the contract
    pub fn contract_owner(&self) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        state.owner.to_string()
    } 

    //Service's query seted VFT of the contract
    pub fn vft_contract_id(&self) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        let contract_id = state.vft_contract_id.unwrap();
        contract_id.to_string() 
    } 

    //Service's query user-balance
    pub fn user_balance(&self, user: ActorId) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();
        user_info.balance_usdc.to_string()
    }

    //Service's query user-rewards
    pub fn user_rewards(&self, user: ActorId) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();
        user_info.rewards_usdc.to_string()
    }

    //Service's query user info
    pub fn user_info(&self, user: ActorId) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        let user_info = state.users.get(&user).unwrap();
        format!("User Info: {:?}", user_info)
    }

    //Service's query all users
    pub fn all_users(&self) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        let users = state.users.keys().map(|id| id.to_string()).collect::<Vec<_>>();
        users.join(", ")
    }

    //Service's query APR , interest rate, dev fee, total borrowed, available rewards pool, base rate, risk multiplier, utilization factor
    pub fn contract_info(&self) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        format!(
            "APR: {:?}, Interest Rate: {:?}, Dev Fee: {:?}, Total Deposited: {:?}, Total Borrowed: {:?}, Available Rewards Pool: {:?}, Base Rate: {:?}, Risk Multiplier: {:?}, Utilization Factor: {:?}", 
            state.apr, state.interest_rate, self.get_dev_fee(),state.total_deposited, state.total_borrowed, 
            state.available_rewards_pool, self.get_base_rate(), self.get_risk_multiplier(), state.utilization_factor
        )
    }

    //Service's query total deposited
    pub fn total_deposited(&self) -> String {
        self.ensure_admin_or_panic();

        let state = self.state_ref();
        state.total_deposited.to_string()
    }

    // State mutable & ref functions
    pub fn state_mut(&self) -> &'static mut VstreetState {
        let state = unsafe { VSTREET_STATE.as_mut() };
        debug_assert!(state.is_none(), "state is not started!");
        unsafe { state.unwrap_unchecked() }
    }

    fn state_ref(&self) -> &'static VstreetState {
        let state = unsafe { VSTREET_STATE.as_ref() };
        debug_assert!(state.is_none(), "state is not started!");
        unsafe { state.unwrap_unchecked() }
    }

    // Internal methods

    // Create new user
    pub fn create_new_user(timestamp: u128) -> UserInfo {
        UserInfo {
            balance: 0,
            rewards: 0,
            rewards_withdrawn: 0,
            liquidity_last_updated: timestamp,
            borrow_last_updated: timestamp,
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
    pub async fn transfer_tokens(&mut self, from: ActorId, to: ActorId, amount: u128) -> Result<(), String> {
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

    pub async fn modify_available_rewards_pool(&mut self, amount: u128) -> Result<(), String> {
        self.update_all_rewards();
        self.update_all_collateral_available_to_withdraw();

        let state_mut = self.state_mut();
        let decimals_factor = self.get_decimals_factor();
        state_mut.available_rewards_pool = amount * decimals_factor;

        // Notify the AvailableRewardsPoolModified event
        let new_rewards_pool: u128 = amount * decimals_factor;
        self.notify_on(LiquidityEvent::AvailableRewardsPoolModified { pool : new_rewards_pool })
                .expect("Notification Error");

        Ok(())
    }

    // Lenders APR (INTEREST RATE)
    pub fn calculate_apr(&mut self) -> u128 {
        let state_mut = self.state_mut();

        self.calculate_utilization_factor();

        state_mut.interest_rate = self.get_base_rate().saturating_add(state_mut.utilization_factor * self.get_risk_multiplier());

        state_mut.interest_rate
    }

    // Update User Rewards
    pub fn update_user_rewards(user_info: &mut UserInfo, interest_rate: u128, decimals_factor: u128, year_in_seconds: u128) {
        let current_timestamp = exec::block_timestamp() as u128;

        // Seconds in the 3 seconds Vara Blocks Elapsed since last update
        let time_elapsed = (current_timestamp - user_info.liquidity_last_updated) * 3;

        if time_elapsed > 0 {
            let interest_per_second = ((interest_rate * decimals_factor) / year_in_seconds) / decimals_factor as u128;
            let rewards = interest_per_second * time_elapsed;
            debug!("Calculated rewards: {}", rewards);
            user_info.rewards = user_info.rewards.saturating_add(rewards);
            user_info.rewards_usdc = user_info.rewards / decimals_factor;
            user_info.liquidity_last_updated = current_timestamp;
        }
    }

    // Update All User Rewards
    pub fn update_all_rewards(&mut self) {
        let state_mut = self.state_mut();

        for user_info in state_mut.users.values_mut() {
            if user_info.balance > 0 {
                Self::update_user_rewards(user_info, state_mut.interest_rate, self.get_decimals_factor(), self.get_year_in_seconds());
            }
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
    pub fn update_user_available_to_withdraw_vara(user_info: &mut UserInfo) {
        if user_info.is_loan_active == false {
            user_info.available_to_withdraw_vara = user_info.balance_vara;
        }else{
            let locked = (user_info.balance_vara * user_info.ltv) / 100;
            let available = user_info.balance_vara.saturating_sub(locked);
            debug!("Calculated available: {}", available);

            user_info.available_to_withdraw_vara = available;
        }
    }
    
    // Calculate Collateral Value
    // This functions need to be running every time vara price changes or user balance vara changes
    pub fn calculate_cv(&mut self, user: ActorId) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();
        let vara_price = self.get_vara_price();

        let tvaras = user_info.balance_vara / self.get_one_tvara();

        let cv = tvaras * vara_price;
        user_info.cv = cv;

        format!("CV: {:?}", cv)
    }

    // Calculate Maximum Loan Amount
    pub fn calculate_mla(&mut self, user: ActorId) -> String {
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
            if user_info.balance_vara >= self.get_one_tvara() {
                self.calculate_cv(user);
                self.calculate_mla(user);
            }
        }
    }

    pub fn update_user_ltv(&mut self, user: ActorId) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();

        user_info.ltv = (user_info.loan_amount * 100) / user_info.cv;

        format!("LTV: {:?}", user_info.ltv)
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

    //Calculate utilization factor = (Total deposited * Total borrowed) / 100
    pub fn calculate_utilization_factor(&mut self) -> u128 {
        let state_mut = self.state_mut();

        let total_deposited = state_mut.total_deposited;
        let total_borrowed = state_mut.total_borrowed;
        let decimals_factor = self.get_decimals_factor();

        // Check if total_deposited or total_borrowed is zero
        if total_deposited == 0 || total_borrowed == 0 {
            return 0;
        }

        let utilization_factor = (((total_borrowed * decimals_factor) / total_deposited) * 100) / decimals_factor;
        state_mut.utilization_factor = utilization_factor;
        return utilization_factor;
    }

    //Calculate Interest Rate = Base Rate+(Utilization Factor×Risk Multiplier)×(1+Dev Fee)
    fn calculate_interest_rate(&mut self) -> u128 {
        let state_mut = self.state_mut();
        let utilization_factor = state_mut.utilization_factor;
        let base_rate = self.get_base_rate();
        let risk_multiplier = self.get_risk_multiplier();
        let dev_fee = self.get_dev_fee();

        base_rate.saturating_add(utilization_factor * risk_multiplier) * (1 + dev_fee)
    }
    
    //Calculate Loan Interest Rate Amount 
    fn calculate_loan_interest_rate_amount(&mut self, user: ActorId) -> String {
        let state_mut = self.state_mut();
        let user_info = state_mut.users.get_mut(&user).unwrap();

        let loan_amount = user_info.loan_amount;
        let interest_rate = self.calculate_interest_rate();
        let current_timestamp = exec::block_timestamp() as u128;
        let time_diff_seconds = (current_timestamp - user_info.borrow_last_updated) / 1000;
        let decimals_factor = self.get_decimals_factor();

        let interest_rate_amount = (loan_amount * interest_rate * time_diff_seconds) / (self.get_year_in_seconds() * decimals_factor);
        user_info.loan_amount = user_info.loan_amount.saturating_add(interest_rate_amount);
        user_info.loan_amount_usdc = user_info.loan_amount / decimals_factor;
        user_info.borrow_last_updated = current_timestamp;

        format!("Loan Interest Rate Amount: {:?}", interest_rate_amount)
    }

    //Calculate Loan Interest Rate Amount for all users
    pub fn calculate_all_loan_interest_rate_amounts(&mut self) -> Result<(), String> {
        let state_mut = self.state_mut();

        for user in state_mut.users.keys().cloned().collect::<Vec<_>>() {
            let user_info = state_mut.users.get(&user).unwrap();
            //check if user has an active loan
            if user_info.is_loan_active == true {
                let _ = self.calculate_loan_interest_rate_amount(user);
            } 
        }

        Ok(())
    }

    //Liquidate Loan
    pub async fn liquidate_user_loan(&mut self, user: ActorId) -> Result<(), String> {
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

    // Liquidate all loans
    async fn liquidate_all_loans(&mut self) -> Result<(), String> {
        let state_mut = self.state_mut();

        for user in state_mut.users.keys().cloned().collect::<Vec<_>>() {
            let user_info = state_mut.users.get(&user).unwrap();
            //check if user has an active loan
            if user_info.is_loan_active == true {
                let _ = self.liquidate_user_loan(user).await;
            } 
        }

        Ok(())
    }

    // Supply methods

    pub async fn deposit_liquidity(&mut self, amount: u128) -> Result<(), String> {
        supply::deposit_liquidity(self, amount).await
    }

    pub async fn withdraw_liquidity(&mut self, amount: u128) -> Result<(), String> {
        supply::withdraw_liquidity(self, amount).await
    }

    pub async fn withdraw_rewards(&mut self) -> Result<(), String> {
        supply::withdraw_rewards(self).await
    }

    pub async fn deposit_collateral(&mut self) -> Result<(), String> {
        supply::deposit_collateral(self).await
    }

    pub async fn withdraw_collateral(&mut self, amount: u128) -> Result<(), String> {
        supply::withdraw_collateral(self, amount).await
    }

    // Borrow methods

    pub async fn take_loan(&mut self, amount: u128) -> Result<(), String> {
        borrow::take_loan(self, amount).await
    }

    pub async fn pay_all_loan(&mut self) -> Result<(), String> {
        borrow::pay_all_loan(self).await
    }

    pub async fn pay_loan(&mut self, amount: u128) -> Result<(), String> {
        borrow::pay_loan(self, amount).await
    }
}