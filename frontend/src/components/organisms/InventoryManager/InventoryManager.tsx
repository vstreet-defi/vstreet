import React, { useState, useEffect, useContext } from "react";
import styles from "./InventoryManager.module.scss";
import VaultActivePositions from "../VaultActivePositions/VaultActivePositions";
import { VaultCardProps } from "../../molecules/VaultCard/VaultCard";
import { useWallet } from "contexts/accountContext";
import { getUserActivePositions, VaultPosition } from "smart-contracts-tools";
import { vstreetProgramID, idlVSTREET } from "../../../utils/smartPrograms";
import { useUserInfo } from "contexts/userInfoContext";
import { AlertModalContext } from "contexts/alertContext";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";
import { useAccount } from "@gear-js/react-hooks";

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
    const { hexAddress, accountData } = useWallet();
    const { vstDecimals } = useUserInfo();
    const { accounts } = useAccount();
    const alertModalContext = useContext(AlertModalContext);

    const [activePositions, setActivePositions] = useState<VaultPosition[]>([]);
    const [maturedPositions, setMaturedPositions] = useState<VaultPosition[]>([]);
    const [history, setHistory] = useState<any[]>([]);


    const safeDecimals = vstDecimals || 12; // Fallback to 12 if not loaded

    // Helper function to format token amounts safely (handles BigInt precision loss)
    // Also includes sanity check for unreasonably large values (likely test/corrupted data)
    const MAX_REASONABLE_VALUE = 1_000_000_000; // 1 billion tokens max

    const formatTokenAmount = (value: number | bigint | string, decimals: number = safeDecimals): string => {
        try {
            const strValue = String(value);

            // Handle scientific notation (e.g., "1.229e26")
            if (strValue.includes('e') || strValue.includes('E')) {
                const numValue = Number(strValue);
                if (!isNaN(numValue) && isFinite(numValue)) {
                    const scaledValue = BigInt(Math.round(numValue));
                    const divisor = BigInt(10 ** decimals);
                    const result = Number(scaledValue / divisor);
                    // Sanity check
                    if (result > MAX_REASONABLE_VALUE) {
                        console.warn(`[formatTokenAmount] Value too large: ${result}, raw: ${strValue}`);
                        return "⚠️ Invalid";
                    }
                    return result.toLocaleString(undefined, { maximumFractionDigits: 2 });
                }
                return "0.00";
            }

            // Handle pure numeric strings (very long raw values like "5787367006361960448")
            if (strValue.length > 15 && !strValue.includes('.')) {
                try {
                    const bigIntValue = BigInt(strValue);
                    const divisor = BigInt(10 ** decimals);
                    const result = Number(bigIntValue / divisor);
                    // Sanity check
                    if (result > MAX_REASONABLE_VALUE) {
                        console.warn(`[formatTokenAmount] Value too large: ${result}, raw: ${strValue}`);
                        return "⚠️ Invalid";
                    }
                    return result.toLocaleString(undefined, { maximumFractionDigits: 2 });
                } catch {
                    return "0.00";
                }
            }

            // Standard numeric handling
            const numValue = Number(value);
            if (isNaN(numValue)) return "0.00";
            const result = numValue / Math.pow(10, decimals);
            if (result > MAX_REASONABLE_VALUE) {
                return "⚠️ Invalid";
            }
            return result.toLocaleString(undefined, { maximumFractionDigits: 2 });
        } catch {
            return "0.00";
        }
    };

    const fetchPositions = async () => {
        if (!hexAddress) return;
        try {
            await getUserActivePositions(hexAddress, (positions) => {
                // Categorize positions based on UserVaultInfo arrays (source of truth)
                const active = positions.filter((p: any) => p._category === 'active');
                const matured = positions.filter((p: any) => p._category === 'matured');
                const historyPositions = positions.filter((p: any) => p._category === 'history');

                setActivePositions(active);
                setMaturedPositions(matured);
                setHistory(historyPositions);
            });
        } catch (e) {
            console.error("Failed to fetch positions:", e);
        }
    };

    useEffect(() => {
        if (hexAddress) {
            fetchPositions();
        }
    }, [hexAddress]);

    const handleUnlock = async (positionId: string) => {
        if (!accountData) return;

        try {
            alertModalContext?.showInfoModal("Executing Unlock & Claim...");
            const gearApi = await GearApi.create({
                providerAddress: "wss://testnet.vara.network",
            });
            const parser = await SailsIdlParser.new();
            const { signer } = await web3FromSource(accountData.meta.source);

            const sailsVault = new Sails(parser);
            sailsVault.parseIdl(idlVSTREET);
            sailsVault.setProgramId(vstreetProgramID);
            sailsVault.setApi(gearApi);

            const transaction = await sailsVault.services.VaultService.functions.UnlockAndClaimPosition(
                BigInt(positionId)
            );
            transaction.withAccount(accountData.address, {
                signer: signer as string | CodecClass<Codec, any[]> as Signer,
            });
            await transaction.calculateGas(true, 15);
            const { isFinalized } = await transaction.signAndSend();
            await isFinalized;

            alertModalContext?.showSuccessModal();
            setTimeout(() => {
                alertModalContext?.hideAlertModal();
                fetchPositions();
            }, 3000);
        } catch (error) {
            console.error("Unlock error:", error);
            alertModalContext?.showErrorModal(error instanceof Error ? error.message : "Transaction failed");
        }
    };

    const formatTimestamp = (ts: number) => {
        if (!ts || ts === 0) return "N/A";
        // Blockchain timestamps may be in seconds or milliseconds
        // If ts is too small (before year 2000), it's likely in seconds
        const timestamp = ts < 946684800000 ? ts * 1000 : ts;
        const date = new Date(timestamp);

        // Sanity check: reject dates outside reasonable range (2000-2030)
        const year = date.getFullYear();
        if (isNaN(year) || year < 2000 || year > 2030) {
            console.warn(`[formatTimestamp] Invalid date - year ${year} from ts: ${ts}`);
            return "N/A";
        }
        return date.toLocaleDateString();
    };

    const getRemainingTime = (unlockTs: number, convictionLevel?: string) => {
        // Sanity check: if unlockTs is absurdly large (corrupted data), show fallback
        // Max reasonable unlock: 365 days from now
        const MAX_REASONABLE_DAYS = 365;
        const now = Date.now();

        // Normalize: if < year 2000 in seconds, convert to ms
        const timestamp = unlockTs < 946684800000 ? unlockTs * 1000 : unlockTs;
        const diff = timestamp - now;

        // If diff is negative, it's ready
        if (diff <= 0) return "READY";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        // If days > MAX_REASONABLE_DAYS, data is corrupted - show conviction-based estimate
        if (days > MAX_REASONABLE_DAYS) {
            const convictionDays: { [key: string]: number } = {
                "Day1": 1, "Day7": 7, "Day14": 14, "Day28": 28, "Day90": 90
            };
            const estimatedDays = convictionDays[convictionLevel || "Day1"] || 1;
            return `${estimatedDays}d`;
        }

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    };

    const getTabContent = (): { items: VaultCardProps[]; emptyMessage: string } => {
        switch (activeTab) {
            case TABS.ACTIVE:
                return {
                    items: activePositions.map((lock: VaultPosition) => ({
                        type: "active",
                        amount: `${formatTokenAmount(lock.amount)} $VST`,
                        multiplier: String(lock.conviction_level || "Day1").replace("Day", "x"),
                        secondaryLabel: "User Power",
                        secondaryValue: `${formatTokenAmount(lock.power)} $sVST`,
                        tertiaryLabel: "Time to Ignition",
                        tertiaryValue: getRemainingTime(lock.unlock_timestamp, String(lock.conviction_level)),
                    })),
                    emptyMessage: "No active positions found.",
                };
            case TABS.AVAILABLE:
                return {
                    items: maturedPositions.map((lock: VaultPosition) => ({
                        type: "matured",
                        amount: `${formatTokenAmount(lock.amount)} $VST`,
                        multiplier: String(lock.conviction_level || "Day1").replace("Day", "x"),
                        secondaryLabel: "Accrued Power",
                        secondaryValue: `${formatTokenAmount(lock.power)} $sVST`,
                        tertiaryLabel: "Status",
                        tertiaryValue: "READY",
                        onAction: () => handleUnlock(lock.id),
                        actionLabel: "Unlock & Claim",
                    })),
                    emptyMessage: "No positions ready for ignition.",
                };
            case TABS.HISTORY:
                return {
                    items: history.map((pos: VaultPosition) => ({
                        type: "history",
                        amount: `${formatTokenAmount(pos.amount)} $VST`,
                        multiplier: String(pos.conviction_level || "Day1").replace("Day", "x"),
                        secondaryLabel: "Power Earned",
                        secondaryValue: `${formatTokenAmount(pos.power)} $sVST`,
                        tertiaryLabel: "Status",
                        tertiaryValue: "✓ Completed",
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