import React, { useState } from "react";
import { FundsCardBorrow } from "../../molecules/cards/FundsCardBorrow";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";
import styles from "../FundsManager/FundsManager.module.scss";

const MODES = {
  COLLATERAL: "Collateral",
  LOAN: "Loan",
};

const ACTIONS = {
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
  BORROW: "Borrow",
  PAY: "Pay",
};

/**
 * FundsManagerBorrow Component
 * Handles the high-level logic for the Borrow tab, allowing users to manage
 * their TVARA collateral and vUSD loan/debt positions.
 */
function FundsManagerBorrow() {
  const [selectedMode, setSelectedMode] = useState(MODES.COLLATERAL);
  const [selectedAction, setSelectedAction] = useState(ACTIONS.DEPOSIT);

  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
    // Set default action based on the selected mode
    if (mode === MODES.COLLATERAL) {
      setSelectedAction(ACTIONS.DEPOSIT);
    } else {
      setSelectedAction(ACTIONS.BORROW);
    }
  };

  const handleSelectAction = (action: string) => {
    setSelectedAction(action);
  };

  const getSubtitle = () => {
    if (selectedMode === MODES.COLLATERAL) {
      return "Manage your TVARA collateral to increase your borrowing power";
    }
    return "Manage your wUSDT loan and debt positions";
  };

  return (
    <div className={styles.mainContentCard}>
      {/* Visual Accents */}
      <CornerAccent
        position="top-left"
        color="#00ffc4"
        length={40}
        thickness={2}
      />
      <CornerAccent
        position="top-right"
        color="#4fff4b"
        length={40}
        thickness={2}
      />
      <CornerAccent
        position="bottom-left"
        color="#4fff4b"
        length={40}
        thickness={2}
      />
      <CornerAccent
        position="bottom-right"
        color="#00ffc4"
        length={40}
        thickness={2}
      />

      <div className={styles.header}>
        <h2 className={styles.title}>{selectedMode} Management</h2>
        <p className={styles.subtitle}>{getSubtitle()}</p>
        <div className={styles.divider} />
      </div>

      {/* Main Mode Selection (Collateral vs Loan) */}
      <div className={styles.tabs} style={{ marginBottom: "24px" }}>
        {Object.values(MODES).map((mode) => (
          <button
            key={mode}
            onClick={() => handleSelectMode(mode)}
            className={`${styles.tab} ${
              selectedMode === mode ? styles.active : ""
            }`}
            style={{ flex: 1 }}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Action Selection (Deposit/Withdraw or Borrow/Pay) */}
      <div className={styles.tabs}>
        {(selectedMode === MODES.COLLATERAL
          ? [ACTIONS.DEPOSIT, ACTIONS.WITHDRAW]
          : [ACTIONS.BORROW, ACTIONS.PAY]
        ).map((action) => (
          <button
            key={action}
            onClick={() => handleSelectAction(action)}
            className={`${styles.tab} ${
              selectedAction === action ? styles.active : ""
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <FundsCardBorrow buttonLabel={selectedAction} mode={selectedMode} />
      </div>
    </div>
  );
}

export { FundsManagerBorrow };
