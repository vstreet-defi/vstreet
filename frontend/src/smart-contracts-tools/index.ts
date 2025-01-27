import { encodeAddress, MessageSendOptions } from "@gear-js/api";
import { web3FromSource, web3Accounts } from "@polkadot/extension-dapp";
import { GearApi } from "@gear-js/api";

//Sails-js Impotrts
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
import { useEffect } from "react";

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
  balance_usdc: number; // Add this line
  balance_vara: number;
  is_loan_active: boolean;
  loan_amount: number;
  loan_amount_usdc: number;
  ltv: number;
  mla: number;
  rewards_usdc: number;
  rewards_usdc_withdrawn: number;
}
let gearApi: GearApi;

async function getAPI() {
  gearApi = await GearApi.create({
    providerAddress: "wss://testnet.vara.network",
  });
}

getAPI();

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

function handleStatusUpdate(status: any, actionType: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const checkStatus = () => {
      if (status.isInBlock) {
      } else if (status.type === "Finalized") {
        resolve();
      } else {
      }
    };

    checkStatus();

    const interval = setInterval(() => {
      if (status.type === "Finalized") {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

//Query Liquidit Pool State, this is only for example new one used in Total Liquidity is in stateContext.tsx
export const getVstreetState = async (
  api: GearApi,
  setFullState: (contractInfo: string) => void
) => {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);

  sails.parseIdl(idlVSTREET);
  sails.setProgramId(vstreetProgramID);

  try {
    sails.setApi(gearApi);
    const bob =
      "0xfe0a346d8e240f29ff67679b83506e92542d41d87b2a6f947c4261e58881a167";
    // functionArg1, functionArg2 are the arguments of the query function from the IDL file
    const result =
      await sails.services.LiquidityInjectionService.queries.ContractInfo(
        bob,
        undefined,
        undefined
      );
    const contractInfo = result as string;
    setFullState(contractInfo);
  } catch (error) {
    console.error("Error calling ContractInfo:", error);
  }
};

export const getVFTBalance = async (
  accountAddress: string,
  setBalance: (balance: number) => void
) => {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);

  sails.parseIdl(idlVFT);

  sails.setProgramId(fungibleTokenProgramID);

  if (accountAddress) {
    try {
      sails.setApi(gearApi);
      // functionArg1, functionArg2 are the arguments of the query function from the IDL file
      const result = await sails.services.Vft.queries.BalanceOf(
        accountAddress,
        undefined,
        undefined,
        accountAddress
      );
      const balance = result as number;
      setBalance(balance);
    } catch (error) {
      console.error("Error calling BalanceOf:", error);
    }
  }
};

export const getUserInfo = async (
  accountAddress: string,
  setUserInfo: (UserInfo: UserInfo) => void
) => {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);

  sails.parseIdl(idlVSTREET);

  sails.setProgramId(vstreetProgramID);

  if (accountAddress) {
    try {
      sails.setApi(gearApi);
      // functionArg1, functionArg2 are the arguments of the query function from the IDL file
      const result =
        await sails.services.LiquidityInjectionService.queries.UserInfo(
          accountAddress,
          undefined,
          undefined,
          accountAddress
        );
      const userInfo = result as string;
      // Convert the data string to a JSON-compatible format and parse it
      const parseUserInfo = (dataString: string): UserInfo => {
        // Remove all characters before the first '{' and trim the string
        const cleanedString = dataString
          .substring(dataString.indexOf("{"))
          .trim();
        // Replace single quotes with double quotes and remove any trailing commas
        const jsonString = cleanedString
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"');
        return JSON.parse(jsonString);
      };

      const parsedData = parseUserInfo(userInfo);
      setUserInfo(parsedData);
    } catch (error) {
      console.error("Error calling BalanceOf:", error);
    }
  }
};
