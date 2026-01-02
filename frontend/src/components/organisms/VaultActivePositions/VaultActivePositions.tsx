import React from "react";
import VaultCard, { VaultCardProps } from "../../molecules/VaultCard/VaultCard";
import styles from "./VaultActivePositions.module.scss";

interface VaultActivePositionsProps {
  items: VaultCardProps[]; // Using the props directly for simplicity in mapping
  emptyMessage?: string;
}

const VaultActivePositions: React.FC<VaultActivePositionsProps> = ({ 
  items, 
  emptyMessage = "No positions found." 
}) => {
  if (items.length === 0) {
    return <div className={styles.emptyState}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.container}>
      {items.map((item, index) => (
        <VaultCard key={index} {...item} />
      ))}
    </div>
  );
};

export default VaultActivePositions;
