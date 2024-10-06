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
} from "../utils/smartPrograms";

export interface FullState {
  balances: [string, any][];
}
export interface FullStateVST {
  apr?: number;
  users: { [key: string]: any };
}
const gasLimit = 89981924500;

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
        console.log(`${actionType} is in block`);
      } else if (status.type === "Finalized") {
        console.log(`${actionType} finalized`);
        resolve();
      } else {
        console.log(`${actionType} in process`);
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

async function executeTransaction(
  api: GearApi,
  message: MessageSendOptions,
  metadata: any,
  account: any,
  accounts: any[]
): Promise<void> {
  const localAccountAddress = account?.address;
  const isVisibleAccount = accounts.some(
    (visibleAccount) => visibleAccount.address === localAccountAddress
  );

  if (!isVisibleAccount) {
    throw new Error("Account not available to sign");
  }

  const transferExtrinsic = await api.message.send(message, metadata);
  const injector = await web3FromSource(accounts[0].meta.source);

  const actionType = (payload: any) => {
    if ("Approve" in payload) return "Approve";
    if ("Deposit" in payload) return "Deposit";
    if ("withdrawliquidity" in payload) return "Withdraw";
    if ("WithdrawRewards" in payload) return "Withdraw Rewards";
    return "Transaction";
  };

  return new Promise<void>((resolve, reject) => {
    if (!localAccountAddress) {
      throw new Error("No account");
    }
    transferExtrinsic
      .signAndSend(
        localAccountAddress,
        { signer: injector.signer },
        async ({ status }) => {
          try {
            await handleStatusUpdate(status, actionType(message.payload));
            resolve();
          } catch (error: any) {
            reject(error);
          }
        }
      )
      .catch((error: any) => {
        reject(error);
      });
  });
}

export async function approveVSTTransaction(
  account: any,
  amount: string
): Promise<void> {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);

  const idl = idlVFT;

  sails.parseIdl(idl);

  const api = await GearApi.create({
    providerAddress: "wss://testnet.vara.network",
  });

  sails.setApi(api);

  sails.setProgramId(fungibleTokenProgramID);

  try {
    const transaction = await sails.services.Vft.functions.Approve(
      vstreetProgramID,
      amount
    );
    console.log("Transaction created:", transaction);

    // Retrieve all accounts from the wallet extension
    const injector = await web3FromSource(account.meta.source);
    console.log("Injector retrieved:", injector);

    // Set the account address and signer in the transaction
    transaction.withAccount(account, { signer: injector.signer });
    console.log("Transaction signed with account:", account);
  } catch (error) {
    console.error("Error during transaction approval:", error);
  }
}

export async function approveTransaction(
  api: GearApi,
  approveMessage: MessageSendOptions,
  account: any,
  accounts: any[]
): Promise<void> {
  return executeTransaction(
    api,
    approveMessage,
    decodedFungibleTokenMeta,
    account,
    accounts
  );
}

export async function depositTransaction(
  api: GearApi,
  depositMessage: MessageSendOptions,
  account: any,
  accounts: any[]
): Promise<void> {
  return executeTransaction(
    api,
    depositMessage,
    decodedVstreetMeta,
    account,
    accounts
  );
}

export async function withdrawTransaction(
  api: GearApi,
  withdrawMessage: MessageSendOptions,
  account: any,
  accounts: any[]
): Promise<void> {
  return executeTransaction(
    api,
    withdrawMessage,
    decodedVstreetMeta,
    account,
    accounts
  );
}
export async function withdrawRewardsTransaction(
  api: GearApi,
  withdrawRewardsMessage: MessageSendOptions,
  account: any,
  accounts: any[]
): Promise<void> {
  return executeTransaction(
    api,
    withdrawRewardsMessage,
    decodedVstreetMeta,
    account,
    accounts
  );
}

export const getVFTBalance = async (
  api: GearApi,
  accountAddress: string,
  setBalance: (balance: number) => void
) => {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);

  sails.parseIdl(idlVFT);

  sails.setProgramId(fungibleTokenProgramID);

  if (accountAddress) {
    try {
      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
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
      console.log(result);
    } catch (error) {
      console.error("Error calling BalanceOf:", error);
    }
  }

  if (!accountAddress) {
    setBalance(0);
    throw new Error("No account address");
  }
};

export const getBalanceVUSD = async (
  api: GearApi,
  accountAddress: string,
  setBalance: (balance: number) => void,
  setFullState: (state: FullState) => void
) => {
  try {
    const result = await api.programState.read(
      {
        programId: fungibleTokenProgramID,
        payload: undefined,
      },
      decodedFungibleTokenMeta
    );
    const rawState: unknown = result.toJSON();

    if (
      typeof rawState === "object" &&
      rawState !== null &&
      "balances" in rawState
    ) {
      const fullState = rawState as FullState;
      setFullState(fullState);

      const localBalances = fullState.balances || [];
      let accountFound = false;
      const account = localBalances.find(
        ([address]: [string, number]) =>
          encodeAddress(address) === accountAddress
      );

      if (account) {
        const [, balance] = account;
        setBalance(balance || 0);
        accountFound = true;
      }

      if (!accountFound) {
        setBalance(0);
      }
    } else {
      throw new Error("Unexpected fullState format");
    }
  } catch (error: any) {
    throw new Error(`Error: ${error}`);
  }
};

export const getStakingInfo = async (
  api: GearApi,
  accountAddress: string,
  setDepositedBalance: (balance: any) => void,
  setFullState: (state: FullStateVST) => void,
  setRewardsUsdc?: (rewards: any) => void
) => {
  try {
    const result = await api.programState.read(
      {
        programId: vstreetProgramID,
        payload: undefined,
      },
      decodedVstreetMeta
    );
    const rawState: unknown = result.toJSON();

    const fullState = rawState as FullStateVST;
    setFullState(fullState);

    const userAddress = accountAddress;
    if (userAddress && fullState.users && fullState?.users[userAddress]) {
      setDepositedBalance(fullState?.users[userAddress].balanceUsdc);
      if (setRewardsUsdc)
        setRewardsUsdc(fullState?.users[userAddress].rewardsUsdc);
    } else {
      console.log("User not found or no balanceUsdc available");
      setDepositedBalance(0);
      if (setRewardsUsdc) setRewardsUsdc(0);
    }
  } catch (error: any) {
    throw new Error(`Error: ${error}`);
  }
};

export const getAPR = async (
  api: GearApi,
  setApr: (apr: number) => void,
  setFullState: (state: FullStateVST) => void
) => {
  try {
    const result = await api.programState.read(
      {
        programId: vstreetProgramID,
        payload: undefined,
      },
      decodedVstreetMeta
    );
    const rawState: unknown = result.toJSON();

    const fullState = rawState as FullStateVST;
    setFullState(fullState);
    if (fullState.apr) setApr(fullState.apr / 10000);
  } catch (error: any) {
    throw new Error(`Error: ${error}`);
  }
};
