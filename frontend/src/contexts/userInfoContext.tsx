import React, { createContext, useContext, useState, ReactNode } from "react";
import { getUserInfo, UserInfo, getVFTBalance } from "smart-contracts-tools";

interface UserInfoContextProps {
  userInfo: UserInfo;
  fetchUserInfo: (hexAddress: string) => void;
  balance: number;
}

const UserInfoContext = createContext<UserInfoContextProps | undefined>(
  undefined
);

interface UserInfoProviderProps {
  children: ReactNode;
}

export const UserInfoProvider: React.FC<UserInfoProviderProps> = ({
  children,
}) => {
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

  const fetchUserInfo = async (hexAddress: string) => {
    try {
      await getUserInfo(hexAddress, setUserInfo);
      const balanceHex = await getVFTBalance(hexAddress, setBalance);

      // Check if userInfo has been updated correctly
      if (!userInfo) {
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

      console.log("BalanceVFT:", balanceHex);
      console.log("User info fetched:", userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
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

  return (
    <UserInfoContext.Provider value={{ userInfo, fetchUserInfo, balance }}>
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error("useUserInfo must be used within a UserInfoProvider");
  }
  return context;
};
