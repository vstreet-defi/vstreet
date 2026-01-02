import React from "react";
import styles from "./StakingInfo.module.scss";

/**
 * StakingInfo Component
 * Displays the user's current staking position, including total deposited 
 * funds and available rewards. Includes a claim action.
 */
function StakingInfo() {
  return (
    <div className={styles.myPositionCard}>
      <div className={styles.topAccent} />

      <div className={styles.header}>
        <h3 className={styles.title}>My position</h3>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Total Deposited</p>
          <p className={styles.statValue}>$0.00</p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>Available Rewards</p>
          <p className={styles.statValue}>$0.00</p>
        </div>
      </div>

      <button className={styles.claimButton} disabled>
        Claim Rewards
      </button>
    </div>
  );
}

export default StakingInfo;
