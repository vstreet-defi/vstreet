use sails_rs::calls::Call;
use sails_rs::{
    prelude::*,
    gstd::{
        msg,
        exec,
    }
};
use sails_rs::collections::BTreeMap;

use crate::clients::extended_vft_client::traits::Vft;
use crate::states::vstreet_state::{
    VaultState, 
    VaultPosition, 
    UserVaultInfo, 
    ConvictionLevel,
    GlobalVaultStats,
};

static mut VAULT_STATE: Option<VaultState> = None;

// =====================================================
// EVENTS
// =====================================================

#[derive(Decode, Encode, TypeInfo)]
pub enum VaultEvent {
    Staked {
        position_id: u128,
        user: ActorId,
        amount: u128,
        conviction_level: ConvictionLevel,
        power: u128,
        unlock_timestamp: u128,
    },
    Unlocked {
        position_id: u128,
        user: ActorId,
        amount: u128,
        power: u128,
    },
    PositionClaimed {
        position_id: u128,
        user: ActorId,
        amount: u128,
    },
    MultiplePositionsClaimed {
        user: ActorId,
        total_amount: u128,
        positions_count: u128,
    },
    Error(String),
}

// =====================================================
// ERROR CONSTANTS
// =====================================================

pub const ERROR_INVALID_AMOUNT: &str = "Invalid stake amount: must be greater than zero";
pub const ERROR_POSITION_NOT_FOUND: &str = "Position not found";
pub const ERROR_NOT_POSITION_OWNER: &str = "You are not the owner of this position";
pub const ERROR_POSITION_NOT_MATURED: &str = "Position has not matured yet";
pub const ERROR_POSITION_ALREADY_CLAIMED: &str = "Position already claimed";
pub const ERROR_POSITION_INACTIVE: &str = "Position is not active";
pub const ERROR_TRANSFER_FAILED: &str = "Token transfer failed";
pub const ERROR_INSUFFICIENT_ADMIN_PRIVILEGES: &str = "Only an administrator can perform this action";

// =====================================================
// VAULT SERVICE
// =====================================================

pub struct VaultService<VftClient> {
    pub vft_client: VftClient,
}

#[sails_rs::service(events = VaultEvent)]
impl<VftClient> VaultService<VftClient> 
where VftClient: Vft 
{
    // =====================================================
    // CONSTRUCTOR & INITIALIZATION
    // =====================================================

    /// Initialize vault state
    pub fn seed(
        owner: ActorId,
        admins: Vec<ActorId>,
        vst_token_id: Option<ActorId>,
    ) {
        unsafe {
            VAULT_STATE = Some(VaultState {
                owner,
                admins,
                vst_token_id,
                total_vst_locked: 0,
                total_power: 0,
                positions: BTreeMap::new(),
                user_vaults: BTreeMap::new(),
                next_position_id: 1,
            });
        };
    }

    /// Create new service instance
    pub fn new(vft_client: VftClient) -> Self {
        Self { vft_client }
    }

    // =====================================================
    // STATE ACCESS HELPERS
    // =====================================================

    fn state_mut(&self) -> &'static mut VaultState {
        unsafe {
            VAULT_STATE
                .as_mut()
                .expect("Vault state is not initialized")
        }
    }

    fn state_ref(&self) -> &'static VaultState {
        unsafe {
            VAULT_STATE
                .as_ref()
                .expect("Vault state is not initialized")
        }
    }

    // =====================================================
    // ADMIN MANAGEMENT
    // =====================================================

    fn ensure_admin(&self) -> Result<(), String> {
        let state = self.state_ref();
        if !state.admins.contains(&msg::source()) {
            return Err(ERROR_INSUFFICIENT_ADMIN_PRIVILEGES.to_string());
        }
        Ok(())
    }

    pub fn add_admin(&mut self, new_admin: ActorId) -> Result<(), String> {
        self.ensure_admin()?;
        let state = self.state_mut();
        
        if state.admins.contains(&new_admin) {
            return Err("Admin already exists".to_string());
        }
        
        state.admins.push(new_admin);
        Ok(())
    }

    pub fn set_vst_token_id(&mut self, vst_token_id: ActorId) -> Result<(), String> {
        self.ensure_admin()?;
        let state = self.state_mut();
        state.vst_token_id = Some(vst_token_id);
        Ok(())
    }

    // =====================================================
    // CORE VAULT OPERATIONS
    // =====================================================

    /// Stake VST tokens with a chosen conviction level
    /// Returns the created position
    pub async fn stake_vst(
        &mut self,
        amount: u128,
        conviction_level: ConvictionLevel,
    ) -> Result<VaultPosition, String> {
        // Validate amount
        if amount == 0 {
            let error = ERROR_INVALID_AMOUNT.to_string();
            self.notify_on(VaultEvent::Error(error.clone()))
                .expect("Notification Error");
            return Err(error);
        }

        let state = self.state_mut();
        let user = msg::source();

        // Ensure VST token is configured
        let vst_token = state.vst_token_id
            .ok_or_else(|| "VST token not configured".to_string())?;

        // Calculate power: amount * multiplier / 100
        let multiplier = conviction_level.multiplier();
        let power = amount
            .checked_mul(multiplier)
            .and_then(|p| p.checked_div(100))
            .ok_or_else(|| "Power calculation overflow".to_string())?;

        // Calculate timestamps
        let current_time = exec::block_timestamp() as u128;
        let duration = conviction_level.duration_seconds();
        let unlock_timestamp = current_time
            .checked_add(duration)
            .ok_or_else(|| "Timestamp overflow".to_string())?;

        // Transfer VST tokens from user to contract
        let transfer_result = self
            .vft_client
            .transfer_from(user, exec::program_id(), amount.into())
            .send_recv(vst_token)
            .await;

        if transfer_result.is_err() {
            let error = ERROR_TRANSFER_FAILED.to_string();
            self.notify_on(VaultEvent::Error(error.clone()))
                .expect("Notification Error");
            return Err(error);
        }

        // Create position
        let position_id = state.next_position_id;
        state.next_position_id = state.next_position_id
            .checked_add(1)
            .ok_or_else(|| "Position ID overflow".to_string())?;

        let position = VaultPosition {
            id: position_id,
            user,
            amount,
            conviction_level: conviction_level.clone(),
            multiplier,
            power,
            start_timestamp: current_time,
            unlock_timestamp,
            is_active: true,
            claimed: false,
        };

        // Store position
        state.positions.insert(position_id, position.clone());

        // Update user vault info
        let user_vault = state.user_vaults.entry(user).or_insert_with(UserVaultInfo::default);
        user_vault.total_staked_vst = user_vault.total_staked_vst
            .checked_add(amount)
            .ok_or_else(|| "Total staked overflow".to_string())?;
        user_vault.total_power = user_vault.total_power
            .checked_add(power)
            .ok_or_else(|| "Total power overflow".to_string())?;
        user_vault.active_positions.push(position_id);
        user_vault.position_history.push(position_id);

        // Update global stats
        state.total_vst_locked = state.total_vst_locked
            .checked_add(amount)
            .ok_or_else(|| "Global locked overflow".to_string())?;
        state.total_power = state.total_power
            .checked_add(power)
            .ok_or_else(|| "Global power overflow".to_string())?;

        // Emit event
        self.notify_on(VaultEvent::Staked {
            position_id,
            user,
            amount,
            conviction_level,
            power,
            unlock_timestamp,
        })
        .expect("Notification Error");

        Ok(position)
    }

    /// Unlock and claim a single matured position
    pub async fn unlock_and_claim_position(
        &mut self,
        position_id: u128,
    ) -> Result<(), String> {
        let state = self.state_mut();
        let user = msg::source();

        // Get position
        let position = state.positions.get_mut(&position_id)
            .ok_or_else(|| ERROR_POSITION_NOT_FOUND.to_string())?;

        // Validate ownership
        if position.user != user {
            return Err(ERROR_NOT_POSITION_OWNER.to_string());
        }

        // Check if already claimed
        if position.claimed {
            return Err(ERROR_POSITION_ALREADY_CLAIMED.to_string());
        }

        // Check if position is active
        if !position.is_active {
            return Err(ERROR_POSITION_INACTIVE.to_string());
        }

        // Check maturity
        let current_time = exec::block_timestamp() as u128;
        if current_time < position.unlock_timestamp {
            let error = format!(
                "{} (unlocks at: {}, current: {})",
                ERROR_POSITION_NOT_MATURED,
                position.unlock_timestamp,
                current_time
            );
            self.notify_on(VaultEvent::Error(error.clone()))
                .expect("Notification Error");
            return Err(error);
        }

        let amount = position.amount;
        let power = position.power;

        // Ensure VST token is configured
        let vst_token = state.vst_token_id
            .ok_or_else(|| "VST token not configured".to_string())?;

        // Transfer tokens back to user
        let transfer_result = self
            .vft_client
            .transfer(user, amount.into())
            .send_recv(vst_token)
            .await;

        if transfer_result.is_err() {
            let error = ERROR_TRANSFER_FAILED.to_string();
            self.notify_on(VaultEvent::Error(error.clone()))
                .expect("Notification Error");
            return Err(error);
        }

        // Update position
        position.is_active = false;
        position.claimed = true;

        // Update user vault info
        if let Some(user_vault) = state.user_vaults.get_mut(&user) {
            // Update totals
            user_vault.total_staked_vst = user_vault.total_staked_vst.saturating_sub(amount);
            user_vault.total_power = user_vault.total_power.saturating_sub(power);

            // Move from active to matured
            if let Some(pos) = user_vault.active_positions.iter().position(|&id| id == position_id) {
                user_vault.active_positions.remove(pos);
            }
            if let Some(pos) = user_vault.matured_positions.iter().position(|&id| id == position_id) {
                user_vault.matured_positions.remove(pos);
            }
        }

        // Update global stats
        state.total_vst_locked = state.total_vst_locked.saturating_sub(amount);
        state.total_power = state.total_power.saturating_sub(power);

        // Emit events
        self.notify_on(VaultEvent::Unlocked {
            position_id,
            user,
            amount,
            power,
        })
        .expect("Notification Error");

        self.notify_on(VaultEvent::PositionClaimed {
            position_id,
            user,
            amount,
        })
        .expect("Notification Error");

        Ok(())
    }

    /// Claim multiple matured positions at once
    pub async fn claim_multiple_positions(
        &mut self,
        position_ids: Vec<u128>,
    ) -> Result<(), String> {
        let user = msg::source();
        let mut total_amount: u128 = 0;
        let mut positions_claimed: u128 = 0;

        for position_id in position_ids {
            // Attempt to unlock each position
            if let Ok(_) = self.unlock_and_claim_position(position_id).await {
                if let Some(position) = self.state_ref().positions.get(&position_id) {
                    total_amount = total_amount.saturating_add(position.amount);
                    positions_claimed += 1;
                }
            }
        }

        if positions_claimed > 0 {
            self.notify_on(VaultEvent::MultiplePositionsClaimed {
                user,
                total_amount,
                positions_count: positions_claimed,
            })
            .expect("Notification Error");
        }

        Ok(())
    }

    // =====================================================
    // QUERY METHODS
    // =====================================================

    /// Get user's vault information with position categorization
    pub fn user_vault_info(&self, user: ActorId) -> UserVaultInfo {
        let state = self.state_ref();
        let current_time = exec::block_timestamp() as u128;

        // Get or create default user vault
        let mut user_vault = state.user_vaults.get(&user)
            .cloned()
            .unwrap_or_default();

        // Recategorize positions based on current time
        let mut active = Vec::new();
        let mut matured = Vec::new();

        for &position_id in &user_vault.position_history {
            if let Some(position) = state.positions.get(&position_id) {
                if position.claimed {
                    continue; // Skip claimed positions
                }

                if position.is_active {
                    if current_time >= position.unlock_timestamp {
                        matured.push(position_id);
                    } else {
                        active.push(position_id);
                    }
                }
            }
        }

        user_vault.active_positions = active;
        user_vault.matured_positions = matured;

        user_vault
    }

    /// Get detailed information about a specific position
    pub fn position_details(&self, position_id: u128) -> Option<VaultPosition> {
        let state = self.state_ref();
        state.positions.get(&position_id).cloned()
    }

    /// Get all positions for a user (for history view)
    pub fn user_positions(&self, user: ActorId) -> Vec<VaultPosition> {
        let state = self.state_ref();
        let user_vault = self.user_vault_info(user);

        user_vault.position_history
            .iter()
            .filter_map(|&id| state.positions.get(&id).cloned())
            .collect()
    }

    /// Get active positions for a user
    pub fn user_active_positions(&self, user: ActorId) -> Vec<VaultPosition> {
        let user_vault = self.user_vault_info(user);
        let state = self.state_ref();

        user_vault.active_positions
            .iter()
            .filter_map(|&id| state.positions.get(&id).cloned())
            .collect()
    }

    /// Get matured (ready to claim) positions for a user
    pub fn user_matured_positions(&self, user: ActorId) -> Vec<VaultPosition> {
        let user_vault = self.user_vault_info(user);
        let state = self.state_ref();

        user_vault.matured_positions
            .iter()
            .filter_map(|&id| state.positions.get(&id).cloned())
            .collect()
    }

    /// Get global vault statistics
    pub fn global_stats(&self) -> GlobalVaultStats {
        let state = self.state_ref();
        let active_count = state.positions
            .values()
            .filter(|p| p.is_active && !p.claimed)
            .count() as u128;

        GlobalVaultStats {
            total_vst_locked: state.total_vst_locked,
            total_power: state.total_power,
            active_positions_count: active_count,
        }
    }

    /// Calculate time until a position unlocks (in seconds)
    /// Returns 0 if already unlocked
    pub fn time_until_unlock(&self, position_id: u128) -> u128 {
        let state = self.state_ref();
        
        if let Some(position) = state.positions.get(&position_id) {
            let current_time = exec::block_timestamp() as u128;
            
            if current_time >= position.unlock_timestamp {
                0
            } else {
                position.unlock_timestamp.saturating_sub(current_time)
            }
        } else {
            0
        }
    }

    /// Get total user power (sVST)
    pub fn user_total_power(&self, user: ActorId) -> u128 {
        let user_vault = self.user_vault_info(user);
        user_vault.total_power
    }

    /// Get total user staked VST
    pub fn user_total_staked(&self, user: ActorId) -> u128 {
        let user_vault = self.user_vault_info(user);
        user_vault.total_staked_vst
    }
}
