import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { idlVSTREET } from "utils/smartPrograms";
import { FullStateVST } from "smart-contracts-tools";
import { decodedVstreetMeta, vstreetProgramID } from "utils/smartPrograms";
import { formatNumber } from "utils";
import { useApi } from "@gear-js/react-hooks";
import { getVstreetState } from "smart-contracts-tools";

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
      const parser = await SailsIdlParser.new();
      const sails = new Sails(parser);

      sails.parseIdl(idlVSTREET);
      sails.setProgramId(vstreetProgramID);

      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
      sails.setApi(gearApi);
      const bob =
        "0xfe0a346d8e240f29ff67679b83506e92542d41d87b2a6f947c4261e58881a167";
      const result =
        await sails.services.LiquidityInjectionService.queries.ContractInfo(
          bob,
          undefined,
          undefined
        );
      const contractInfo = result as string;

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
      console.log("Parsed Data Keys:", Object.keys(parsedData));

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
