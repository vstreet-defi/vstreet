import { encodeAddress, MessageSendOptions, GearApi, HexString } from '@gear-js/api';
import { web3FromSource, web3Accounts } from '@polkadot/extension-dapp';
import { decodeAddress } from '@polkadot/util-crypto';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { vstreetProgramID, fungibleTokenProgramID, idlVFT, idlVSTREET } from '../utils/smartPrograms';
import { useApi } from '@gear-js/react-hooks';
import { Program, Service } from '@/hocs/vft';

// INTERFACES
export interface FullState {
  balances: [string, any][];
}
export interface FullStateVST {
  apr?: number;
  users: { [key: string]: any };
}
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
    gasLimit,
    value: 0,
  };
}
export function createDepositMessage(amount: string): MessageSendOptions {
  return {
    destination: vstreetProgramID,
    payload: { Deposit: Number(amount) },
    gasLimit,
    value: 0,
  };
}
export function createWithdrawMessage(amount: string): MessageSendOptions {
  return {
    destination: vstreetProgramID,
    payload: { withdrawliquidity: Number(amount) },
    gasLimit,
    value: 0,
  };
}
export function createWithdrawRewardsMessage(): MessageSendOptions {
  return {
    destination: vstreetProgramID,
    payload: { WithdrawRewards: null },
    gasLimit,
    value: 0,
  };
}

// Status utility (para futuras tx si quieres)
function handleStatusUpdate(status: any, actionType: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const checkStatus = () => {
      if (status.isInBlock) {
        // You could do something here if needed
      } else if (status.type === 'Finalized') {
        resolve();
      }
    };
    checkStatus();
    const interval = setInterval(() => {
      if (status.type === 'Finalized') {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

export const getVstreetState = async (api: GearApi, setFullState: (contractInfo: string) => void) => {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);
  sails.parseIdl(idlVSTREET);
  sails.setProgramId(vstreetProgramID);

  try {
    sails.setApi(api);
    const bob = '0xfe0a346d8e240f29ff67679b83506e92542d41d87b2a6f947c4261e58881a167';
    const result = await sails.services.Service.queries.ContractInfo(bob, undefined, undefined);
    setFullState(result as string);
  } catch (error) {
    console.error('[getVstreetState] Error calling ContractInfo:', error);
  }
};

export const getVFTBalance = async (setBalance: (balance: number) => void, accountAddress: string, api: GearApi) => {
  if (!accountAddress) {
    setBalance(0);
    return;
  }

  if (!api) {
    setBalance(0);
    return;
  }

  try {
    const program = new Program(api, fungibleTokenProgramID);
    const svc = new Service(program);

    const result = await svc.balanceOf(accountAddress as HexString);

    setBalance(Number(result));
  } catch (error) {
    console.error('[getVFTBalance] Error fetching balance:', error);
    setBalance(0);
  }
};

function parseUserInfo(dataString: string): UserInfo {
  const cleanedString = dataString.substring(dataString.indexOf('{')).trim();
  const jsonString = cleanedString.replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
  return JSON.parse(jsonString);
}

export const getUserInfo = async (
  accountAddress: string,
  setUserInfo: (UserInfo: UserInfo) => void,
  api: GearApi | undefined,
) => {
  if (!accountAddress || typeof accountAddress !== 'string' || !api) {
    console.error('[getUserInfo] Invalid params', { accountAddress, api });
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
    return;
  }

  try {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVSTREET);
    sails.setProgramId(vstreetProgramID);
    sails.setApi(api);

    const result = await sails.services.Service.queries.UserInfo(accountAddress, undefined, undefined, accountAddress);
    const userInfoString = result as string;

    const parsedData = parseUserInfo(userInfoString);
    setUserInfo(parsedData);
  } catch (error) {
    console.error('[getUserInfo] Error calling UserInfo:', error);
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
};
