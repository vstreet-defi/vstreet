import React, { useState, useEffect } from "react";
import styles from "./ActiveBondsManager.module.scss";

/**
 * Tab types for Bond management navigation.
 */
const TABS = {
    FORGING: "Active Forges",
    ARCHIVE: "Forge History",
};

/**
 * ActiveBondsManager
 * 
 * Manages the displays of active bonding positions and historical records.
 * Provides real-time vesting progress updates and yield extraction capabilities.
 */
const ActiveBondsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState(TABS.FORGING);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeBonds = [
        {
            id: 1,
            principal: "5000 VARA",
            totalVst: "25.0",
            startTime: Date.now() - 3600_000 * 24 * 5,
            duration: 3600_000 * 24 * 30,
            claimed: "0.5"
        },
        {
            id: 2,
            principal: "12000 VARA",
            totalVst: "65.0",
            startTime: Date.now() - 3600_000 * 24,
            duration: 3600_000 * 24 * 90,
            claimed: "0.1"
        },
    ];

    const archiveBonds = [
        { id: 3, principal: "1000 VARA", totalVst: "5.1", yieldGained: "0.25 VST", date: "2025-12-15" },
        { id: 4, principal: "2500 VARA", totalVst: "13.2", yieldGained: "1.2 VST", date: "2025-11-20" },
    ];

    /**
     * Computes the linear vesting progress and currently claimable rewards.
     */
    const calculateVesting = (bond: typeof activeBonds[0]) => {
        const elapsed = currentTime - bond.startTime;
        const progress = Math.min(elapsed / bond.duration, 1);
        const totalVstNum = parseFloat(bond.totalVst);
        const currentClaimable = (totalVstNum * progress).toFixed(6);
        return { progress: progress * 100, currentClaimable };
    };

    return (
        <div className={styles.container}>
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

            <div className={styles.content}>
                {activeTab === TABS.FORGING ? (
                    <div className={styles.bondList}>
                        {activeBonds.map((bond) => {
                            const { progress, currentClaimable } = calculateVesting(bond);
                            return (
                                <div key={bond.id} className={styles.bondCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.infoGroup}>
                                            <span className={styles.label}>Principal</span>
                                            <span className={styles.value}>{bond.principal}</span>
                                        </div>
                                        <div className={`${styles.infoGroup} ${styles.alignRight}`}>
                                            <span className={styles.label}>Claimable</span>
                                            <span className={`${styles.value} ${styles.neonGreen}`}>{currentClaimable} VST</span>
                                        </div>
                                    </div>

                                    <div className={styles.vestingArea}>
                                        <div className={styles.vestingLabels}>
                                            <span className={styles.vestingSub}>Vesting Progress</span>
                                            <span className={styles.vestingSub}>{progress.toFixed(2)}%</span>
                                        </div>
                                        <div className={styles.vestingBar}>
                                            <div className={styles.moltenFill} style={{ width: "100%" }} />
                                            <div className={styles.cooledFill} style={{ width: `${progress}%` }} />
                                            <div className={styles.toonGloss} />
                                        </div>
                                        <div className={styles.barLegends}>
                                            <span className={styles.legend}><span className={styles.dotCooled} /> Cooled (Ready)</span>
                                            <span className={styles.legend}><span className={styles.dotMolten} /> Molten (Locked)</span>
                                        </div>
                                    </div>

                                    <button className={styles.claimBtn}>EXTRACT YIELD</button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.bondList}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Completed Bonds</th>
                                    <th>Total Yield Gained</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archiveBonds.map(bond => (
                                    <tr key={bond.id}>
                                        <td>{bond.principal} ({bond.totalVst} VST)</td>
                                        <td className={styles.neonGreen}>{bond.yieldGained}</td>
                                        <td>{bond.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveBondsManager;
