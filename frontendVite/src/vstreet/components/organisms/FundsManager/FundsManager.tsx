import React, { useState } from "react";
import { FundsCard } from "../../molecules/cards/FundsCard";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";
import styles from "./FundsManager.module.scss";

const TABS = {
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
};

/**
 * FundsManager Component
 * Handles the high-level logic for the Supply tab, allowing users to switch 
 * between Deposit and Withdraw modes.
 */
function FundsManager() {
  const [selectedTab, setSelectedTab] = useState(TABS.DEPOSIT);

  const handleSelectTab = (tab: string) => {
    setSelectedTab(tab);
  };

  return (
    <div className={styles.mainContentCard}>
      {/* Visual Accents */}
      <CornerAccent position="top-left" color="#00ffc4" length={40} thickness={2} />
      <CornerAccent position="top-right" color="#4fff4b" length={40} thickness={2} />
      <CornerAccent position="bottom-left" color="#4fff4b" length={40} thickness={2} />
      <CornerAccent position="bottom-right" color="#00ffc4" length={40} thickness={2} />

      <div className={styles.header}>
        <h2 className={styles.title}>Supply Assets</h2>
        <p className={styles.subtitle}>Deposit your assets to start earning yields</p>
        <div className={styles.divider} />
      </div>

      {/* Mode Selection Tabs */}
      <div className={styles.tabs}>
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => handleSelectTab(tab)}
            className={`${styles.tab} ${selectedTab === tab ? styles.active : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <FundsCard
          buttonLabel={selectedTab}
        />
      </div>
    </div>
  );
}

export { FundsManager };