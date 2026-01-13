import React from "react";
import ForgeStatsHeader from "../../molecules/ForgeStatsHeader/ForgeStatsHeader";
import TheForgeWidget from "../TheForgeWidget/TheForgeWidget";
import ActiveBondsManager from "../ActiveBondsManager/ActiveBondsManager";
import styles from "./ForgeManager.module.scss";

/**
 * ForgeManager
 * 
 * Central orchestrator for "The Forge" ($VST bonding) dashboard.
 * Manages the layout and coordination between stats tracking,
 * bonding operations, and active position management.
 */
const ForgeManager: React.FC = () => {
    return (
        <div className={styles.container}>
            <ForgeStatsHeader />
            <TheForgeWidget />
            <ActiveBondsManager />
        </div>
    );
};

export default ForgeManager;
