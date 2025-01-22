import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserInfo, UserInfo, getVFTBalance } from "smart-contracts-tools";

interface UserInfoContextProps {
  userInfo: UserInfo | null;
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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const fetchUserInfo = async (hexAddress: string) => {
    try {
      const userInfo = await getUserInfo(hexAddress, setUserInfo);
      const balanceHex = await getVFTBalance(hexAddress, setBalance);

      console.log("BalanceVFT:", balance);
      console.log("User info fetched:", userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
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
