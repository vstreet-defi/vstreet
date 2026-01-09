use core::fmt::Debug;
use sails_rs::{
    collections::BTreeMap,
    prelude::*,
};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Encode, Decode, TypeInfo)]
pub struct UserInfo {
    pub balance: u128,
    pub rewards: u128,
    pub rewards_withdrawn: u128,
    pub liquidity_last_updated: u128,
    pub borrow_last_updated: u128,
    pub balance_usdc: u128,
    pub rewards_usdc: u128,
    pub rewards_usdc_withdrawn: u128,
    pub balance_vara: u128,
    pub mla: u128,
    pub cv: u128,
    pub available_to_withdraw_vara: u128,
    pub loan_amount: u128,
    pub loan_amount_usdc: u128,
    pub is_loan_active: bool,
    pub ltv: u128,
}

#[derive(Clone, Encode, TypeInfo)]
pub struct VstreetState {
    pub owner: ActorId,
    pub admins: Vec<ActorId>,
    pub vft_contract_id: Option<ActorId>,
    pub total_deposited: u128,
    pub total_borrowed: u128,
    pub available_rewards_pool: u128,
    pub total_rewards_distributed: u128,
    pub users: BTreeMap<ActorId, UserInfo>,
    pub utilization_factor: u128,
    pub interest_rate: u128,
    pub apr: u128,
    pub ltv: u128,
    pub config: Config,
}

#[derive(Clone, Encode, Decode, TypeInfo)]
pub struct Config {
    pub decimals_factor: u128,
    pub year_in_seconds: u128,
    pub base_rate: u128,
    pub risk_multiplier: u128,
    pub one_tvara: u128,
    pub vara_price: u128,
    pub dev_fee: u128,
    pub max_loan_amount: u128,
    pub max_collateral_withdraw: u128,
    pub max_liquidity_deposit: u128,
    pub max_liquidity_withdraw: u128,
    pub min_rewards_withdraw: u128
}

impl Default for Config {
    fn default() -> Self {
        Self {
            decimals_factor: 10_u128.pow(6),
            year_in_seconds: 31_536_000, // 365 * 24 * 60 * 60
            base_rate: 10_000,           // 0.01 * DECIMALS_FACTOR
            risk_multiplier: 40_000,     // 0.04 * DECIMALS_FACTOR
            one_tvara: 1_000_000_000_000, // Value of one TVara and Vara
            vara_price: 1000000,
            dev_fee: 1_500_000, // 1.5% * DECIMALS_FACTOR
            max_loan_amount: 100000000000000000000,
            max_collateral_withdraw: 100000000000000000000,
            max_liquidity_deposit: 100000000000000000000,
            max_liquidity_withdraw: 100000000000000000000,
            min_rewards_withdraw: 100000
        }
    }
}

// =====================================================
// VAULT STATE STRUCTURES
// =====================================================

/// Conviction levels determining lock duration and power multiplier
#[derive(Clone, Debug, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum ConvictionLevel {
    Day1,   // 1 day lock, 1.0x multiplier
    Day7,   // 7 days lock, 1.5x multiplier
    Day14,  // 14 days lock, 2.0x multiplier
    Day28,  // 28 days lock, 3.0x multiplier
    Day90,  // 90 days lock, 4.0x multiplier
}

impl ConvictionLevel {
    /// Returns lock duration in seconds
    pub fn duration_seconds(&self) -> u128 {
        match self {
            ConvictionLevel::Day1 => 86_400,       // 1 day
            ConvictionLevel::Day7 => 604_800,      // 7 days
            ConvictionLevel::Day14 => 1_209_600,   // 14 days
            ConvictionLevel::Day28 => 2_419_200,   // 28 days
            ConvictionLevel::Day90 => 7_776_000,   // 90 days
        }
    }

    /// Returns power multiplier (scaled by 100, e.g., 150 = 1.5x)
    pub fn multiplier(&self) -> u128 {
        match self {
            ConvictionLevel::Day1 => 100,   // 1.0x
            ConvictionLevel::Day7 => 150,   // 1.5x
            ConvictionLevel::Day14 => 200,  // 2.0x
            ConvictionLevel::Day28 => 300,  // 3.0x
            ConvictionLevel::Day90 => 400,  // 4.0x
        }
    }
}

/// Individual vault position representing a locked stake
#[derive(Clone, Debug, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct VaultPosition {
    pub id: u128,
    pub user: ActorId,
    pub amount: u128,                       // VST tokens staked (scaled)
    pub conviction_level: ConvictionLevel,
    pub multiplier: u128,                   // Power multiplier (scaled by 100)
    pub power: u128,                        // Calculated sVST power
    pub start_timestamp: u128,              // When locked (block timestamp)
    pub unlock_timestamp: u128,             // When unlockable
    pub is_active: bool,                    // true = locked, false = unlocked
    pub claimed: bool,                      // Whether tokens claimed
}

/// User's vault information
#[derive(Clone, Debug, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct UserVaultInfo {
    pub total_staked_vst: u128,             // Sum of all active stakes
    pub total_power: u128,                  // Sum of all sVST power
    pub active_positions: Vec<u128>,        // IDs of locked positions
    pub matured_positions: Vec<u128>,       // IDs of unlocked but unclaimed positions
    pub position_history: Vec<u128>,        // All position IDs (for history tab)
}

impl Default for UserVaultInfo {
    fn default() -> Self {
        Self {
            total_staked_vst: 0,
            total_power: 0,
            active_positions: Vec::new(),
            matured_positions: Vec::new(),
            position_history: Vec::new(),
        }
    }
}

/// Global vault state
#[derive(Clone, Encode, TypeInfo)]
pub struct VaultState {
    pub owner: ActorId,
    pub admins: Vec<ActorId>,
    pub vst_token_id: Option<ActorId>,      // VST token contract address
    pub total_vst_locked: u128,             // Protocol-wide locked VST
    pub total_power: u128,                  // Protocol-wide sVST power
    pub positions: BTreeMap<u128, VaultPosition>,  // All positions by ID
    pub user_vaults: BTreeMap<ActorId, UserVaultInfo>,  // User vault data
    pub next_position_id: u128,             // Auto-increment position ID
}

/// Statistics for global vault display
#[derive(Clone, Debug, Encode, Decode, TypeInfo)]
pub struct GlobalVaultStats {
    pub total_vst_locked: u128,
    pub total_power: u128,
    pub active_positions_count: u128,
}