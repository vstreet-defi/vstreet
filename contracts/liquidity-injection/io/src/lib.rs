#![no_std]

use gmeta::{In, InOut, Metadata, Out};
use gstd::{ActorId, collections::BTreeMap, debug, Decode, Encode, exec, msg, prelude::*, TypeInfo};

pub const DECIMALS_FACTOR: u128 = 10_u128.pow(6);
pub const YEAR_IN_SECONDS: u128 = 31_536_000; // 365 * 24 * 60 * 60
pub const BASE_RATE: u128 = 10000; // 0.01 * DECIMALS_FACTOR
pub const RISK_MULTIPLIER: u128 = 40000; // 0.04 * DECIMALS_FACTOR

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
    ModifyTotalBorrowed(u128),
    ModifyAvailableRewardsPool(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum LiquidityEvent {
    Initialized,
    Deposited(u128),
    LiquidityWithdrawn(u128),
    RewardsWithdrawn(u128),
    TotalBorrowedModified(u128),
    AvailableRewardsPoolModified(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
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
    pub rewards_withdrawn: u128,
    pub last_updated: u128,
    pub balance_usdc: u128,
    pub rewards_usdc: u128,
    pub rewards_usdc_withdrawn: u128,
}

pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitLiquidity>;
    type Handle = InOut<LiquidityAction, Result<LiquidityEvent, Error>>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<LiquidityPool>;
}

#[derive(Debug, Clone, Default, Encode, Decode, TypeInfo)]
pub struct LiquidityPool {
    pub owner: ActorId,
    pub stablecoin_address: ActorId,
    pub total_deposited: u128,
    pub total_borrowed: u128,
    pub available_rewards_pool: u128,
    pub total_rewards_distributed: u128,
    pub users: BTreeMap<ActorId, UserInfo>,
    pub base_rate: u128,
    pub risk_multiplier: u128,
    pub utilization_factor: u128,
    pub dev_fee: u128,
    pub interest_rate: u128,
    pub apr: u128,
}

impl LiquidityPool {
    pub async fn handle_action(&mut self, action: LiquidityAction, user: ActorId) -> Result<LiquidityEvent, Error> {
        match action {
            LiquidityAction::Deposit(amount) => self.deposit(user, amount).await,
            LiquidityAction::WithdrawLiquidity(amount) => self.withdraw_liquidity(user, amount).await,
            LiquidityAction::WithdrawRewards => self.withdraw_rewards(user).await,
            LiquidityAction::ModifyTotalBorrowed(amount) => self.modify_total_borrowed(amount),
            LiquidityAction::ModifyAvailableRewardsPool(amount) => self.modify_available_rewards_pool(amount),
        }
    }

    pub fn update_all_rewards(&mut self) {
        self.apr = self.calculate_apr();

        let current_timestamp = exec::block_timestamp() as u128;

        for user_info in self.users.values_mut() {
            Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);
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

    // Borrowers APR (INTEREST RATE + DEV FEE)
    fn calculate_apr(&mut self) -> u128 {
        self.utilization_factor = if self.total_deposited == 0 {
            0
        } else {
            (self.total_borrowed * DECIMALS_FACTOR) / self.total_deposited
        };

        self.interest_rate = self.base_rate + (self.utilization_factor * self.risk_multiplier / DECIMALS_FACTOR);
        self.dev_fee = self.interest_rate / 100;

        self.interest_rate + self.dev_fee
    }

    async fn deposit(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        debug!("Depositing funds");
        if amount == 0 {
            return Err(Error::ZeroAmount);
        }

        self.apr = self.calculate_apr();
        debug!("New APR after deposit: {}", self.apr);

        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = self.users
            .entry(user)
            .or_insert_with(|| Self::create_new_user(current_timestamp));

        user_info.balance = user_info.balance.saturating_add(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        self.total_deposited = self.total_deposited.saturating_add(amount * DECIMALS_FACTOR);

        Self::transfer_tokens(&self.stablecoin_address, msg::source(), exec::program_id(), amount).await?;
        Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);
        Ok(LiquidityEvent::Deposited(amount))
    }

    async fn withdraw_liquidity(&mut self, user: ActorId, amount: u128) -> Result<LiquidityEvent, Error> {
        self.apr = self.calculate_apr();
        debug!("New APR after deposit: {}", self.apr);

        let current_timestamp = exec::block_timestamp() as u128;

        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        if amount == 0 || amount > user_info.balance {
            return Err(Error::InvalidAmount);
        }

        user_info.balance = user_info.balance.saturating_sub(amount * DECIMALS_FACTOR);
        user_info.balance_usdc = user_info.balance / DECIMALS_FACTOR;
        self.total_deposited = self.total_deposited.saturating_sub(amount * DECIMALS_FACTOR);

        Self::transfer_tokens(&self.stablecoin_address, exec::program_id(), msg::source(), amount).await.expect("Transfer tokens failed during the withdrawal");
        Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);

        Ok(LiquidityEvent::LiquidityWithdrawn(amount))
    }

    async fn withdraw_rewards(&mut self, user: ActorId) -> Result<LiquidityEvent, Error> {
        self.apr = self.calculate_apr();

        let current_timestamp = exec::block_timestamp() as u128;
        let user_info = self.users.get_mut(&user).ok_or(Error::UserNotFound)?;

        Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);
        let rewards_to_withdraw = user_info.rewards.saturating_sub(user_info.rewards_withdrawn);

        if rewards_to_withdraw == 0 || rewards_to_withdraw > self.available_rewards_pool {
            return Err(Error::InvalidAmount);
        }

        user_info.rewards = user_info.rewards.saturating_sub(rewards_to_withdraw);
        user_info.rewards_withdrawn = user_info.rewards_withdrawn.saturating_add(rewards_to_withdraw);
        user_info.rewards_usdc = user_info.rewards_usdc.saturating_sub(user_info.rewards_usdc);
        user_info.rewards_usdc_withdrawn = user_info.rewards_usdc_withdrawn.saturating_add(user_info.rewards_usdc);

        self.total_rewards_distributed = self.total_rewards_distributed.saturating_add(rewards_to_withdraw);

        Self::transfer_tokens(
            &self.stablecoin_address,
            exec::program_id(),
            msg::source(),
            rewards_to_withdraw / DECIMALS_FACTOR,
        ).await.expect("Transfer tokens failed during the rewards withdrawal");
        Self::update_user_rewards(user_info, current_timestamp, self.interest_rate);
        
        Ok(LiquidityEvent::RewardsWithdrawn(rewards_to_withdraw / DECIMALS_FACTOR))
    }

    fn modify_total_borrowed(&mut self, amount: u128) -> Result<LiquidityEvent, Error> {
        debug!("Borrowing funds");
        self.total_borrowed = amount * DECIMALS_FACTOR;
        self.apr = self.calculate_apr();

        Ok(LiquidityEvent::TotalBorrowedModified(amount))
    }

    fn modify_available_rewards_pool(&mut self, amount: u128) -> Result<LiquidityEvent, Error> {
        self.available_rewards_pool = amount * DECIMALS_FACTOR;

       Ok(LiquidityEvent::AvailableRewardsPoolModified(amount))
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
    async fn transfer_tokens(token_address: &ActorId, from: ActorId, to: ActorId, amount: u128) -> Result<(), Error> {
        let payload = FTAction::Transfer { from, to, amount };
        let result = msg::send_for_reply_as(*token_address, payload, 0, 0)
            .map_err(|_| Error::TransferFailed)?
            .await
            .map_err(|_| Error::TransferFailed)?;

        match result {
            FTEvent::Err => Err(Error::TransferFailed),
            _ => Ok(()),
        }
    }
}
