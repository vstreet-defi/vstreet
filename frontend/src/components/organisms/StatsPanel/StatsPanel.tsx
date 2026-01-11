import React, { useEffect, useState } from "react";
import { hexToBn } from "@polkadot/util";
import { useUserInfo } from "contexts/userInfoContext";
import { useWallet } from "contexts/accountContext";
import { formatWithCommasVUSD } from "utils";
import styles from "./StatsPanel.module.scss";

/**
 * StatsPanel Component
 * Displays global protocol statistics and the user's current wallet balance.
 * Used as the primary overview sidebar in the Supply tab.
 */
const StatsPanel: React.FC = () => {
  const { balance } = useUserInfo();
  const { selectedAccount } = useWallet();
  const [formatBalanceVUSD, setFormatBalanceVUSD] = useState("0.00");

  /**
   * Converts a hex balance value to a human-readable decimal string.
   */
  const convertHexToDecimal = (hexValue: string) => {
    return hexToBn(hexValue).toString();
  };

  useEffect(() => {
    if (selectedAccount) {
      // Convert raw hex balance to decimal and apply 6-decimal precision for vUSD
      const balanceConverted = convertHexToDecimal(balance.toString());
      const balanceNum = balance / 1000000;
      setFormatBalanceVUSD(balanceNum.toLocaleString());
    } else {
      setFormatBalanceVUSD("0.00");
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
          <p className={styles.statValue}>$3,000,001 wUSDT</p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>ANNUAL INTEREST (APR)</p>
          <p className={styles.statValue}>0.01%</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
