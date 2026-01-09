# Vstreet Vault Service Documentation

## Overview

The Vault Service is a Sails-based Rust smart contract that enables time-locked VST token staking with conviction-based multipliers. Users can lock their VST tokens for predetermined durations to earn "power" (sVST) which represents their weighted stake in the protocol.

## Architecture

### Key Components

1. **VaultService** - Main service handling all vault operations
2. **VaultState** - Global state managing all positions and user data
3. **VaultPosition** - Individual staking position with lock details
4. **UserVaultInfo** - Per-user aggregated vault information
5. **ConvictionLevel** - Enum defining lock durations and multipliers

## Conviction Levels & Multipliers

| Level | Duration | Multiplier | Power Boost | UI Status        |
| ----- | -------- | ---------- | ----------- | ---------------- |
| Day1  | 1 day    | 1.0x       | 100%        | Manual           |
| Day7  | 7 days   | 1.5x       | 150%        | Ignition Started |
| Day14 | 14 days  | 2.0x       | 200%        | Stable Burn      |
| Day28 | 28 days  | 3.0x       | 300%        | High Velocity    |
| Day90 | 90 days  | 4.0x       | 400%        | MAX IGNITION     |

### Power Calculation

```rust
power = staked_amount * multiplier / 100
```

**Example:**

- Stake: 10,000 VST
- Conviction: Day28 (3.0x)
- Power: 10,000 \* 300 / 100 = 30,000 sVST

## State Structures

### VaultPosition

```rust
pub struct VaultPosition {
    pub id: u128,                        // Unique position ID
    pub user: ActorId,                   // Owner address
    pub amount: u128,                    // VST tokens staked
    pub conviction_level: ConvictionLevel,
    pub multiplier: u128,                // e.g., 150 = 1.5x
    pub power: u128,                     // Calculated sVST
    pub start_timestamp: u128,           // Lock start time
    pub unlock_timestamp: u128,          // When unlockable
    pub is_active: bool,                 // Locked status
    pub claimed: bool,                   // Claimed status
}
```

### UserVaultInfo

```rust
pub struct UserVaultInfo {
    pub total_staked_vst: u128,          // Sum of active stakes
    pub total_power: u128,               // Total sVST power
    pub active_positions: Vec<u128>,     // Locked position IDs
    pub matured_positions: Vec<u128>,    // Unlocked position IDs
    pub position_history: Vec<u128>,     // All position IDs
}
```

### VaultState

```rust
pub struct VaultState {
    pub owner: ActorId,
    pub admins: Vec<ActorId>,
    pub vst_token_id: Option<ActorId>,
    pub total_vst_locked: u128,          // Protocol-wide TVL
    pub total_power: u128,               // Total sVST power
    pub positions: BTreeMap<u128, VaultPosition>,
    pub user_vaults: BTreeMap<ActorId, UserVaultInfo>,
    pub next_position_id: u128,
}
```

## Service Methods

### Transactions (Mutations)

#### `stake_vst(amount: u128, conviction_level: ConvictionLevel) -> Result<VaultPosition, String>`

Stakes VST tokens with chosen conviction level.

**Process:**

1. Validates amount > 0
2. Transfers VST from user to contract
3. Calculates power based on multiplier
4. Creates position with unlock timestamp
5. Updates user and global state
6. Emits `Staked` event

**Example:**

```rust
vault_service.stake_vst(5_000_000, ConvictionLevel::Day14).await
```

#### `unlock_and_claim_position(position_id: u128) -> Result<(), String>`

Unlocks and claims a matured position.

**Validations:**

- Position exists
- User is owner
- Not already claimed
- Position is active
- Current time >= unlock_timestamp

**Process:**

1. Validates all conditions
2. Transfers VST back to user
3. Marks position as inactive and claimed
4. Updates user and global stats
5. Emits `Unlocked` and `PositionClaimed` events

#### `claim_multiple_positions(position_ids: Vec<u128>) -> Result<(), String>`

Batch claims multiple matured positions.

**Features:**

- Continues on individual failures
- Emits summary event with total claimed

### Queries (Read-only)

#### `user_vault_info(user: ActorId) -> UserVaultInfo`

Returns complete user vault information with dynamic position categorization based on current timestamp.

#### `position_details(position_id: u128) -> Option<VaultPosition>`

Returns full details of a specific position.

#### `user_positions(user: ActorId) -> Vec<VaultPosition>`

Returns all positions (for history view).

#### `user_active_positions(user: ActorId) -> Vec<VaultPosition>`

Returns only active (locked) positions.

#### `user_matured_positions(user: ActorId) -> Vec<VaultPosition>`

Returns only matured (unlocked but unclaimed) positions.

#### `global_stats() -> GlobalVaultStats`

Returns protocol-wide statistics:

- `total_vst_locked`
- `total_power`
- `active_positions_count`

#### `time_until_unlock(position_id: u128) -> u128`

Returns remaining seconds until unlock (0 if already unlocked).

#### `user_total_power(user: ActorId) -> u128`

Returns user's total sVST power.

#### `user_total_staked(user: ActorId) -> u128`

Returns user's total staked VST.

## Events

### VaultEvent::Staked

```rust
{
    position_id: u128,
    user: ActorId,
    amount: u128,
    conviction_level: ConvictionLevel,
    power: u128,
    unlock_timestamp: u128,
}
```

### VaultEvent::Unlocked

```rust
{
    position_id: u128,
    user: ActorId,
    amount: u128,
    power: u128,
}
```

### VaultEvent::PositionClaimed

```rust
{
    position_id: u128,
    user: ActorId,
    amount: u128,
}
```

### VaultEvent::MultiplePositionsClaimed

```rust
{
    user: ActorId,
    total_amount: u128,
    positions_count: u128,
}
```

### VaultEvent::Error

```rust
Error(String)
```

## Frontend Integration

### Accessing the Service

```typescript
import { Sails, SailsIdlParser } from "sails-js";

// Initialize Sails client
const parser = await SailsIdlParser.new();
const sails = new Sails(parser);
sails.parseIdl(vaultIdl);
sails.setProgramId(VAULT_PROGRAM_ID);
sails.setApi(gearApi);

// Access vault service
const vaultService = sails.services.VaultService;
```

### Query User Positions

```typescript
const userVaultInfo = await vaultService.queries.user_vault_info(
  callerAddress,
  undefined,
  undefined,
  userAddress
);

console.log("Total Staked:", userVaultInfo.total_staked_vst);
console.log("Total Power:", userVaultInfo.total_power);
console.log("Active Positions:", userVaultInfo.active_positions);
console.log("Matured Positions:", userVaultInfo.matured_positions);
```

### Stake VST Tokens

```typescript
const transaction = await vaultService.functions
  .stake_vst(amount, "Day7") // or Day1, Day14, Day28, Day90
  .withAccount(account, { nonce: -1 })
  .calculateGas();

const { msgId, blockHash, response } = await transaction.signAndSend();

// Wait for response
const result = await response();
console.log("Position created:", result);
```

### Claim Position

```typescript
const transaction = await vaultService.functions
  .unlock_and_claim_position(positionId)
  .withAccount(account, { nonce: -1 })
  .calculateGas();

await transaction.signAndSend();
```

### Get Global Stats

```typescript
const stats = await vaultService.queries.global_stats(callerAddress);

console.log("Total TVL:", stats.total_vst_locked);
console.log("Total Power:", stats.total_power);
```

## UI Component Mapping

### StakingConsole

- **Operation:** `stake_vst()`
- **Queries:** `user_total_staked()`, `user_total_power()`
- **Conviction Selector:** Maps to `ConvictionLevel` enum
- **Power Calculation:** Client-side preview, server validates

### InventoryManager - Active Tab

- **Query:** `user_active_positions()`
- **Display:** Position amount, multiplier badge, power, countdown timer
- **Data:** Position start/unlock timestamps, is_active=true

### InventoryManager - Ready Tab

- **Query:** `user_matured_positions()`
- **Display:** Matured amount, accrued power, "READY" status
- **Action:** `unlock_and_claim_position()` button
- **Data:** Positions where current_time >= unlock_timestamp

### InventoryManager - History Tab

- **Query:** `user_positions()`
- **Display:** All positions with timestamps
- **Data:** Complete position_history array

### GlobalStatsBar

- **Query:** `global_stats()`
- **Display:** Total VST Locked (TVL), User Power from `user_total_power()`

## Testing

Run the test suite:

```bash
cd contracts/sails/vstreet
cargo test
```

### Test Coverage

1. **vault_stake_works** - Basic staking functionality
2. **vault_multiple_stakes_work** - Multiple positions with different convictions
3. **vault_global_stats_work** - Protocol-wide statistics
4. **vault_query_methods_work** - All query methods

### Note on Time-based Tests

Testing unlock functionality requires block timestamp advancement, which is complex in gtest. In production testing:

```rust
// Advance time (conceptual - requires system manipulation)
system.spend_blocks(1000); // Advance blocks

// Then test unlock
vault_service.unlock_and_claim_position(position_id).await;
```

## Admin Functions

### `add_admin(new_admin: ActorId) -> Result<(), String>`

Adds a new administrator (admin-only).

### `set_vst_token_id(vst_token_id: ActorId) -> Result<(), String>`

Updates VST token contract address (admin-only).

## Security Considerations

1. **Token Approval Required** - Users must approve the vault contract before staking
2. **Timestamp Validation** - Unlock checks use `exec::block_timestamp()`
3. **Ownership Validation** - Only position owners can claim
4. **Overflow Protection** - All arithmetic uses checked operations
5. **State Consistency** - Updates both user and global state atomically

## Gas Optimization

- **Batch Claims** - Use `claim_multiple_positions()` to save gas
- **Query Optimization** - Position categorization happens client-side when possible
- **State Minimization** - Only essential data stored on-chain

## Future Enhancements

1. **Reward Distribution** - Additional rewards based on sVST power
2. **Early Unlock** - Penalty-based early withdrawal option
3. **Position Transfer** - NFT-based position ownership
4. **Compound Staking** - Auto-restake matured positions
5. **Governance Integration** - Use sVST for voting power

## Error Codes

| Error                                 | Description                |
| ------------------------------------- | -------------------------- |
| `ERROR_INVALID_AMOUNT`                | Stake amount must be > 0   |
| `ERROR_POSITION_NOT_FOUND`            | Position ID doesn't exist  |
| `ERROR_NOT_POSITION_OWNER`            | User is not the owner      |
| `ERROR_POSITION_NOT_MATURED`          | Current time < unlock time |
| `ERROR_POSITION_ALREADY_CLAIMED`      | Position already claimed   |
| `ERROR_POSITION_INACTIVE`             | Position is not active     |
| `ERROR_TRANSFER_FAILED`               | VFT transfer failed        |
| `ERROR_INSUFFICIENT_ADMIN_PRIVILEGES` | Admin-only action          |

## Building & Deployment

### Build

```bash
cd contracts/sails/vstreet
cargo build --release
```

This generates:

- WASM binary: `target/wasm32-unknown-unknown/release/vstreet.wasm`
- IDL: Auto-generated with vault service definitions
- Client code: `client/src/lib.rs`

### Deployment

```typescript
// Deploy program
const programId = await deployProgram({
  code: wasmBinary,
  gasLimit: 100_000_000_000,
  initPayload: [vstTokenAddress, ltv],
});

// Vault service is automatically initialized
// Access via sails.services.VaultService
```

## Contact & Support

For issues or questions about the Vault Service:

- Check tests: `tests/gtest.rs`
- Review service code: `app/src/services/vault_service.rs`
- Check state definitions: `app/src/states/vstreet_state.rs`
