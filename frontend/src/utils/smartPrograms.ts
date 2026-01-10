import { ProgramMetadata } from "@gear-js/api";

//Last Refactored Contract missing APR and Deposits (needed to deposit and borrow first to get APR)
// "0x0e16095ec8aa2d4a32a881b74da54f6b0db407951597ca9b74a135a88a758c49"
//user rewrds fix 5
// "0xa13193606f0335101f0169fef005976b02accc0f5e7f2f8a7eb86b467e63cd39"

//Working Contract with Vaults & Liquidity
export const vstreetProgramID =
  "0x42fd0436f6d8ede8b0097c81e814a1f107ad3e1025add3be9ba7fe1a884b52e2";

//This meta is not longer used, use idlVSTREET instead
// decodedVstreetMeta was removed as we now use Sails IDL exclusively.

//vUSD Contract
export const vstreetVFTProgramID =
  "0x464511231a1afe9108a689ed3dbbb047ca308d6f5dfb86453e4df5612a2d668a";

//Same but different variable that was used before (not used in sails).
export const fungibleTokenProgramID =
  "0x464511231a1afe9108a689ed3dbbb047ca308d6f5dfb86453e4df5612a2d668a";

//VST Token Contract (For Staking)
export const vstTokenProgramID =
  "0xf95e6e247054e898a15395715503a9343fd80f95c6a516bf63f17e10e7d144be";

//IDL for the VFT contract (New Metadata Schema)
export const idlVFT = `constructor {
  New : (name: str, symbol: str, decimals: u8);
};

service Vft {
  Burn : (from: actor_id, value: u256) -> bool;
  GrantAdminRole : (to: actor_id) -> null;
  GrantBurnerRole : (to: actor_id) -> null;
  GrantMinterRole : (to: actor_id) -> null;
  Mint : (to: actor_id, value: u256) -> bool;
  RevokeAdminRole : (from: actor_id) -> null;
  RevokeBurnerRole : (from: actor_id) -> null;
  RevokeMinterRole : (from: actor_id) -> null;
  Approve : (spender: actor_id, value: u256) -> bool;
  Transfer : (to: actor_id, value: u256) -> bool;
  TransferFrom : (from: actor_id, to: actor_id, value: u256) -> bool;
  query Admins : () -> vec actor_id;
  query Burners : () -> vec actor_id;
  query Minters : () -> vec actor_id;
  query Allowance : (owner: actor_id, spender: actor_id) -> u256;
  query BalanceOf : (account: actor_id) -> u256;
  query Decimals : () -> u8;
  query Name : () -> str;
  query Symbol : () -> str;
  query TotalSupply : () -> u256;

  events {
      Minted: struct { to: actor_id, value: u256 };
      Burned: struct { from: actor_id, value: u256 };
      Approval: struct { owner: actor_id, spender: actor_id, value: u256 };
      Transfer: struct { from: actor_id, to: actor_id, value: u256 };
  }
};`;

//IDL for the working VSTREET contract (Includes Liquidity & Vaults)
export const idlVSTREET = `type ConvictionLevel = enum {
  Day1,
  Day7,
  Day14,
  Day28,
  Day90,
};

type VaultPosition = struct {
  id: u128,
  user: actor_id,
  amount: u128,
  conviction_level: u8,
  multiplier: u32,
  power: u128,
  start_timestamp: u64,
  unlock_timestamp: u64,
  is_active: bool,
  claimed: bool,
};

type GlobalVaultStats = struct {
  total_vst_locked: u128,
  total_power: u128,
  active_positions_count: u32,
};

type UserVaultInfo = struct {
  total_staked_vst: u128,
  total_power: u128,
  active_positions: vec u128,
  matured_positions: vec u128,
  position_history: vec u128,
};

constructor {
  NewWithVft : (vft_contract_id: actor_id, ltv: u128);
};

service LiquidityInjectionService {
  DepositCollateral : () -> str;
  DepositLiquidity : (amount: u128) -> str;
  ModifyAvailableRewardsPool : (amount: u128) -> result (null, str);
  PayAllLoan : () -> str;
  PayLoan : (amount: u128) -> str;
  SetBaseRate : (base_rate: u128) -> str;
  SetDevFee : (dev_fee: u128) -> str;
  SetLtv : (ltv: u128) -> str;
  SetRiskMultiplier : (risk_multiplier: u128) -> str;
  SetVaraPrice : (vara_price: u128) -> str;
  SetVftContractId : (vft_contract_id: actor_id) -> str;
  TakeLoan : (amount: u128) -> result (null, str);
  UpdateAllCollateralAvailableToWithdraw : () -> null;
  WithdrawCollateral : (amount: u128) -> result (null, str);
  WithdrawLiquidity : (amount: u128) -> str;
  WithdrawRewards : () -> result (null, str);
  query AllUsers : () -> str;
  query ContractInfo : () -> str;
  query ContractOwner : () -> str;
  query TotalDeposited : () -> str;
  query UserAvailableToWithdraw : (user: actor_id, collateral: str) -> str;
  query UserBalance : (user: actor_id) -> str;
  query UserInfo : (user: actor_id) -> str;
  query UserRewards : (user: actor_id) -> str;
  query VftContractId : () -> str;

  events {
    Deposit: struct { amount: u128 };
    VFTseted: actor_id;
    WithdrawLiquidity: struct { amount: u128 };
    WithdrawRewards: struct { amount_withdrawn: u128 };
    Error: str;
    TotalBorrowedModified: struct { borrowed: u128 };
    AvailableRewardsPoolModified: struct { pool: u128 };
    DepositedVara: struct { amount: u128 };
    WithdrawnVara: struct { amount: u128 };
    LoanTaken: struct { amount: u128 };
    LoanPayed: struct { amount: u128 };
  }
};

service VaultService {
  StakeVst : (amount: u128, conviction_level: ConvictionLevel) -> result (VaultPosition, str);
  UnlockAndClaimPosition : (position_id: u128) -> null;
  ClaimMultiplePositions : (position_ids: vec u128) -> null;
  AddAdmin : (admin: actor_id) -> null;
  SetVstTokenId : (vst_token_id: actor_id) -> null;
  query GlobalStats : () -> GlobalVaultStats;
  query UserVaultInfo : (user: actor_id) -> UserVaultInfo;
  query UserActivePositions : (user: actor_id) -> vec VaultPosition;
  query UserMaturedPositions : (user: actor_id) -> vec VaultPosition;
  query UserPositions : (user: actor_id) -> vec VaultPosition;
  query UserTotalPower : (user: actor_id) -> u128;
  query UserTotalStaked : (user: actor_id) -> u128;
  query PositionDetails : (position_id: u128) -> opt VaultPosition;
  query TimeUntilUnlock : (position_id: u128) -> u64;
};`;

const fungibleTokenMeta =
  "00010001000000000001030000000107000000000000000108000000a90b3400081466745f696f28496e6974436f6e66696700000c01106e616d65040118537472696e6700011873796d626f6c040118537472696e67000120646563696d616c73080108753800000400000502000800000503000c081466745f696f204654416374696f6e000118104d696e74040010011075313238000000104275726e040010011075313238000100205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380002001c417070726f7665080108746f14011c4163746f724964000118616d6f756e74100110753132380003002c546f74616c537570706c790004002442616c616e63654f66040014011c4163746f724964000500001000000507001410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001801205b75383b2033325d0000180000032000000008001c081466745f696f1c46544576656e74000110205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380000001c417070726f76650c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380001002c546f74616c537570706c790400100110753132380002001c42616c616e63650400100110753132380003000020081466745f696f3c496f46756e6769626c65546f6b656e00001801106e616d65040118537472696e6700011873796d626f6c040118537472696e67000130746f74616c5f737570706c791001107531323800012062616c616e6365732401505665633c284163746f7249642c2075313238293e000128616c6c6f77616e6365732c01905665633c284163746f7249642c205665633c284163746f7249642c2075313238293e293e000120646563696d616c730801087538000024000002280028000004081410002c00000230003000000408142400";
export const decodedFungibleTokenMeta = ProgramMetadata.from(fungibleTokenMeta);
