import { encodeAddress, MessageSendOptions } from "@gear-js/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { GearApi } from "@gear-js/api";
import { FullState } from "components/molecules/Basic-Input/BasicInput";
import {
  programIDVST,
  programIDFTUSDC,
  metadataVST,
  metadataFTUSDC,
} from "../utils/smartPrograms";
import { FullStateVST } from "components/molecules/Staking-Info-Card/StakingInfoCard";

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

function handleStatusUpdate(
  status: any,
  alert: any,
  actionType: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const checkStatus = () => {
      if (status.isInBlock) {
        alert.success(status.asInBlock.toString());
      } else if (status.type === "Finalized") {
        alert.success(status.type);
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

function handleTransactionSuccess(
  actionType: string,
  setIsLoading?: (loading: boolean) => void,
  alertModalContext?: any
) {
  setIsLoading && setIsLoading(false);
  alertModalContext?.hideAlertModal?.();
}

function handleTransactionError(
  error: any,
  alert: any,
  setIsLoading?: (loading: boolean) => void
) {
  console.log(":( transaction failed", error);
  alert.error(error.message);
  setIsLoading && setIsLoading(false);
}

async function executeTransaction(
  api: GearApi,
  message: MessageSendOptions,
  metadata: any,
  account: any,
  accounts: any[],
  alert: any,
  setIsLoading?: (loading: boolean) => void,
  alertModalContext?: any
): Promise<void> {
  const localAccountAddress = account?.address;
  const isVisibleAccount = accounts.some(
    (visibleAccount) => visibleAccount.address === localAccountAddress
  );

  if (!isVisibleAccount) {
    alert.error("Account not available to sign");
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
    transferExtrinsic
      .signAndSend(
        localAccountAddress ?? alert.error("No account"),
        { signer: injector.signer },
        async ({ status }) => {
          try {
            await handleStatusUpdate(
              status,
              alert,
              actionType(message.payload)
            );
            handleTransactionSuccess(
              actionType(message.payload),
              setIsLoading,
              alertModalContext
            );
            resolve();
          } catch (error) {
            handleTransactionError(error, alert, setIsLoading);
            reject(error);
          }
        }
      )
      .catch((error: any) => {
        handleTransactionError(error, alert, setIsLoading);
        reject(error);
      });
  });
}

export async function approveTransaction(
  api: GearApi,
  approveMessage: MessageSendOptions,
  account: any,
  accounts: any[],
  alert: any
): Promise<void> {
  return executeTransaction(
    api,
    approveMessage,
    metadataFTUSDC,
    account,
    accounts,
    alert
  );
}

export async function depositTransaction(
  api: GearApi,
  depositMessage: MessageSendOptions,
  account: any,
  accounts: any[],
  alert: any,
  setIsLoading: (loading: boolean) => void,
  alertModalContext: any
): Promise<void> {
  return executeTransaction(
    api,
    depositMessage,
    metadataVST,
    account,
    accounts,
    alert,
    setIsLoading,
    alertModalContext
  );
}

export async function withdrawTransaction(
  api: GearApi,
  withdrawMessage: MessageSendOptions,
  account: any,
  accounts: any[],
  alert: any,
  setIsLoading: (loading: boolean) => void,
  alertModalContext: any
): Promise<void> {
  return executeTransaction(
    api,
    withdrawMessage,
    metadataVST,
    account,
    accounts,
    alert,
    setIsLoading,
    alertModalContext
  );
}
export async function withdrawRewardsTransaction(
  api: GearApi,
  withdrawRewardsMessage: MessageSendOptions,
  account: any,
  accounts: any[],
  alert: any,
  setIsLoading: (loading: boolean) => void,
  alertModalContext: any
): Promise<void> {
  return executeTransaction(
    api,
    withdrawRewardsMessage,
    metadataVST,
    account,
    accounts,
    alert,
    setIsLoading,
    alertModalContext
  );
}

export const getBalance = async (
  api: GearApi,
  accountAddress: string,
  setBalance: (balance: any) => void,
  setFullState: (state: FullState) => void,
  alert: any
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
      localBalances.some(([address, balances]: [string, any]) => {
        if (encodeAddress(address) === accountAddress) {
          setBalance(balances);
          return true;
        }
        return false;
      });
    } else {
      throw new Error("Unexpected fullState format");
    }
  } catch (error: any) {
    alert.error(error.message);
  }
};

export const getStakingInfo = async (
  api: GearApi,
  accountAddress: string,
  setDepositedBalance: (balance: any) => void,
  setRewardsUsdc: (rewards: any) => void,
  setApr: (apr: any) => void,
  setFullState: (state: FullStateVST) => void,
  alert: any
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
      setRewardsUsdc(fullState?.users[userAddress].rewardsUsdc);
      setApr(fullState?.apr);
      return fullState?.users[userAddress].balanceUsdc;
    } else {
      console.log("User not found or no balanceUsdc available");
      return null;
    }
  } catch (error: any) {
    alert.error(error.message);
    console.log(error);
  }
};
