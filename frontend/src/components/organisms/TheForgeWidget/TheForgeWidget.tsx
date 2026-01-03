import React, { useState, useEffect } from "react";
import styles from "./TheForgeWidget.module.scss";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";
import ForgeCard from "../../atoms/ForgeCard/ForgeCard";
import { useWallet } from "contexts/accountContext";
import { formatWithCommasVARA } from "utils";

/**
 * Maturity options defining the bonding duration and yield multipliers.
 */
const MATURITY_OPTIONS = [
    { id: "30D", term: "30D", discount: "5%", multiplier: 1.05, vibe: "Stable Forge" },
    { id: "60D", term: "60D", discount: "15%", multiplier: 1.15, vibe: "Deep Forge" },
    { id: "90D", term: "90D", discount: "30%", multiplier: 1.30, vibe: "SUPERNOVA FORGE" },
];

/**
 * TheForgeWidget
 * 
 * Provides the interactive interface for "forging" $VST tokens from $VARA.
 * Handles maturity selection, balance projections, and wallet synchronization.
 */
const TheForgeWidget: React.FC = () => {
    const { balance } = useWallet();
    const [amount, setAmount] = useState("");
    const [selectedMaturity, setSelectedMaturity] = useState(MATURITY_OPTIONS[2]);
    const [formattedBalance, setFormattedBalance] = useState("0");

    useEffect(() => {
        setFormattedBalance(formatWithCommasVARA(balance));
    }, [balance]);

    /**
     * Populates the input field with the maximum available native balance.
     */
    const handleMax = () => {
        const rawBalance = balance / 1_000_000_000_000;
        setAmount(rawBalance.toString());
    };

    /**
     * Projects the $VST output based on the input $VARA and selected maturity.
     */
    const calculateVST = (val: string, multiplier: number) => {
        const num = parseFloat(val) || 0;
        const dexRate = 0.004895;
        return (num * dexRate * multiplier).toFixed(4);
    };

    const dexOutput = calculateVST(amount, 1);
    const forgeOutput = calculateVST(amount, selectedMaturity.multiplier);

    return (
        <div className={styles.widget}>
            <CornerAccent position="top-left" color="#00ffc4" length={40} thickness={2} />
            <CornerAccent position="bottom-right" color="#4fff4b" length={40} thickness={2} />

            <div className={styles.header}>
                <h2 className={styles.title}>The Forge</h2>
                <p className={styles.subtitle}>Convert your $VARA into $VST at a discounted protocol rate.</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.controls}>
                    <div className={styles.inputArea}>
                        <div className={styles.availableBalance}>
                            Available: <span>{formattedBalance} VARA</span>
                        </div>
                        <label className={styles.label}>Supply $VARA</label>
                        <div className={styles.deepInput}>
                            <button className={styles.maxBtn} onClick={handleMax}>MAX</button>
                            <input
                                type="text"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className={styles.tokenLabel}>$VARA</span>
                        </div>
                        <div className={styles.warning}>
                            Forging involves a maturity period. Tokens release linearly over time.
                        </div>
                    </div>

                    <div className={styles.maturityArea}>
                        <label className={styles.label}>Select Maturity Period</label>
                        <div className={styles.cardGrid}>
                            {MATURITY_OPTIONS.map((opt) => (
                                <ForgeCard
                                    key={opt.id}
                                    term={opt.term}
                                    discount={opt.discount}
                                    vibe={opt.vibe}
                                    isActive={selectedMaturity.id === opt.id}
                                    onClick={() => setSelectedMaturity(opt)}
                                />
                            ))}
                        </div>
                    </div>

                    <button className={styles.forgeBtn}>COMMENCE FORGING</button>
                </div>

                <div className={styles.projectionArea}>
                    <div className={styles.projectionHeader}>
                        <span className={styles.label}>Power Projection Engine</span>
                        <div className={`${styles.powerBadge} ${selectedMaturity.id === "90D" ? styles.peakMode : ""}`}>
                            {selectedMaturity.discount} BONUS YIELD
                        </div>
                    </div>

                    <div className={styles.projectionBody}>
                        <div className={styles.yieldSplit}>
                            <div className={styles.yieldInfo}>
                                <span className={styles.yieldSub}>DEX Output</span>
                                <span className={styles.yieldValue}>{dexOutput} $VST</span>
                            </div>
                            <div className={`${styles.yieldInfo} ${styles.alignRight}`}>
                                <span className={styles.yieldSub}>Forge Output</span>
                                <span className={`${styles.yieldValue} ${styles.neonGreen}`}>{forgeOutput} $VST</span>
                            </div>
                        </div>

                        <div className={styles.unifiedBar}>
                            <div
                                className={styles.dexFill}
                                style={{ width: amount ? "70%" : "0%" }}
                            >
                                <div className={styles.toonGloss} />
                            </div>
                            <div
                                className={styles.forgeFill}
                                style={{ width: amount ? `${70 * selectedMaturity.multiplier}%` : "0%" }}
                            >
                                <div className={styles.glowPulse} />
                                <div className={styles.toonGloss} />
                            </div>
                        </div>

                        <div className={styles.projectionFooter}>
                            <div className={styles.bonusLabel}>
                                +{(parseFloat(forgeOutput) - parseFloat(dexOutput)).toFixed(4)} $VST FORGE BONUS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheForgeWidget;
