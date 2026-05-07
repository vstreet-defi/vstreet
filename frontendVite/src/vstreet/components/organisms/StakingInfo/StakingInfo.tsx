<<<<<<< HEAD
import React from 'react';
import styles from './StakingInfo.module.scss';
import { useUserInfo } from '../../../contexts/userInfoContext';
import { formatWithCommasVUSD } from 'utils/index';
=======
import React from "react";
import styles from "./StakingInfo.module.scss";
import { useUserInfo } from "../../../contexts/userInfoContext";
import { formatWithCommasVUSD } from "utils";
>>>>>>> VST-182-FE-MIGRATION-VITE

/**
 * StakingInfo Component
 * Displays the user's current staking position, including total deposited
 * funds and available rewards. Includes a claim action.
 */
function StakingInfo() {
  const { userInfo } = useUserInfo();

  return (
    <div className={styles.myPositionCard}>
      <div className={styles.topAccent} />

      <div className={styles.header}>
        <h3 className={styles.title}>My position</h3>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Total Deposited</p>
<<<<<<< HEAD
          <p className={styles.statValue}>{`$${formatWithCommasVUSD(userInfo?.balance_usdc ?? 0)} vUSD`}</p>
=======
          <p className={styles.statValue}>
            {`$${formatWithCommasVUSD(userInfo?.balance_usdc ?? 0)} vUSD`}
          </p>
>>>>>>> VST-182-FE-MIGRATION-VITE
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>Available Rewards</p>
<<<<<<< HEAD
          <p className={styles.statValue}>{`$${formatWithCommasVUSD(userInfo?.rewards_usdc ?? 0)} vUSD`}</p>
        </div>
      </div>

      <button className={styles.claimButton} disabled={!userInfo || userInfo.rewards_usdc <= 0}>
=======
          <p className={styles.statValue}>
            {`$${formatWithCommasVUSD(userInfo?.rewards_usdc ?? 0)} vUSD`}
          </p>
        </div>
      </div>

      <button
        className={styles.claimButton}
        disabled={!userInfo || userInfo.rewards_usdc <= 0}
      >
>>>>>>> VST-182-FE-MIGRATION-VITE
        Claim Rewards
      </button>
    </div>
  );
}

export default StakingInfo;
