import React from "react";
import styles from "./VaultCard.module.scss";

export interface VaultCardProps {
  type: "active" | "matured" | "history";
  amount: string;
  multiplier?: string;
  secondaryValue: string; // Power or Timestamp
  secondaryLabel: string;
  tertiaryValue?: string; // Time remaining or Date or Status
  tertiaryLabel?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const VaultCard: React.FC<VaultCardProps> = ({
  type,
  amount,
  multiplier,
  secondaryValue,
  secondaryLabel,
  tertiaryValue,
  tertiaryLabel,
  onAction,
  actionLabel,
}) => {
  const isMatured = type === "matured";

  return (
    <div className={styles.card}>
      {/* Column 1: Amount & Multiplier */}
      <div>
        <div className={styles.label}>
          {type === "history" ? "Operation" : type === "matured" ? "Matured Position" : "Staked Amount"}
        </div>
        <div className={styles.value}>
          {amount}
          {multiplier && <span className={styles.multiplier}>{multiplier}</span>}
        </div>
      </div>

      {/* Column 2: Secondary Info (Power/Date) */}
      <div>
        <div className={styles.label}>{secondaryLabel}</div>
        <div className={styles.value}>{secondaryValue}</div>
      </div>

      {/* Column 3: Tertiary Info (Timer/Status) */}
      <div>
        {tertiaryLabel && <div className={styles.label}>{tertiaryLabel}</div>}
        {tertiaryValue && (
          <div
            className={`${styles.value} ${type === "active" ? styles.countdown : ""} ${
              isMatured ? styles.readyStatus : ""
            }`}
          >
            {tertiaryValue}
          </div>
        )}
      </div>

      {/* Column 4: Action Button (if any) */}
      {onAction && actionLabel && (
        <button className={styles.unlockBtn} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default VaultCard;
