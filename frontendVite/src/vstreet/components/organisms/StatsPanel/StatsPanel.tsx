import React, { useEffect, useState } from 'react';
import { useUserInfo } from 'contexts/userInfoContext';
import { useWallet } from 'contexts/accountContext';
import { useLiquidity } from 'contexts/stateContext';
import { formatWithCommasVUSD, formatUSDC } from 'utils';
import styles from './StatsPanel.module.scss';

/**
 * StatsPanel Component
 * Displays global protocol statistics and the user's current wallet balance.
 * Used as the primary overview sidebar in the Supply tab.
 */
const StatsPanel: React.FC = () => {
  const { balance } = useUserInfo();
  const { selectedAccount } = useWallet();
  const [formatBalanceVUSD, setFormatBalanceVUSD] = useState('0.00');

  const formatApr = (apr: number): string => {
    return (apr / 1000000).toFixed(2);
  };

  //Get Contract Info Data From Context
  const { liquidityData } = useLiquidity();

  useEffect(() => {
    if (selectedAccount) {
      const balanceNum = balance / 1000000;
      setFormatBalanceVUSD(balanceNum.toLocaleString());
    } else {
      setFormatBalanceVUSD('0.00');
    }
  }, [selectedAccount, balance]);

  return (
    <div className={styles.walletCard}>
      <div className={styles.topAccent} />

      <div className={styles.header}>
        <h3 className={styles.title}>Overview</h3>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Wallet Balance</p>
          <p className={styles.statValue}>{formatBalanceVUSD} wUSDT</p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>TOTAL LIQUIDITY POOL</p>
          <p className={styles.statValue}>${liquidityData ? formatUSDC(liquidityData.TotalDeposited) : '...'} wUSDT</p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>ANNUAL INTEREST (APR)</p>
          <p className={styles.statValue}> {liquidityData ? formatApr(liquidityData.APR) : '...'}%</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
