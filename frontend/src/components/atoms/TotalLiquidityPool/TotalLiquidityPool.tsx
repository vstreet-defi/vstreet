import React from "react";
import { useLiquidityData } from "contexts/stateContext";

const formatWithCommas = (number: number): string => {
  return number.toLocaleString();
};

const calculateTvl = (totalLiquidityPool: number): number => {
  return totalLiquidityPool / 1000000;
};

const TotalLiquidityPool: React.FC = () => {
  const liquidityData = useLiquidityData();

  if (!liquidityData) {
    return <div>Error: Liquidity data not available</div>;
  }

  const { totalLiquidityPool, apr } = liquidityData;
  const tvl = calculateTvl(totalLiquidityPool);

  return (
    <div className="Container">
      <div>
        <h2 className="Heading-Deposit">Deposit your $vUSD and earn</h2>
        <p className="DataAPY">{apr}% Annual Interest (APR)</p>
      </div>
      <div className="Box">
        <h2 className="Heading">Total Liquidity Pool:</h2>
        <p className="Data">${formatWithCommas(tvl)} vUSD</p>
      </div>
    </div>
  );
};

export default TotalLiquidityPool;
