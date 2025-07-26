import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { getUserInfo, UserInfo, getVFTBalance } from '../smart-contracts-tools';
import { useAccount } from '@gear-js/react-hooks';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { GearApi } from '@gear-js/api';

// Instancia global GearApi (o importa desde tu archivo si ya la tienes)
let gearApi: GearApi | undefined;
async function ensureGearApi() {
  if (!gearApi) {
    gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });
  }
}

interface UserInfoContextProps {
  userInfo: UserInfo;
  fetchUserInfo: (address?: string) => void;
  balance: number;
}

const UserInfoContext = createContext<UserInfoContextProps | undefined>(undefined);

interface UserInfoProviderProps {
  children: ReactNode;
}

// Helpers
function toHexAddress(address: string): string {
  if (address.startsWith('0x')) return address;
  try {
    return u8aToHex(decodeAddress(address));
  } catch (e) {
    console.error('[toHexAddress] Failed to convert address', address, e);
    return address;
  }
}

export const UserInfoProvider: React.FC<UserInfoProviderProps> = ({ children }) => {
  const { account } = useAccount();
  const [userInfo, setUserInfo] = useState<UserInfo>({
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
  const [balance, setBalance] = useState<number>(0);

  const fetchUserInfo = useCallback(
    async (address?: string) => {
     
      await ensureGearApi();
      if (!gearApi) {
        console.error('[fetchUserInfo] GearApi is not ready, skipping fetch...');
        return;
      }

      const rawAddress = address || account?.address;
      if (!rawAddress || typeof rawAddress !== 'string') {
        console.error('[fetchUserInfo] No valid address provided', { rawAddress });
        return;
      }
      const hexAddress = toHexAddress(rawAddress);

      try {
        await getUserInfo(hexAddress, setUserInfo, gearApi);
        await getVFTBalance(setBalance, hexAddress, gearApi);

        setTimeout(() => {
          console.log('[fetchUserInfo] BalanceVFT actualizado:', balance);
          console.log('[fetchUserInfo] User info fetched:', userInfo);
        }, 200);
      } catch (error) {
        console.error('Error fetching user info:', error);
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
        setBalance(0);
      }
    },
    [account?.address],
  );

  const contextValue = useMemo(() => ({ userInfo, fetchUserInfo, balance }), [userInfo, fetchUserInfo, balance]);

  return <UserInfoContext.Provider value={contextValue}>{children}</UserInfoContext.Provider>;
};

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
};
