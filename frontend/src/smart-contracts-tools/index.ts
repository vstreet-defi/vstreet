import { encodeAddress, MessageSendOptions } from "@gear-js/api";
import { web3FromSource, web3Accounts } from "@polkadot/extension-dapp";
import { GearApi } from "@gear-js/api";

//Sails-js Imports
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

import {
  vstreetProgramID,
  fungibleTokenProgramID,
  idlVFT,
  idlVSTREET,
} from "../utils/smartPrograms";

// Sails-js Types for Vaults
export type ConvictionLevel = "Day1" | "Day7" | "Day14" | "Day28" | "Day90";

// Helper to map raw conviction_level u8 to readable string
// Common patterns: 0-4 (index), 1/7/14/28/90 (days), or custom values
export function mapConvictionLevel(raw: number | string): ConvictionLevel {
  const value = Number(raw);
  // Try index-based mapping first (0-4)
  const indexMap: Record<number, ConvictionLevel> = {
    0: "Day1", 1: "Day7", 2: "Day14", 3: "Day28", 4: "Day90"
  };
  if (indexMap[value]) return indexMap[value];

  // Try day-value based mapping (1, 7, 14, 28, 90)
  const dayMap: Record<number, ConvictionLevel> = {
    1: "Day1", 7: "Day7", 14: "Day14", 28: "Day28", 90: "Day90"
  };
  if (dayMap[value]) return dayMap[value];

  // Fallback for unknown values
  console.warn(`[mapConvictionLevel] Unknown value: ${value}, defaulting to Day1`);
  return "Day1";
}

export interface VaultPosition {
  id: string; // u128 as string
  user: string;
  amount: number | string; // Can be large u128 string for precision
  conviction_level: ConvictionLevel | number; // Accept raw u8 or mapped string
  multiplier: number;
  power: number | string; // Can be large u128 string for precision
  start_timestamp: number;
  unlock_timestamp: number;
  is_active: boolean;
  claimed: boolean;
}

export interface GlobalVaultStats {
  total_vst_locked: number;
  total_power: number;
  active_positions_count: number;
}

export interface UserVaultInfo {
  total_staked_vst: number;
  total_power: number;
  active_positions: string[];
  matured_positions: string[];
  position_history: string[];
}

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

// VAULT SERVICE MESSAGES
export function createStakeVstMessage(amount: string, conviction: ConvictionLevel): any {
  return {
    VaultService: {
      StakeVst: [Number(amount), conviction],
    },
  };
}

export function createUnlockPositionMessage(positionId: string): any {
  return {
    VaultService: {
      UnlockAndClaimPosition: [positionId],
    },
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
      "0x" + "0".repeat(64) as `0x${string}`, // anonymous caller
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
    console.log(`[CONTRACT BALANCE QUERY] Checking: ${accountAddress} on ${programId}`);

    const result = await sails.services.Vft.queries.BalanceOf(
      accountAddress as `0x${string}`, // caller (origin)
      undefined,
      undefined,
      accountAddress as `0x${string}` // target address
    );

    console.log(`[CONTRACT BALANCE RESULT] ${programId} for ${accountAddress} ->`, result, typeof result);

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

    const result = await sails.services.LiquidityInjectionService.queries.UserInfo(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    );

    const userInfoStr = result as string;

    // Improved parser logic
    const parseUserInfo = (dataString: string): UserInfo => {
      const cleanedString = dataString.substring(dataString.indexOf("{")).trim();
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
  }
};

// VAULT SERVICE QUERIES
export const getVaultGlobalStats = async (setStats: (stats: GlobalVaultStats) => void) => {
  try {
    const sails = await getSails(vstreetProgramID, idlVSTREET);
    const result = (await sails.services.VaultService.queries.GlobalStats(
      ("0x" + "0".repeat(64)) as `0x${string}`,
      undefined,
      undefined
    )) as any;

    if (result) {
      setStats({
        total_vst_locked: Number(result.total_vst_locked),
        total_power: Number(result.total_power),
        active_positions_count: Number(result.active_positions_count),
      });
    }
  } catch (error) {
    console.error("[VAULT GLOBAL STATS ERROR]:", error);
  }
};

export const getUserVaultInfo = async (
  accountAddress: string,
  setUserInfo: (info: UserVaultInfo) => void
) => {
  if (!accountAddress) return;

  try {
    const sails = await getSails(vstreetProgramID, idlVSTREET);
    const result = (await sails.services.VaultService.queries.UserVaultInfo(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    )) as any;

    if (result) {
      setUserInfo({
        total_staked_vst: Number(result.total_staked_vst),
        total_power: Number(result.total_power),
        active_positions: result.active_positions.map((id: any) => id.toString()),
        matured_positions: result.matured_positions.map((id: any) => id.toString()),
        position_history: result.position_history.map((id: any) => id.toString()),
      });
    }
  } catch (error) {
    console.error("[USER VAULT INFO ERROR]:", error);
  }
};

export const getUserActivePositions = async (
  accountAddress: string,
  setPositions: (positions: VaultPosition[]) => void
) => {
  if (!accountAddress) return;

  try {
    const sails = await getSails(vstreetProgramID, idlVSTREET);

    // Get position IDs from UserVaultInfo (avoids vec<struct> deserialization issues)
    const vaultInfo = (await sails.services.VaultService.queries.UserVaultInfo(
      accountAddress as `0x${string}`,
      undefined,
      undefined,
      accountAddress as `0x${string}`
    )) as any;

    const activeIds = (vaultInfo?.active_positions || []).map((id: any) => id.toString());
    const maturedIds = (vaultInfo?.matured_positions || []).map((id: any) => id.toString());
    const historyIds = (vaultInfo?.position_history || []).map((id: any) => id.toString());
    const allIds = Array.from(new Set([...activeIds, ...maturedIds, ...historyIds]));

    // Fetch each position individually via PositionDetails
    const allPositions: any[] = [];
    for (const id of allIds) {
      try {
        const posResult = await sails.services.VaultService.queries.PositionDetails(
          accountAddress as `0x${string}`,
          undefined,
          undefined,
          BigInt(id)
        );
        if (posResult && typeof posResult === 'object') {
          allPositions.push(posResult);
        }
      } catch (posError) {
        console.warn(`Failed to fetch position ${id}:`, posError);
      }
    }

    // Parse u128 values (hex strings or BigInt) preserving precision
    const parseBigValue = (val: any): number | string => {
      if (val === undefined || val === null) return 0;
      try {
        // Handle hex strings like "0x506c75e2d6310000"
        if (typeof val === 'string' && val.startsWith('0x')) {
          const bigVal = BigInt(val);
          // Return as string to avoid precision loss for very large numbers
          return bigVal.toString();
        }
        // Handle BigInt directly
        if (typeof val === 'bigint') {
          return val.toString();
        }
        // Handle string numbers
        if (typeof val === 'string') {
          return val;
        }
        // Already a number
        return val;
      } catch (e) {
        console.warn("[parseBigValue] Error parsing:", val, e);
        return 0;
      }
    };

    // Helper to parse timestamps (in seconds, not milliseconds)
    const parseTimestamp = (val: any): number => {
      if (val === undefined || val === null) return 0;
      try {
        if (typeof val === 'string' && val.startsWith('0x')) {
          return Number(BigInt(val));
        }
        if (typeof val === 'bigint') {
          return Number(val);
        }
        return Number(val);
      } catch (e) {
        return 0;
      }
    };


    const parsedPositions: VaultPosition[] = allPositions.map((pos: any, idx: number) => {
      // Handle both camelCase and snake_case field names
      const rawAmount = pos.amount ?? pos.stakedAmount ?? pos.staked_amount ?? 0;
      const rawPower = pos.power ?? pos.votingPower ?? pos.voting_power ?? 0;
      const rawStartTs = pos.start_timestamp ?? pos.startTimestamp ?? pos.created_at ?? pos.createdAt ?? 0;
      const rawUnlockTs = pos.unlock_timestamp ?? pos.unlockTimestamp ?? pos.maturity_date ?? pos.maturityDate ?? 0;
      const rawConviction = pos.conviction_level ?? pos.convictionLevel ?? pos.conviction ?? 0;
      const rawIsActive = pos.is_active ?? pos.isActive ?? true;
      const rawClaimed = pos.claimed ?? pos.isClaimed ?? pos.is_claimed ?? false;

      const parsedAmount = parseBigValue(rawAmount);
      let parsedPower = parseBigValue(rawPower);
      const parsedStartTs = parseTimestamp(rawStartTs);
      const parsedUnlockTs = parseTimestamp(rawUnlockTs);
      const multiplier = Number(pos.multiplier ?? 100);

      // Calculate power locally if contract value is corrupted
      const MAX_REASONABLE_POWER = BigInt(10 ** 18) * BigInt(10 ** 9);
      try {
        const powerBigInt = BigInt(String(parsedPower).split('.')[0]);
        if (powerBigInt > MAX_REASONABLE_POWER) {
          const amountBigInt = BigInt(String(parsedAmount).split('.')[0]);
          parsedPower = ((amountBigInt * BigInt(multiplier)) / BigInt(100)).toString();
        }
      } catch {
        const amountNum = Number(parsedAmount) || 0;
        parsedPower = String(Math.floor(amountNum * multiplier / 100));
      }



      // Determine category from UserVaultInfo arrays (source of truth)
      const posId = pos.id?.toString() || "0";
      let category: 'active' | 'matured' | 'history' = 'history';
      if (activeIds.includes(posId)) {
        category = 'active';
      } else if (maturedIds.includes(posId)) {
        category = 'matured';
      }

      return {
        id: posId,
        user: pos.user ?? pos.owner ?? accountAddress,
        amount: parsedAmount,
        conviction_level: mapConvictionLevel(rawConviction),
        multiplier: multiplier,
        power: parsedPower,
        start_timestamp: parsedStartTs,
        unlock_timestamp: parsedUnlockTs,
        is_active: category === 'active',
        claimed: category === 'history', // Use category instead of buggy contract value
        _category: category, // Add explicit category for frontend use
      } as VaultPosition & { _category: string };
    });

    // Filter out corrupted positions
    const isValidPosition = (pos: VaultPosition): boolean => {
      const idStr = String(pos.id);
      if (idStr.length > 10) return false;

      const validConvictions = ["Day1", "Day7", "Day14", "Day28", "Day90"];
      if (!validConvictions.includes(String(pos.conviction_level))) return false;

      if (pos.multiplier > 10000) return false;

      return true;
    };

    const validPositions = parsedPositions.filter(isValidPosition);
    setPositions(validPositions);

  } catch (error) {
    console.error("[getUserActivePositions Error]:", error);
    setPositions([]);
  }
};
