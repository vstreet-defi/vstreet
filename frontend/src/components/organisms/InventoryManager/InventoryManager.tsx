import React, { useState } from "react";
import styles from "./InventoryManager.module.scss";
import VaultActivePositions from "../VaultActivePositions/VaultActivePositions";
import { VaultCardProps } from "../../molecules/VaultCard/VaultCard";

const TABS = {
    ACTIVE: "In-Progress (Active)",
    AVAILABLE: "Ready for Ignition (Available)",
    HISTORY: "Mission Logs (History)",
};

/**
 * InventoryManager Component
 * Tabbed container to manage user staking positions.
 * Refactored to use modular Vault components.
 */
const InventoryManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState(TABS.ACTIVE);

    // Partial mock data for demonstration
    const activeLocksRaw = [
        { id: 1, amount: "1500.00", power: "10,500", multiplier: "x7", remaining: "4d 12h 30m" },
        { id: 2, amount: "5000.00", power: "450,000", multiplier: "x90", remaining: "88d 23h 59m" },
    ];

    const maturedLocksRaw = [
        { id: 3, amount: "200.00", power: "2,840", multiplier: "x14", date: "2025-12-30" },
    ];

    const historyRaw = [
        { id: 4, action: "Stake", amount: "1000.00", multiplier: "x1", date: "2025-11-15" },
        { id: 5, action: "Unlock", amount: "500.00", multiplier: "x7", date: "2025-12-01" },
    ];

    const getTabContent = (): { items: VaultCardProps[]; emptyMessage: string } => {
        switch (activeTab) {
            case TABS.ACTIVE:
                return {
                    items: activeLocksRaw.map((lock) => ({
                        type: "active",
                        amount: `${lock.amount} $VST`,
                        multiplier: lock.multiplier,
                        secondaryLabel: "User Power",
                        secondaryValue: `${lock.power} $sVST`,
                        tertiaryLabel: "Time to Ignition",
                        tertiaryValue: lock.remaining,
                    })),
                    emptyMessage: "No active positions found.",
                };
            case TABS.AVAILABLE:
                return {
                    items: maturedLocksRaw.map((lock) => ({
                        type: "matured",
                        amount: `${lock.amount} $VST`,
                        multiplier: lock.multiplier,
                        secondaryLabel: "Accrued Power",
                        secondaryValue: `${lock.power} $sVST`,
                        tertiaryLabel: "Status",
                        tertiaryValue: "READY",
                        onAction: () => console.log("Unlock clicked for", lock.id),
                        actionLabel: "Unlock & Claim",
                    })),
                    emptyMessage: "No positions ready for ignition.",
                };
            case TABS.HISTORY:
                return {
                    items: historyRaw.map((log) => ({
                        type: "history",
                        amount: log.action,
                        secondaryLabel: "Amount",
                        secondaryValue: `${log.amount} $VST (${log.multiplier})`,
                        tertiaryLabel: "Timestamp",
                        tertiaryValue: log.date,
                    })),
                    emptyMessage: "Accessing archives... Mission logs clear.",
                };
            default:
                return { items: [], emptyMessage: "" };
        }
    };

    const { items, emptyMessage } = getTabContent();

    return (
        <div className={styles.inventory}>
            <div className={styles.tabs}>
                {Object.values(TABS).map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            <VaultActivePositions items={items} emptyMessage={emptyMessage} />
        </div>
    );
};

export default InventoryManager;