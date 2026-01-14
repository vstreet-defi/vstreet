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
