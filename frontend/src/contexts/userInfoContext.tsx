import React, { createContext, useContext, useState, useEffect } from "react";

import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { idlVSTREET } from "utils/smartPrograms";
import { vstreetProgramID } from "utils/smartPrograms";

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

  useEffect(() => {
    const getUserInfo = async () => {
      //Parse IDL (Metadata) of the contract
      const parser = await SailsIdlParser.new();
      const sails = new Sails(parser);
      sails.parseIdl(idlVSTREET);

      //Set the program ID
      sails.setProgramId(vstreetProgramID);

      //Create a new API instance
      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
      sails.setApi(gearApi);
      //In sails-js, you need to query from an account, we use the contract address as the account called bob
      const bob =
        "0xfe0a346d8e240f29ff67679b83506e92542d41d87b2a6f947c4261e58881a167";
      //For testing purposes, we are using a hardcoded address, but this should be the user's address
      const userAddress = "0x1234567890123456789012345678901234567890";

      //Call the ContractInfo query, this calls are made automatically from the IDL file
      const result =
        await sails.services.LiquidityInjectionService.queries.UserInfo(
          bob,
          undefined,
          undefined,
          userAddress
        );

      const contractInfo = result as string;

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

      const parsedData = parseDataString(contractInfo);
      console.log("Parsed Data:", parsedData);
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
