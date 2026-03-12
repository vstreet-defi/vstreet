import React from "react";
import styles from "./ForgeStatsHeader.module.scss";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";

interface ForgeStatsHeaderProps {
    dexPrice?: string;
    discount?: string;
    backing?: string;
}

/**
 * ForgeStatsHeader
 * 
 * Displays high-level protocol statistics for the bonding hub,
 * including market prices, available discounts, and treasury backing.
 */
const ForgeStatsHeader: React.FC<ForgeStatsHeaderProps> = ({
    dexPrice = "1.24",
    discount = "30%",
    backing = "$VARA",
}) => {
    return (
        <div className={styles.statsBar}>
            <div className={styles.content}>
                <div className={styles.brand}>
                    <h3 className={styles.title}>The Forge</h3>
                </div>

                <div className={styles.section}>
                    <span className={styles.label}>DEX Price</span>
                    <span className={styles.value}>${dexPrice}</span>
                </div>

                <div className={styles.section}>
                    <span className={styles.label}>Forge Discount</span>
                    <span className={`${styles.value} ${styles.neonGreen}`}>Up to {discount}</span>
                </div>

                <div className={styles.section}>
                    <span className={styles.label}>Treasury Backing</span>
                    <span className={styles.value}>{backing}</span>
                </div>
            </div>

            <CornerAccent position="top-left" color="#00ffc4" length={20} thickness={1} />
            <CornerAccent position="bottom-right" color="#4fff4b" length={20} thickness={1} />
        </div>
    );
};

export default ForgeStatsHeader;
