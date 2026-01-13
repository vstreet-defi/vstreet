import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { getUserInfo, UserInfo, getVFTBalance, getVFTDecimals } from "smart-contracts-tools";
import { fungibleTokenProgramID, vstTokenProgramID } from "../utils/smartPrograms";

interface UserInfoContextProps {
  userInfo: UserInfo;
  fetchUserInfo: (hexAddress: string, overrideID?: string) => void;
  balance: number; // For backward compatibility (vUSD)
  vstBalance: number;
  vstDecimals: number;
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
  const [balanceVUSD, setBalanceVUSD] = useState<number>(0);
  const [balanceVST, setBalanceVST] = useState<number>(0);
  const [vstDecimals, setVstDecimals] = useState<number>(18);

  const fetchUserInfo = useCallback(async (hexAddress: string, overrideID?: string) => {
    if (!hexAddress) return;
    console.log("UserInfoContext: Starting fetch for", hexAddress, overrideID ? `with override ${overrideID}` : "");

    // 1. Fetch main UserInfo
    try {
      await getUserInfo(hexAddress, setUserInfo);
    } catch (e) {
      console.error("Failed to fetch UserInfo:", e);
    }

    // 2. Fetch vUSD Balance
    try {
      await getVFTBalance(hexAddress, fungibleTokenProgramID, (val) => {
        console.log("vUSD Context State Update:", val);
        setBalanceVUSD(val);
      });
    } catch (e) {
      console.error("Failed to fetch vUSD balance:", e);
    }

    // 3. Fetch VST Balance and Decimals
    const targetID = overrideID || vstTokenProgramID;
    try {
      const decimals = await getVFTDecimals(targetID);
      setVstDecimals(decimals);

      await getVFTBalance(hexAddress, targetID, (val) => {
        console.log("VST Context State Update:", val);
        setBalanceVST(val);
      });
    } catch (e) {
      console.error("Failed to fetch VST balance/decimals:", e);
    }
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo, fetchUserInfo, balance: balanceVUSD, vstBalance: balanceVST, vstDecimals }}>
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
