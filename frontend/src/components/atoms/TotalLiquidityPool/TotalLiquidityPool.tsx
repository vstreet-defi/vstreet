import React from "react";
import { useLiquidity } from "contexts/stateContext";
import styles from "./TotalLiquidityPool.module.scss";
import CornerAccent from "../CornerAccent/CornerAccent";

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
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.leftSection}>
          <p className={styles.description}>Deposit your $wUSDT and earn</p>
        </div>

        <div className={styles.centerSection}>
          <p className={styles.label}>ANNUAL INTEREST (APR)</p>
          <p className={styles.value}>
            {liquidityData ? formatApr(liquidityData.APR) : "..."}%
          </p>
        </div>

        <div className={styles.rightSection}>
          <p className={styles.label}>TOTAL LIQUIDITY POOL</p>
          <p className={styles.value}>
            ${liquidityData ? formatWithCommas(tvl) : "..."} wUSDT
          </p>
        </div>
      </div>

      <CornerAccent position="top-left" color="#00ffc4" length={30} />
      <CornerAccent position="bottom-right" color="#4fff4b" length={30} />
    </div>
  );
};

export default TotalLiquidityPool;
