import { useLiquidity } from "contexts/stateContext";

const formatWithCommas = (number: number | undefined): string => {
  if (number === undefined) {
    return "0";
  }
  return number.toLocaleString();
};

const calculateTvl = (totalLiquidityPool: number): number => {
  return totalLiquidityPool / 1000000;
};

const formatApr = (apr: number): string => {
  return (apr / 1000000).toFixed(2);
};

const TotalLiquidityPool: React.FC = () => {
  //Get Contract Info Data From Context
  const { liquidityData } = useLiquidity();

  //Format TVL
  const tvl = calculateTvl(liquidityData?.TotalDeposited || 0);

  return (
    <div className="Container">
      <div>
        <h2 className="Heading-Deposit">Deposit your $vUSD and earn</h2>
        <p className="DataAPY">
          {liquidityData ? formatApr(liquidityData.APR) : "loading"}% Annual
          Interest (APR)
        </p>
      </div>
      <div className="Box">
        <h2 className="Heading">Total Liquidity Pool:</h2>
        <p className="Data">
          ${liquidityData ? formatWithCommas(tvl) : "loading"}
          vUSD
        </p>
      </div>
    </div>
  );
};

export default TotalLiquidityPool;
