import React from "react";
import styles from "./GlobalStatsBar.module.scss";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";

interface GlobalStatsBarProps {
  tvl?: string;
  vstPrice?: string;
  userPower?: string;
}

/**
 * GlobalStatsBar Component
 * Displays high-level protocol and user statistics for the Vaults section.
 */
const GlobalStatsBar: React.FC<GlobalStatsBarProps> = ({
  tvl = "2,450,000",
  vstPrice = "1.24",
  userPower = "0.00",
}) => {
  return (
    <div className={styles.statsBar}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h3 className={styles.title}>Vaults Console</h3>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Total Value Locked</span>
          <span className={styles.value}>${tvl}</span>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>$VST Price</span>
          <span className={styles.value}>${vstPrice}</span>
        </div>

        <div className={`${styles.section} ${styles.highlight}`}>
          <span className={styles.label}>Your Power ($sVST)</span>
          <span className={styles.value}>{userPower} sVST</span>
        </div>
      </div>

      {/* Visual Accents matching the brand style */}
      <CornerAccent position="top-left" color="#00ffc4" length={20} thickness={1} />
      <CornerAccent position="bottom-right" color="#4fff4b" length={20} thickness={1} />
    </div>
  );
};

export default GlobalStatsBar;
