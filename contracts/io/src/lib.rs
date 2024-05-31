#![no_std]
use gstd::{ActorId, Decode, Encode, TypeInfo, collections::BTreeMap, prelude::*};
use gmeta::{In, InOut, Out, Metadata};

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

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct InitLiquidity {
    pub stablecoin_address: ActorId,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum LiquidityAction {
    Deposit(u128),
    WithdrawLiquidity(u128),
    WithdrawRewards,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum LiquidityEvent {
    Initialized,
    Deposited(u128),
    LiquidityWithdrawn(u128),
    RewardsWithdrawn(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum Error {
    ZeroAmount,
    InvalidAmount,
    ZeroRewards,
    UserNotFound,
    TransferFailed,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo, Default)]
pub struct UserInfo {
    pub balance: u128,
    pub rewards: u128,
    pub last_updated: u128,
}

pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitLiquidity>;
    type Handle = InOut<LiquidityAction, LiquidityEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<IoGlobalState>;
}

#[derive(Default, Clone, Encode, Decode, TypeInfo)]
pub struct IoGlobalState {
    pub owner: ActorId,
    pub stablecoin_address: ActorId,
    pub apr: u128,
    pub total_deposited: u128,
    pub users: BTreeMap<ActorId, UserInfo>,
}

