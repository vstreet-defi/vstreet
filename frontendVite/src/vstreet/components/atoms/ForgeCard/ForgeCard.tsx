import React from "react";
import styles from "./ForgeCard.module.scss";

/**
 * Props for the ForgeCard component.
 */
interface ForgeCardProps {
    term: string;
    discount: string;
    vibe: string;
    isActive: boolean;
    onClick: () => void;
}

/**
 * ForgeCard
 * 
 * Interactive card for selecting maturity periods in the bonding process.
 * Displays the term, discount percentage, and thematic metadata.
 */
const ForgeCard: React.FC<ForgeCardProps> = ({ term, discount, vibe, isActive, onClick }) => {
    return (
        <div
            className={`${styles.card} ${isActive ? styles.active : ""}`}
            onClick={onClick}
        >
            <div className={styles.term}>{term}</div>
            <div className={styles.discount}>{discount} OFF</div>
            <div className={styles.vibe}>{vibe}</div>
        </div>
    );
};

export default ForgeCard;
