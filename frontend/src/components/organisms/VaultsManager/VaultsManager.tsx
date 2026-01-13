import React from "react";
import GlobalStatsBar from "../../molecules/GlobalStatsBar/GlobalStatsBar";
import StakingConsole from "../StakingConsole/StakingConsole";
import InventoryManager from "../InventoryManager/InventoryManager";
import styles from "./VaultsManager.module.scss";

/**
 * VaultsManager Component
 * Root component for the Vaults route.
 * Orchestrates the stats bar, staking console, and inventory manager.
 */
const VaultsManager: React.FC = () => {
    return (
        <div className={styles.container}>
            {/* Top Section */}
            <GlobalStatsBar />

            {/* Main Section */}
            <StakingConsole />

            {/* Bottom Section */}
            <InventoryManager />
        </div>
    );
};

export default VaultsManager;
