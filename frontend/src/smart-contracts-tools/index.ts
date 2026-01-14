import { encodeAddress, MessageSendOptions } from "@gear-js/api";
import { web3FromSource, web3Accounts } from "@polkadot/extension-dapp";
import { GearApi } from "@gear-js/api";

//Sails-js Imports
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

import {
  vstreetProgramID,
  fungibleTokenProgramID,
  decodedVstreetMeta,
  decodedFungibleTokenMeta,
  idlVFT,
  idlVSTREET,
  vaultProgramID,
  idlVAULT,
  vstTokenProgramID,
} from "../utils/smartPrograms";

export interface FullState {
  balances: [string, any][];
}
export interface FullStateVST {
  apr?: number;
  users: { [key: string]: any };
}
const gasLimit = 89981924500;

//New User Info Interface
export interface UserInfo {
  balance: number;
  rewards: number;
  rewards_withdrawn: number;
  liquidity_last_updated: number;
  borrow_last_updated: number;
  available_to_withdraw_vara: number;
  balance_usdc: number;
  balance_vara: number;
  is_loan_active: boolean;
  loan_amount: number;
  loan_amount_usdc: number;
  ltv: number;
  mla: number;
  rewards_usdc: number;
  rewards_usdc_withdrawn: number;
}

let gearApi: GearApi | undefined;
let gearApiPromise: Promise<GearApi> | null = null;

async function getAPI() {
  if (gearApi) return gearApi;
  if (gearApiPromise) return gearApiPromise;

  gearApiPromise = GearApi.create({
    providerAddress: "wss://testnet.vara.network",
  });
  gearApi = await gearApiPromise;
  return gearApi;
}

// Kick off initialization
getAPI().catch(console.error);

export function createApproveMessage(amount: string): MessageSendOptions {
  return {
    destination: fungibleTokenProgramID,
    payload: {
      Approve: {
        to: vstreetProgramID,
        amount: Number(amount),
      },
    },
    gasLimit: gasLimit,
    value: 0,
  };
}

export function createDepositMessage(amount: string): MessageSendOptions {
  return {
    destination: vstreetProgramID,
    payload: { Deposit: Number(amount) },
    gasLimit: gasLimit,
    value: 0,
  };
}

export function createWithdrawMessage(amount: string): MessageSendOptions {
  return {
    destination: vstreetProgramID,
    payload: { withdrawliquidity: Number(amount) },
    gasLimit: gasLimit,
    value: 0,
  };
}
export function createWithdrawRewardsMessage(): MessageSendOptions {
  return {
    destination: vstreetProgramID,
    payload: { WithdrawRewards: null },
    gasLimit: gasLimit,
    value: 0,
  };
}

// Sails cache
const sailsCache: Record<string, Sails> = {};

async function getSails(programId: string, idl: string) {
  if (sailsCache[programId]) return sailsCache[programId];

  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);
  sails.parseIdl(idl);
  sails.setProgramId(programId as `0x${string}`);
  const api = await getAPI();
  sails.setApi(api);

  sailsCache[programId] = sails;
  return sails;
}

export const getVFTDecimals = async (programId: string) => {
  try {
    const sails = await getSails(programId, idlVFT);
    const result = await sails.services.Vft.queries.Decimals(
      ("0x" + "0".repeat(64)) as `0x${string}`, // anonymous caller
      undefined,
      undefined
    );
    console.log(`[CONTRACT DECIMALS] ${programId} -> ${result}`);
    return result !== undefined && result !== null ? Number(result) : 18;
  } catch (error) {
    console.error(`[CONTRACT DECIMALS ERROR] ${programId}:`, error);
    return 18; // Default to 18
  }
};

export const getVFTBalance = async (
  accountAddress: string,
  programId: string,
  setBalance: (balance: number) => void
) => {
  if (!accountAddress) {
    console.warn("getVFTBalance: No account address provided");
    return;
  }

  try {
    const sails = await getSails(programId, idlVFT);
    console.log(
      `[CONTRACT BALANCE QUERY] Checking: ${accountAddress} on ${programId}`
    );

    const result = await sails.services.Vft.queries.BalanceOf(
      accountAddress as `0x${string}`, // caller (origin)
      undefined,
      undefined,
      accountAddress as `0x${string}` // target address
    );

    console.log(
      `[CONTRACT BALANCE RESULT] ${programId} for ${accountAddress} ->`,
      result,
      typeof result
    );

    if (result !== undefined && result !== null) {
      // Use string conversion to avoid BigInt to Number issues if huge
      const rawString = result.toString();
      // We still use number for the UI state, but at least we log the raw string
      const balanceVal = Number(BigInt(rawString));
      setBalance(balanceVal);
    } else {
      setBalance(0);
    }
  } catch (error) {
    console.error(`[CONTRACT BALANCE ERROR] ${programId}:`, error);
    setBalance(0);
  }
};

export const getUserInfo = async (
  accountAddress: string,
  setUserInfo: (UserInfo: UserInfo) => void
) => {
  if (!accountAddress) return;

  try {
    const sails = await getSails(vstreetProgramID, idlVSTREET);
    console.log(`[CONTRACT USERINFO QUERY] Checking: ${accountAddress}`);

    const result =
      await sails.services.LiquidityInjectionService.queries.UserInfo(
        accountAddress as `0x${string}`,
        undefined,
        undefined,
        accountAddress as `0x${string}`
      );

    const userInfoStr = result as string;

    // Improved parser logic
    const parseUserInfo = (dataString: string): UserInfo => {
      const cleanedString = dataString
        .substring(dataString.indexOf("{"))
        .trim();
      const jsonString = cleanedString
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"');
      return JSON.parse(jsonString);
    };

    const parsedData = parseUserInfo(userInfoStr);
    setUserInfo(parsedData);
    console.log("[CONTRACT USERINFO RESULT]", parsedData);
  } catch (error) {
    console.error("[CONTRACT USERINFO ERROR]:", error);

    // If user doesn't exist in contract yet (panicked with Option::unwrap on None),
    // set default empty values
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("panicked") ||
      errorMessage.includes("Option::unwrap")
    ) {
      console.log(
        "[CONTRACT USERINFO] User not found in contract, using default values"
      );
      setUserInfo({
        balance: 0,
        rewards: 0,
        rewards_withdrawn: 0,
        liquidity_last_updated: 0,
        borrow_last_updated: 0,
        available_to_withdraw_vara: 0,
        balance_usdc: 0,
        balance_vara: 0,
        is_loan_active: false,
        loan_amount: 0,
        loan_amount_usdc: 0,
        ltv: 0,
        mla: 0,
        rewards_usdc: 0,
        rewards_usdc_withdrawn: 0,
      });
    }
  }
};

// ============================================
// VAULT SERVICE TYPES AND FUNCTIONS
// ============================================

// Conviction levels for staking
export type ConvictionLevel = "Day1" | "Day7" | "Day14" | "Day28" | "Day90";

// Vault position interface
export interface VaultPosition {
  id: bigint;
  user: string;
  amount: bigint;
  conviction_level: ConvictionLevel;
  multiplier: bigint;
  power: bigint;
  start_timestamp: bigint;
  unlock_timestamp: bigint;
  is_active: boolean;
  claimed: boolean;
}

// Global vault stats interface
export interface GlobalVaultStats {
  total_vst_locked: bigint;
  total_power: bigint;
  active_positions_count: bigint;
}

// User vault info interface
export interface UserVaultInfo {
  total_staked_vst: bigint;
  total_power: bigint;
  active_positions: bigint[];
  matured_positions: bigint[];
  position_history: bigint[];
}

// Helper to get Vault Sails instance
export const getVaultSails = async () => {
  return getSails(vaultProgramID, idlVAULT);
};

// Get global vault statistics
export const getGlobalVaultStats = async (): Promise<GlobalVaultStats | null> => {
  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.GlobalStats(
      ("0x" + "0".repeat(64)) as `0x${string}`,
      undefined,
      undefined
    );
    console.log("[VAULT GLOBAL STATS]", result);
    return result as GlobalVaultStats;
  } catch (error) {
    console.error("[VAULT GLOBAL STATS ERROR]:", error);
    return null;
  }
};

// Get user's active positions
export const getUserActivePositions = async (
  accountAddress: string
): Promise<VaultPosition[]> => {
  if (!accountAddress) return [];

  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.UserActivePositions(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );
    console.log("[VAULT ACTIVE POSITIONS]", result);
    return (result as VaultPosition[]) || [];
  } catch (error) {
    console.error("[VAULT ACTIVE POSITIONS ERROR]:", error);
    return [];
  }
};

// Get user's matured positions (ready to claim)
export const getUserMaturedPositions = async (
  accountAddress: string
): Promise<VaultPosition[]> => {
  if (!accountAddress) return [];

  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.UserMaturedPositions(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );
    console.log("[VAULT MATURED POSITIONS]", result);
    return (result as VaultPosition[]) || [];
  } catch (error) {
    console.error("[VAULT MATURED POSITIONS ERROR]:", error);
    return [];
  }
};

// Get all user positions (for history)
export const getUserAllPositions = async (
  accountAddress: string
): Promise<VaultPosition[]> => {
  if (!accountAddress) return [];

  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.UserPositions(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );
    console.log("[VAULT ALL POSITIONS]", result);
    return (result as VaultPosition[]) || [];
  } catch (error) {
    console.error("[VAULT ALL POSITIONS ERROR]:", error);
    return [];
  }
};

// Get user vault info with categorization
export const getUserVaultInfo = async (
  accountAddress: string
): Promise<UserVaultInfo | null> => {
  if (!accountAddress) return null;

  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.UserVaultInfo(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );
    console.log("[VAULT USER INFO]", result);
    return result as UserVaultInfo;
  } catch (error) {
    console.error("[VAULT USER INFO ERROR]:", error);
    return null;
  }
};

// Get user total power (sVST)
export const getUserTotalPower = async (
  accountAddress: string
): Promise<bigint> => {
  if (!accountAddress) return BigInt(0);

  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.UserTotalPower(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );
    console.log("[VAULT USER POWER]", result);
    return BigInt(result?.toString() || "0");
  } catch (error) {
    console.error("[VAULT USER POWER ERROR]:", error);
    return BigInt(0);
  }
};

// Get user total staked VST
export const getUserTotalStaked = async (
  accountAddress: string
): Promise<bigint> => {
  if (!accountAddress) return BigInt(0);

  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.UserTotalStaked(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );
    console.log("[VAULT USER STAKED]", result);
    return BigInt(result?.toString() || "0");
  } catch (error) {
    console.error("[VAULT USER STAKED ERROR]:", error);
    return BigInt(0);
  }
};

// Get time until position unlocks
export const getTimeUntilUnlock = async (
  positionId: bigint
): Promise<bigint> => {
  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.TimeUntilUnlock(
      ("0x" + "0".repeat(64)) as `0x${string}`,
      undefined,
      undefined,
      positionId
    );
    console.log("[VAULT TIME UNTIL UNLOCK]", result);
    return BigInt(result?.toString() || "0");
  } catch (error) {
    console.error("[VAULT TIME UNTIL UNLOCK ERROR]:", error);
    return BigInt(0);
  }
};

// Get position details
export const getPositionDetails = async (
  positionId: bigint
): Promise<VaultPosition | null> => {
  try {
    const sails = await getVaultSails();
    const result = await sails.services.VaultService.queries.PositionDetails(
      ("0x" + "0".repeat(64)) as `0x${string}`,
      undefined,
      undefined,
      positionId
    );
    console.log("[VAULT POSITION DETAILS]", result);
    return result as VaultPosition | null;
  } catch (error) {
    console.error("[VAULT POSITION DETAILS ERROR]:", error);
    return null;
  }
};

// Map conviction ID to contract enum
export const mapConvictionToEnum = (convictionId: string): ConvictionLevel => {
  const mapping: Record<string, ConvictionLevel> = {
    "x1": "Day1",
    "x7": "Day7",
    "x14": "Day14",
    "x28": "Day28",
    "x90": "Day90",
  };
  return mapping[convictionId] || "Day1";
};

// Stake VST tokens (returns transaction builder for signing)
export const stakeVst = async (
  accountAddress: string,
  amount: bigint,
  convictionLevel: ConvictionLevel
) => {
  if (!accountAddress) throw new Error("No account address provided");

  const sails = await getVaultSails();
  console.log("[VAULT STAKE VST] Preparing transaction:", {
    accountAddress,
    amount: amount.toString(),
    convictionLevel,
  });

  // Build the transaction
  const tx = sails.services.VaultService.functions.StakeVst(
    amount,
    convictionLevel
  );

  return tx;
};

// Create approval message for VST token to Vault contract
export const createVstApproveForVault = async (
  accountAddress: string,
  amount: bigint
) => {
  const sails = await getSails(vstTokenProgramID, idlVFT);
  console.log("[VAULT VST APPROVE] Preparing approval:", {
    spender: vaultProgramID,
    amount: amount.toString(),
  });

  const tx = sails.services.Vft.functions.Approve(
    vaultProgramID as `0x${string}`,
    amount
  );

  return tx;
};

// Unlock and claim a single position
export const unlockAndClaimPosition = async (
  accountAddress: string,
  positionId: bigint
) => {
  if (!accountAddress) throw new Error("No account address provided");

  const sails = await getVaultSails();
  console.log("[VAULT UNLOCK POSITION] Preparing transaction:", {
    accountAddress,
    positionId: positionId.toString(),
  });

  const tx = sails.services.VaultService.functions.UnlockAndClaimPosition(
    positionId
  );

  return tx;
};

// Claim multiple matured positions
export const claimMultiplePositions = async (
  accountAddress: string,
  positionIds: bigint[]
) => {
  if (!accountAddress) throw new Error("No account address provided");

  const sails = await getVaultSails();
  console.log("[VAULT CLAIM MULTIPLE] Preparing transaction:", {
    accountAddress,
    positionIds: positionIds.map((id) => id.toString()),
  });

  const tx = sails.services.VaultService.functions.ClaimMultiplePositions(
    positionIds
  );

  return tx;
};
