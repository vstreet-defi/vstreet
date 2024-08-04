import { encodeAddress, MessageSendOptions } from "@gear-js/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { GearApi } from "@gear-js/api";
import {
  programIDVST,
  programIDFTUSDC,
  metadataVST,
  metadataFTUSDC,
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
    destination: programIDFTUSDC,
    payload: {
      Approve: {
        to: programIDVST,
        amount: Number(amount),
      },
    },
    gasLimit: gasLimit,
    value: 0,
  };
}

export function createDepositMessage(amount: string): MessageSendOptions {
  return {
    destination: programIDVST,
    payload: { Deposit: Number(amount) },
    gasLimit: gasLimit,
    value: 0,
  };
}

export function createWithdrawMessage(amount: string): MessageSendOptions {
  return {
    destination: programIDVST,
    payload: { withdrawliquidity: Number(amount) },
    gasLimit: gasLimit,
    value: 0,
  };
}
export function createWithdrawRewardsMessage(): MessageSendOptions {
  return {
    destination: programIDVST,
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
        console.log("in process");
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
    metadataFTUSDC,
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
    metadataVST,
    account,
    accounts
  );
}

export async function withdrawTransaction(
  api: GearApi,
  withdrawMessage: MessageSendOptions,
  account: any,
  accounts: any[],
  setIsLoading: (loading: boolean) => void
): Promise<void> {
  return executeTransaction(
    api,
    withdrawMessage,
    metadataVST,
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
    metadataVST,
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
      { programId: programIDFTUSDC, payload: "" },
      metadataFTUSDC
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
      localBalances.some(([address, balance]: [string, number]) => {
        if (encodeAddress(address) === accountAddress) {
          setBalance(balance || 0);
        }
      });
    } else {
      throw new Error("Unexpected fullState format");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getStakingInfo = async (
  api: GearApi,
  accountAddress: string,
  setDepositedBalance: (balance: any) => void,
  setFullState: (state: FullStateVST) => void,
  setRewardsUsdc?: (rewards: any) => void,
  setApr?: (apr: any) => void
) => {
  try {
    const result = await api.programState.read(
      { programId: programIDVST },
      metadataVST
    );
    const rawState: unknown = result.toJSON();

    const fullState = rawState as FullStateVST;
    setFullState(fullState);
    console.log(fullState);

    const userAddress = accountAddress;
    if (userAddress && fullState.users && fullState?.users[userAddress]) {
      setDepositedBalance(fullState?.users[userAddress].balanceUsdc);
      if (setRewardsUsdc)
        setRewardsUsdc(fullState?.users[userAddress].rewardsUsdc);

      if (setApr) setApr(fullState?.apr);
    } else {
      console.log("User not found or no balanceUsdc available");
      setDepositedBalance(0);
      if (setRewardsUsdc) setRewardsUsdc(0);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
