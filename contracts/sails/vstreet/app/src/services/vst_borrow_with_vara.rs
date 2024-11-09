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
enum BorrowEvent {
    DepositedVara { amount: u128 },
    Borrowed { amount: u128, collateral: u128 },
    Repaid { amount: u128 },
    Error(String),
}

pub struct BorrowWithCollateralService<VftClient> {
    pub vft_client: VftClient,
}

#[sails_rs::service(events = BorrowEvent)]
impl<VftClient> BorrowWithCollateralService<VftClient>
where
    VftClient: Vft,
{
    pub fn new(vft_client: VftClient) -> Self {
        Self { vft_client }
    }

    pub async fn deposit_collateral(&mut self) -> String {
      
        let value = msg::value();
        let caller = msg::source();

        if value == 0 {
           self.notify_on(BorrowEvent::Error("No value sent".to_string()))
                .expect("Notification Error");
            return "No value sent".to_string();
        }


        let state_mut = self.state_mut();



        // Update user collateral
        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = state_mut.users
            .entry(msg::source())
            .or_insert_with(|| Self::create_new_user(current_timestamp));

        user_info.balance_vara = user_info.balance_vara.saturating_add(value * DECIMALS_FACTOR);

        // Notify the deposit event
        self.notify_on(BorrowEvent::DepositedVara { amount: value * DECIMALS_FACTOR })
            .expect("Notification Error");

        format!("Deposited Vara as Collateral: {:?}", value)
    }

    // pub async fn borrow(&mut self, amount: u128, collateral: u128) -> String {
    //     if amount == 0 || collateral == 0 {
    //         self.notify_on(BorrowEvent::Error("Invalid amount or collateral".to_string()))
    //             .expect("Notification Error");
    //         return "Invalid amount or collateral".to_string();
    //     }

    //     let state_mut = self.state_mut();

    //     // Transfer collateral from user to contract
    //     let result = self.transfer_tokens(msg::source(), exec::program_id(), collateral).await;
    //     if let Err(_) = result {
    //         self.notify_on(BorrowEvent::Error("Error in collateral transfer".to_string()))
    //             .expect("Notification Error");
    //         return "Error in collateral transfer".to_string();
    //     }

    //     // Update user balance and collateral
    //     let user_info = state_mut.users.entry(msg::source()).or_insert_with(|| Self::create_new_user(exec::block_timestamp() as u128));
    //     user_info.balance = user_info.balance.saturating_add(amount * DECIMALS_FACTOR);
    //     user_info.collateral = user_info.collateral.saturating_add(collateral * DECIMALS_FACTOR);

    //     // Notify the borrow event
    //     self.notify_on(BorrowEvent::Borrowed { amount: amount * DECIMALS_FACTOR, collateral: collateral * DECIMALS_FACTOR })
    //         .expect("Notification Error");

    //     format!("Borrowed: {:?}, Collateral: {:?}", amount, collateral)
    // }

    // pub async fn repay(&mut self, amount: u128) -> String {
    //     if amount == 0 {
    //         self.notify_on(BorrowEvent::Error("Invalid amount".to_string()))
    //             .expect("Notification Error");
    //         return "Invalid amount".to_string();
    //     }

    //     let state_mut = self.state_mut();

    //     // Transfer tokens from user to contract
    //     let result = self.transfer_tokens(msg::source(), exec::program_id(), amount).await;
    //     if let Err(_) = result {
    //         self.notify_on(BorrowEvent::Error("Error in repayment transfer".to_string()))
    //             .expect("Notification Error");
    //         return "Error in repayment transfer".to_string();
    //     }

    //     // Update user balance
    //     let user_info = state_mut.users.get_mut(&msg::source()).unwrap();
    //     user_info.balance = user_info.balance.saturating_sub(amount * DECIMALS_FACTOR);

    //     // Notify the repay event
    //     self.notify_on(BorrowEvent::Repaid { amount: amount * DECIMALS_FACTOR })
    //         .expect("Notification Error");

    //     format!("Repaid: {:?}", amount)
    // }

    fn state_mut(&self) -> &'static mut VstreetState {
        let state = unsafe { VSTREET_STATE.as_mut() };
        debug_assert!(state.is_none(), "state is not started!");
        unsafe { state.unwrap_unchecked() }
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
            balance_vara: 0,
        }
    }

    async fn transfer_tokens(&mut self, from: ActorId, to: ActorId, amount: u128) -> Result<(), String> {
        let state = self.state_ref();

        let response = self
            .vft_client
            .transfer_from(from, to, U256::from(amount))
            .send_recv(state.vft_contract_id.unwrap())
            .await;

        let Ok(transfer_status) = response else {
            self.notify_on(BorrowEvent::Error("Error in VFT Contract".to_string()))
                .expect("Notification Error");
            return Err("Error in VFT Contract".to_string());
        };

        if !transfer_status {
            self.notify_on(BorrowEvent::Error("Operation was not performed".to_string()))
                .expect("Notification Error");
            return Err("Operation was not performed".to_string());
        }

        Ok(())
    }

    fn state_ref(&self) -> &'static VstreetState {
        let state = unsafe { VSTREET_STATE.as_ref() };
        debug_assert!(state.is_none(), "state is not started!");
        unsafe { state.unwrap_unchecked() }
    }
}