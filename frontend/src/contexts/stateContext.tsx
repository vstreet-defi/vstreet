import React, { createContext, useContext, useState, useEffect } from "react";

import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { idlVSTREET } from "utils/smartPrograms";
import { vstreetProgramID } from "utils/smartPrograms";

interface LiquidityData {
  APR: number;
  AvailableRewardsPool: number;
  BaseRate: number;
  DevFee: number;
  InterestRate: number;
  RiskMultiplier: number;
  TotalBorrowed: number;
  TotalDeposited: number;
  UtilizationFactor: number;
}

interface LiquidityContextProps {
  liquidityData: LiquidityData | null;
}

const LiquidityContext = createContext<LiquidityContextProps | undefined>(
  undefined
);

interface LiquidityProviderProps {
  children: React.ReactNode;
}

export const LiquidityProvider: React.FC<LiquidityProviderProps> = ({
  children,
}) => {
  const [liquidityData, setLiquidityData] = useState<LiquidityData | null>(
    null
  );

  useEffect(() => {
    const getLiquidityData = async () => {
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
      //In sails-js, you need to query from an account, we use the contract owner address as the account called bob
      const bob =
        "0xfe0a346d8e240f29ff67679b83506e92542d41d87b2a6f947c4261e58881a167";

      //Call the ContractInfo query, this calls are made automatically from the IDL file
      const result =
        await sails.services.LiquidityInjectionService.queries.ContractInfo(
          bob,
          undefined,
          undefined
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
      console.log("Contract Info Parsed Data:", parsedData);

      //Map the parsed data to the LiquidityData interface
      const liquidityData: LiquidityData = {
        APR: parsedData.APR,
        AvailableRewardsPool: parsedData.AvailableRewardsPool,
        BaseRate: parsedData.BaseRate,
        DevFee: parsedData.DevFee,
        InterestRate: parsedData.InterestRate,
        RiskMultiplier: parsedData.RiskMultiplier,
        TotalBorrowed: parsedData.TotalBorrowed,
        TotalDeposited: parsedData.TotalDeposited,
        UtilizationFactor: parsedData.UtilizationFactor,
      };
      setLiquidityData(liquidityData);
    };

    getLiquidityData();
  }, []);

  return (
    <LiquidityContext.Provider value={{ liquidityData }}>
      {children}
    </LiquidityContext.Provider>
  );
};

export const useLiquidity = () => {
  const context = useContext(LiquidityContext);
  if (context === undefined) {
    throw new Error("useLiquidity must be used within a LiquidityProvider");
  }
  return context;
};
