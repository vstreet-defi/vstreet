#![no_std]

use gmeta::{In, InOut, Metadata, Out};
use gstd::{ActorId, collections::BTreeMap, Decode, Encode, prelude::*, TypeInfo};

#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitFT {
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

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct InitBond {
    pub stablecoin_address: ActorId,
    pub price: u128,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum BondAction {
    BuyBond(u128),
    // LiberatePtokens(u128),
   
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum BondEvent {
    Ok,
    Err,
    BondBought(u128),
    Ptokens(u128),
    BondValue(u128),
    BondBalance(u128),
    PtokenBalance(u128),
}


#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum Error {
    ZeroAmount,
    InvalidAmount,
    UserNotFound,
    TransferFailed,
    AlreadyEmmited,
}


#[derive(Debug, Clone, Encode, Decode, TypeInfo, Default)]
pub struct BondHolder {
    pub p_balance: u128,
    pub emmited: bool,
       
}


pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitBond>;
    type Handle = InOut<BondAction, BondEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<IoGlobalState>;
}

#[derive(Default, Clone, Encode, Decode, TypeInfo)]
pub struct IoGlobalState {
    pub owner: ActorId,
    pub stablecoin_address: ActorId,
    pub p_token_address: ActorId,
    pub bonds_emmited: u128,
    pub price: u128,
    pub vesting_time: u64,
    pub total_deposited: u128,
    pub bond_holders: BTreeMap<ActorId, BondHolder>,
}