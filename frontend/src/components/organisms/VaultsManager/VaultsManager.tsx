import React, { useState, useEffect } from "react";
import GlobalStatsBar from "../../molecules/GlobalStatsBar/GlobalStatsBar";
import StakingConsole from "../StakingConsole/StakingConsole";
import InventoryManager from "../InventoryManager/InventoryManager";
import styles from "./VaultsManager.module.scss";
import { getVaultGlobalStats, getUserVaultInfo, GlobalVaultStats, UserVaultInfo } from "smart-contracts-tools";
import { useWallet } from "contexts/accountContext";
import { useUserInfo } from "contexts/userInfoContext";

/**
 * VaultsManager Component
 * Root component for the Vaults route.
 * Orchestrates the stats bar, staking console, and inventory manager.
 */
const VaultsManager: React.FC = () => {
    const { hexAddress } = useWallet();
    const { vstDecimals } = useUserInfo();
    const [globalStats, setGlobalStats] = useState<GlobalVaultStats | null>(null);
    const [userVaultInfo, setUserVaultInfo] = useState<UserVaultInfo | null>(null);

    const fetchData = async () => {
        getVaultGlobalStats(setGlobalStats);
        if (hexAddress) {
            getUserVaultInfo(hexAddress, setUserVaultInfo);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [hexAddress]);

    const safeDecimals = vstDecimals || 12; // Fallback to 12 if not loaded

    const formattedTvl = globalStats
        ? (globalStats.total_vst_locked / Math.pow(10, safeDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "...";

    const formattedPower = userVaultInfo
        ? (userVaultInfo.total_power / Math.pow(10, safeDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "0.00";

    return (
        <div className={styles.container}>
            {/* Top Section */}
            <GlobalStatsBar
                tvl={formattedTvl}
                userPower={formattedPower}
            />

            {/* Main Section */}
            <StakingConsole />

            {/* Bottom Section */}
            <InventoryManager />
        </div>
    );
};

export default VaultsManager;
