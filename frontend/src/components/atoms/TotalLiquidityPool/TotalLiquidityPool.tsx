import { get } from "http";
import React, { useEffect } from "react";
// import { useLiquidityData } from "contexts/stateContext";
import { useApi } from "@gear-js/react-hooks";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { idlVSTREET, vstreetProgramID } from "utils/smartPrograms";
import { getVstreetState } from "smart-contracts-tools";

const formatWithCommas = (number: number): string => {
  return number.toLocaleString();
};

const calculateTvl = (totalLiquidityPool: number): number => {
  return totalLiquidityPool / 1000000;
};



const TotalLiquidityPool: React.FC = () => {

  // const setFullState = React.useState<FullStateVST | FullState>();
  // const liquidityData = getVstreetState(api, setFullState());

  // if (!liquidityData) {
  //   return <div>Error: Liquidity data not available</div>;
  // }

  // const { totalLiquidityPool, apr } = liquidityData;
  // const tvl = calculateTvl(totalLiquidityPool);

  const { api } = useApi();

 const [liquidityData, setLiquidityData] = React.useState<{ [key: string]: number } | undefined>();


  useEffect(() => { 

  //Query Liquidit Pool State
  const getLiquidityData = async () => {
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);


  sails.parseIdl(idlVSTREET);
  sails.setProgramId(vstreetProgramID);
    
      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
      sails.setApi(gearApi);
      const bob = "0xfe0a346d8e240f29ff67679b83506e92542d41d87b2a6f947c4261e58881a167";
      // functionArg1, functionArg2 are the arguments of the query function from the IDL file
      const result = await sails.services.LiquidityInjectionService.queries.ContractInfo(bob, undefined, undefined);
      const contractInfo = result as string;

      // Parse the data string into an object
      const dataString = contractInfo;

      const parseDataString = (dataString: string) => {
        const dataObject: { [key: string]: number } = {};
        const pairs = dataString.split(',');
      
        pairs.forEach(pair => {
          const [key, value] = pair.split(':').map(item => item.trim());
          dataObject[key] = Number(value);
        });
      
        return dataObject;
      };
      
     const liquidityData = parseDataString(dataString);
      setLiquidityData(liquidityData);
      console.log(liquidityData);
      
 

  
}
getLiquidityData();
  }
    
, []);

const apr = liquidityData?.APR;
  

  return (
    <div className="Container">
      <div>
        <h2 className="Heading-Deposit">Deposit your $vUSD and earn</h2>
        <p className="DataAPY">{apr}% Annual Interest (APR)</p>
      </div>
      <div className="Box">
        <h2 className="Heading">Total Liquidity Pool:</h2>
        <p className="Data">${formatWithCommas(10000)} vUSD</p>
      </div>
    </div>
  );


};

export default TotalLiquidityPool;
