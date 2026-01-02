import React, { useEffect } from "react";
import { useLiquidity } from "contexts/stateContext";
import { useWallet } from "contexts/accountContext";
import { useUserInfo } from "contexts/userInfoContext";
import { formatWithCommasVARA, formatWithCommasVUSD } from "utils/index";
import styles from "../../organisms/StakingInfo/StakingInfo.module.scss";

/**
 * Formats the daily interest rate from a raw numeric value.
 */
const formatDailyInterest = (number: number) => {
  const decimalsFactor = 1000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
};

/**
 * LoanInfoCard Component
 * Displays the user's current loan position, including collateral, 
 * borrowing power, debt, and LTV.
 */
const LoanInfoCard: React.FC = () => {
  const liquidityData = useLiquidity();
  const { selectedAccount, hexAddress } = useWallet();
  const { userInfo, fetchUserInfo } = useUserInfo();

  useEffect(() => {
    if (selectedAccount) {
      fetchUserInfo(hexAddress);
    }
  }, [selectedAccount, hexAddress, fetchUserInfo]);

  const ltv = userInfo?.ltv || 0;

  return (
    <div className={styles.myPositionCard}>
      <div className={styles.topAccent} />

      <div className={styles.header}>
        <h3 className={styles.title} style={{ fontWeight: 800 }}>My Loan position</h3>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Total Collateral Deposited</p>
          <p className={styles.statValue}>
            ${formatWithCommasVARA(userInfo?.balance_vara ?? 0)} TVARA
          </p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>Available To Borrow</p>
          <p className={styles.statValue}>
            ${formatWithCommasVUSD(userInfo?.mla ?? 0)} vUSD
          </p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>Current Loan/Debt</p>
          <p className={styles.statValue}>
            ${userInfo?.loan_amount ? formatWithCommasVUSD(userInfo.loan_amount) : 0} vUSD
          </p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>Loan To Value (LTV)</p>
          <p className={`${styles.statValue} ${ltv > 70 ? styles.danger : ""}`}>
            {ltv}%
          </p>
        </div>

        <div className={styles.statItem}>
          <p className={styles.statLabel}>Daily Loan Interest</p>
          <p className={styles.statValue}>
            {formatDailyInterest(liquidityData?.liquidityData?.InterestRate ?? 0)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanInfoCard;
