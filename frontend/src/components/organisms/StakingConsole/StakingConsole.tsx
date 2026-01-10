import React, { useState, useEffect } from "react";
import styles from "./StakingConsole.module.scss";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";
import { useUserInfo } from "contexts/userInfoContext";
import { useWallet } from "contexts/accountContext";
import { AlertModalContext } from "contexts/alertContext";
import { vstTokenProgramID, vstreetProgramID, idlVSTREET, idlVFT, fungibleTokenProgramID } from "../../../utils/smartPrograms";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";
import { useAccount } from "@gear-js/react-hooks";

const CONVICTION_OPTIONS = [
    { id: "x1", label: "1D", multiplier: 1, color: "#00ffc4", status: "Manual" },
    { id: "x7", label: "7D", multiplier: 1.5, color: "#00ffc4", status: "Ignition Started" },
    { id: "x14", label: "14D", multiplier: 2, color: "#00ffc4", status: "Stable Burn" },
    { id: "x28", label: "28D", multiplier: 3, color: "#00ffc4", status: "High Velocity" },
    { id: "x90", label: "90D", multiplier: 4, color: "#4fff4b", isMax: true, status: "MAX IGNITION" },
];

/**
 * StakingConsole Component
 * The central interaction point for the Vaults page.
 * Allows users to choose conviction levels and visualize potential gains.
 */
const StakingConsole: React.FC = () => {
    const { vstBalance, vstDecimals, fetchUserInfo } = useUserInfo();
    const { hexAddress, selectedAccount, accountData } = useWallet();
    const { accounts } = useAccount();
    const alertModalContext = React.useContext(AlertModalContext);

    const [selectedConviction, setSelectedConviction] = useState(CONVICTION_OPTIONS[0]);
    const [amount, setAmount] = useState("");

    useEffect(() => {
        if (selectedAccount && hexAddress) {
            fetchUserInfo(hexAddress);
        }
    }, [selectedAccount, hexAddress]);

    // Format balance using detected decimals
    const safeDecimals = vstDecimals || 18;
    const divisor = Math.pow(10, safeDecimals);
    const humanBalance = vstBalance / divisor;

    const formattedBalance = humanBalance >= 0.01
        ? humanBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : (humanBalance > 0 ? humanBalance.toFixed(6) : "0.00");

    const handleMax = () => {
        setAmount(humanBalance > 0 ? humanBalance.toString() : vstBalance.toString());
    };

    const handleManualRefresh = () => {
        if (hexAddress) fetchUserInfo(hexAddress);
    };

    const handleSelect = (option: typeof CONVICTION_OPTIONS[0]) => {
        setSelectedConviction(option);
    };

    const calculateSVsST = (val: string, multiplier: number) => {
        const num = parseFloat(val) || 0;
        return (num * multiplier).toFixed(2);
    };

    const handleStake = async () => {
        if (!accountData || !amount || parseFloat(amount) <= 0) {
            alertModalContext?.showErrorModal("Invalid amount or wallet not connected");
            return;
        }

        try {
            alertModalContext?.showInfoModal("Preparing transaction...");
            const gearApi = await GearApi.create({
                providerAddress: "wss://testnet.vara.network",
            });
            const parser = await SailsIdlParser.new();
            const { signer } = await web3FromSource(accountData.meta.source);

            // 1. Approval
            alertModalContext?.showInfoModal("Step 1/2: Approving $VST spend...");
            const sailsVFT = new Sails(parser);
            sailsVFT.parseIdl(idlVFT);
            sailsVFT.setProgramId(vstTokenProgramID);
            sailsVFT.setApi(gearApi);

            const amountRaw = BigInt(Math.floor(parseFloat(amount) * divisor));
            const approveMessage = await sailsVFT.services.Vft.functions.Approve(
                vstreetProgramID,
                amountRaw
            );
            approveMessage.withAccount(accountData.address, {
                signer: signer as string | CodecClass<Codec, any[]> as Signer,
            });
            await approveMessage.calculateGas(true, 15);
            const { isFinalized: isApproveFinalized } = await approveMessage.signAndSend();
            await isApproveFinalized;

            // 2. Stake
            alertModalContext?.showInfoModal("Step 2/2: Executing Ignition (Staking)...");
            const sailsVault = new Sails(parser);
            sailsVault.parseIdl(idlVSTREET);
            sailsVault.setProgramId(vstreetProgramID);
            sailsVault.setApi(gearApi);

            // Map ID to Enum Name
            const convictionMap: { [key: string]: string } = {
                "x1": "Day1",
                "x7": "Day7",
                "x14": "Day14",
                "x28": "Day28",
                "x90": "Day90",
            };

            const stakeMessage = await sailsVault.services.VaultService.functions.StakeVst(
                amountRaw,
                convictionMap[selectedConviction.id]
            );
            stakeMessage.withAccount(accountData.address, {
                signer: signer as string | CodecClass<Codec, any[]> as Signer,
            });
            await stakeMessage.calculateGas(true, 15);
            const { isFinalized: isStakeFinalized } = await stakeMessage.signAndSend();
            await isStakeFinalized;

            alertModalContext?.showSuccessModal();
            setTimeout(() => {
                alertModalContext?.hideAlertModal();
                fetchUserInfo(hexAddress);
                setAmount("");
            }, 3000);

        } catch (error) {
            console.error("Staking error:", error);
            alertModalContext?.showErrorModal(error instanceof Error ? error.message : "Transaction failed");
        }
    };

    return (
        <div className={styles.console}>
            <CornerAccent position="top-left" color="#00ffc4" length={40} thickness={2} />
            <CornerAccent position="bottom-right" color="#4fff4b" length={40} thickness={2} />

            <div className={styles.header}>
                <h2 className={styles.title}>Vaults Console</h2>
                <p className={styles.subtitle}>Lock your $VST to gain protocol power ($sVST)</p>
            </div>

            <div className={styles.grid}>
                <div>
                    <div className={styles.selectorContainer}>
                        <span className={styles.label}>Select Conviction Level</span>
                        <div className={styles.segmentedControl}>
                            {CONVICTION_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    className={`${styles.option} ${selectedConviction.id === option.id ? styles.active : ""
                                        } ${option.isMax ? styles.maxGlow : ""}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <div className={styles.statusText}>Current Mode: {selectedConviction.status}</div>
                    </div>

                    <div className={styles.inputArea}>
                        <div className={styles.vstInput}>
                            <button className={styles.maxBtn} onClick={handleMax}>MAX</button>
                            <input
                                type="text"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className={styles.tokenLabel}>$VST</span>
                        </div>
                        <div className={styles.availableBalance}>
                            Available: <span onClick={handleManualRefresh} style={{ cursor: 'pointer' }} title="Click to refresh balance">{formattedBalance} $VST</span>
                        </div>
                        <button className={styles.stakeBtn} onClick={handleStake}>Execute Ignition</button>
                    </div>
                </div>

                <div className={styles.engineContainer}>
                    <div className={styles.engineHeader}>
                        <span className={styles.label}>Power Projection Engine</span>
                        <div className={`${styles.powerBadge} ${selectedConviction.multiplier === 4 ? styles.peakMode : ""}`}>
                            {selectedConviction.multiplier < 4 ? (
                                `UNLOCKED +${((selectedConviction.multiplier - 1) * 100).toFixed(0)}% POWER`
                            ) : (
                                "PEAK POWER ACHIEVED (+300%)"
                            )}
                        </div>
                    </div>

                    <div className={styles.engineBody}>
                        <div className={styles.unifiedBar}>
                            {/* Active Fill */}
                            <div
                                className={styles.activeFill}
                                style={{
                                    width: `${selectedConviction.multiplier === 1 ? 25 : 25 + ((selectedConviction.multiplier - 1) / 3) * 75}%`,
                                    backgroundColor: selectedConviction.isMax ? '#4fff4b' : '#00ffc4'
                                }}
                            >
                                <div className={styles.toonGloss} />
                            </div>

                            {/* Ghost Bar (Missed Potential) */}
                            <div className={styles.ghostBar}>
                                <div className={styles.glowPulse} />
                                {selectedConviction.multiplier === 1 && (
                                    <span className={styles.ghostInfo}>IGNITE FOR 4X BOOST</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.engineFooter}>
                            <div className={styles.footerLabel}>
                                <span className={styles.footerSub}>Current Power</span>
                                <span className={styles.footerValue}>{calculateSVsST(amount, selectedConviction.multiplier)} $sVST</span>
                            </div>
                            <div className={`${styles.footerLabel} ${styles.alignRight}`}>
                                <span className={styles.footerSub}>Max Potential (x4)</span>
                                <span className={styles.footerValue} style={{ color: '#4fff4b' }}>{calculateSVsST(amount, 4)} $sVST</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StakingConsole;
