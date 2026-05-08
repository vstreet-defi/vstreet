import React from 'react';
import { useLiquidity } from 'contexts/stateContext';
import { formatUSDC } from 'utils';
import styles from './TotalLiquidityPool.module.scss';
import CornerAccent from '../CornerAccent/CornerAccent';

const formatApr = (apr: number): string => {
  return (apr / 1000000).toFixed(2);
};

const TotalLiquidityPool: React.FC = () => {
  //Get Contract Info Data From Context
  const { liquidityData } = useLiquidity();

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.leftSection}>
          <p className={styles.description}>Deposit your $wUSDT and earn</p>
        </div>

        <div className={styles.centerSection}>
          <p className={styles.label}>ANNUAL INTEREST (APR)</p>
          <p className={styles.value}>{liquidityData ? formatApr(liquidityData.APR) : '...'}%</p>
        </div>

        <div className={styles.rightSection}>
          <p className={styles.label}>TOTAL LIQUIDITY POOL</p>
          <p className={styles.value}>${liquidityData ? formatUSDC(liquidityData.TotalDeposited) : '...'} wUSDT</p>
        </div>
      </div>

      <CornerAccent position="top-left" color="#00ffc4" length={30} />
      <CornerAccent position="bottom-right" color="#4fff4b" length={30} />
    </div>
  );
};

export default TotalLiquidityPool;
