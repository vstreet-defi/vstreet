import { encodeAddress, MessageSendOptions } from "@gear-js/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { GearApi } from "@gear-js/api";
import {
  vstreetProgramID,
  fungibleTokenProgramID,
  decodedVstreetMeta,
  decodedFungibleTokenMeta,
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
      localBalances.some(([address, balance]: [string, number]) => {
        if (encodeAddress(address) === accountAddress) {
          setBalance(balance || 0);
          accountFound = true;
          return true; // Exit the loop early
        }
      });
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
