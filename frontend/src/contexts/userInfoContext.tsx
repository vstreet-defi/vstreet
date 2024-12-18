import React, { createContext, useContext, useState, useEffect } from "react";

import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { idlVSTREET } from "utils/smartPrograms";
import { vstreetProgramID } from "utils/smartPrograms";
import { useWallet } from "contexts/accountContext";

interface UserInfo {
  Balance: number;
  Rewards: number;
  RewardsWithdrawn: number;
  LiquidityLastUpdated: number;
  BorrowLastUpdated: number;
  BalanceUSDC: number;
  RewardsUSDC: number;
  RewardsWithdrawnUSDC: number;
  BalanceVara: number;
  MLA: number;
  CV: number;
  AvailableToWithdrawnVara: number;
  LoanAmount: number;
  LoanAmountUSDC: number;
  IsLoanActive: boolean;
  LTV: number;
}

interface UserInfoContextProps {
  userInfo: UserInfo | null;
}

const UserInfoContext = createContext<UserInfoContextProps | undefined>(
  undefined
);

interface UserInfoProviderProps {
  children: React.ReactNode;
}

export const UserInfoProvider: React.FC<UserInfoProviderProps> = ({
  children,
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  //THIS IS AN IDEA OF HOW TO MANAGE USER INFO IN A CONTEXT,
  //MISSING LOGIC TO DYNAMICALLY UPDATE THE USER INFO BASED ON THE ACCOUNT SELECTED
  //AND IMPLEMENTATION OF THE USER INFO IN THE UI (USER INFO PROVIDER)
  //---->------>------->
  useEffect(() => {
    const getUserInfo = async () => {
      const { allAccounts, selectedAccount, isWalletConnected, hexAddress } =
        useWallet();
      //Parse IDL (Metadata) of the contract
      const parser = await SailsIdlParser.new();
      const sails = new Sails(parser);

      sails.parseIdl(idlVSTREET);

      sails.setProgramId(vstreetProgramID);

      if (hexAddress) {
        try {
          const gearApi = await GearApi.create({
            providerAddress: "wss://testnet.vara.network",
          });
          sails.setApi(gearApi);
          // functionArg1, functionArg2 are the arguments of the query function from the IDL file
          const result =
            await sails.services.LiquidityInjectionService.queries.UserInfo(
              hexAddress,
              undefined,
              undefined,
              hexAddress
            );
          const userInfo = result as string;

          //Parse the data string into an object
          const parseDataString = (dataString: string) => {
            const dataObject: { [key: string]: number } = {};
            const pairs = dataString.split(",");

            pairs.forEach((pair) => {
              const [key, value] = pair.split(":").map((item) => item.trim());
              const normalizedKey = key.replace(/\s+/g, "");
              dataObject[normalizedKey] = Number(value);
            });

            return dataObject;
          };

          const parsedData = parseDataString(userInfo);
          console.log("User Info Parsed Data:", parsedData);
        } catch (error) {
          console.error("Error getting user info:", error);
        }
      }
    };

    getUserInfo();
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo }}>
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
