#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{ActorId, prelude::*};

#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitFT {
    pub synthetic_asset: ActorId,
    pub stablecoin: ActorId,
}

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum FTAction {
    Mint(u128),
    Burn(u128),
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approve {
        to: ActorId,
        amount: u128,
    },
    TotalSupply,
    BalanceOf(ActorId),
}

#[derive(Encode, Decode, TypeInfo)]
pub enum FTEvent {
    Ok,
    Err,
    Balance(u128),
    PermitId(u128),
}

#[derive(Decode, Encode, TypeInfo)]
pub enum Action {
    DepositFunds(u128), // User deposit funds into the protocol 
    WithdrawFunds(u128), // User withdraw funds from the protocol 
    Borrow(u128), // User borrows funds from the protocol
    Repay(u128), // User repays a loan
    Liquidate(u128), // A loan is liquidated because the loan to value ratio is lower than the minimum required
}

#[derive(Clone, Decode, Encode, TypeInfo)]
pub enum Event {
    FundsDeposited, // Funds has been deposited into the protocol
    FundsWithdrawn, // Funds has been withdrawn from the protocol
    LoanBorrowed, // A loan has been borrowed
    LoanRepaid, // A loan has been repaid
    LoanLiquidated, // A loan has been liquidated because the loan to value ratio is lower than the minimum required
}

#[derive(Default, Clone, Decode, Encode, TypeInfo)]
pub struct UserLender {
    pub status: UserStatus, // The status of the lender
    pub liquidity: u128, // amount of liquidity provided
    pub loans_given: Vec<(u128, LiquidityStatus)>, // The history of loans given
}

#[derive(Default, Clone, Decode, Encode, TypeInfo)]
pub struct UserBorrower {
    pub status: LoanStatus, // The status of the loan
    pub loan_amount: u128, // The amount of the loan
    pub ltv_ratio: u64, // The loan to Value ratio
    pub history: Vec<(u128, Loans)>, // history of the loans
}

#[derive(Default, Clone, Decode, Encode, TypeInfo)]
pub struct Loans {
    pub id: u128,
    pub amount: u128, // The amount of the loan
    pub collateral_amount: u128, // The amount of the collateral
    pub ltv_ratio: u64, // The loan to Value ratio
    pub closing: LoanStatus, // The status of the loan
}

#[derive(Default, Clone, Decode, Encode, TypeInfo)]
pub enum LoanStatus {
    #[default]
    Active, // A loan is active
    Inactive, // The loan has been repaid
}

#[derive(Default, Clone, Decode, Encode, TypeInfo)]
pub enum LiquidityStatus {
    #[default]
    Active, // A liquidity positive is active
    Inactive, // a liquidity positive is inactive
}

#[derive(Default, Clone, Decode, Encode, TypeInfo)]
pub enum UserStatus {
    #[default]
    Active, // A loan is active
    Inactive, // The loan has been repaid
}

pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitFT>;
    type Handle = InOut<Action, Event>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = ();
}

#[derive(Default, Clone, Encode, Decode, TypeInfo)]
pub struct IoGlobalState {
    pub total_synthetic_deposited: u128,
    pub total_stablecoin_deposited: u128,
    pub borrowers: Vec<(ActorId, UserBorrower)>,
    pub lenders: Vec<(ActorId, UserLender)>,
    pub loans: Vec<(ActorId, Loans)>,
    pub loan_status: Vec<(ActorId, LoanStatus)>,
    pub liquidity_status: Vec<(ActorId, LiquidityStatus)>,
    pub user_status: Vec<(ActorId, UserStatus)>,
}

