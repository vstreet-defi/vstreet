import React, { useState, useEffect, useContext } from "react";
import styles from "./InventoryManager.module.scss";
import VaultActivePositions from "../VaultActivePositions/VaultActivePositions";
import { VaultCardProps } from "../../molecules/VaultCard/VaultCard";
import { useVault } from "contexts/vaultContext";
import { useWallet } from "contexts/accountContext";
import { AlertModalContext } from "contexts/alertContext";
import { VaultPosition, ConvictionLevel } from "smart-contracts-tools";

import { useAccount } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";
import { vaultProgramID, idlVAULT } from "../../../utils/smartPrograms";

const TABS = {
  ACTIVE: "In-Progress (Active)",
  AVAILABLE: "Ready for Ignition (Available)",
  HISTORY: "Mission Logs (History)",
};

// Helper to format bigint amounts with decimals
const formatAmount = (
  amount: bigint | number | string,
  decimals: number = 18
): string => {
  try {
    // Convert to BigInt if not already
    const amountBigInt =
      typeof amount === "bigint" ? amount : BigInt(amount.toString());

    // Create divisor as BigInt (can't use ** with BigInt directly for large numbers)
    let divisor = BigInt(1);
    for (let i = 0; i < decimals; i++) {
      divisor = divisor * BigInt(10);
    }

    const intPart = amountBigInt / divisor;
    const fracPart = amountBigInt % divisor;
    const fracStr = fracPart.toString().padStart(decimals, "0").slice(0, 2);
    return `${Number(intPart).toLocaleString()}.${fracStr}`;
  } catch (e) {
    console.error("formatAmount error:", e, amount);
    return "0.00";
  }
};

// Helper to format remaining time from timestamp
const formatTimeRemaining = (
  unlockTimestamp: bigint | number | string
): string => {
  try {
    const unlockBigInt =
      typeof unlockTimestamp === "bigint"
        ? unlockTimestamp
        : BigInt(unlockTimestamp.toString());
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (unlockBigInt <= now) return "Ready";

    const remaining = Number(unlockBigInt - now);
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  } catch (e) {
    console.error("formatTimeRemaining error:", e);
    return "Unknown";
  }
};

// Helper to map conviction level to multiplier string
const getMultiplierString = (
  convictionLevel: ConvictionLevel | string
): string => {
  const mapping: Record<string, string> = {
    Day1: "x1",
    Day7: "x7",
    Day14: "x14",
    Day28: "x28",
    Day90: "x90",
  };
  return mapping[convictionLevel as string] || "x1";
};

// Helper to format date from timestamp
const formatDate = (timestamp: bigint | number | string): string => {
  try {
    const ts =
      typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);
    const date = new Date(ts * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "Unknown";
  }
};

/**
 * InventoryManager Component
 * Tabbed container to manage user staking positions.
 * Now connected to real contract data via VaultContext.
 */
const InventoryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS.ACTIVE);
  const [isLoading, setIsLoading] = useState(false);

  const {
    activePositions,
    maturedPositions,
    allPositions,
    fetchVaultData,
    isLoading: vaultLoading,
  } = useVault();
  const { hexAddress, accountData } = useWallet();
  const alertModalContext = useContext(AlertModalContext);
  const { accounts } = useAccount();

  // Unlock and claim a single position
  const handleUnlockPosition = async (positionId: bigint) => {
    if (!accountData || accounts.length === 0) {
      alertModalContext?.showErrorModal("Please connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      alertModalContext?.showInfoModal("Unlocking position...");

      const parser = await SailsIdlParser.new();
      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });

      const sailsVault = new Sails(parser);
      sailsVault.parseIdl(idlVAULT);
      sailsVault.setProgramId(vaultProgramID);
      sailsVault.setApi(gearApi);

      const { signer } = await web3FromSource(accountData.meta.source);

      const transaction =
        sailsVault.services.VaultService.functions.UnlockAndClaimPosition(
          positionId
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
        fetchVaultData(hexAddress);
      }, 3000);
    } catch (error) {
      console.error("Unlock error:", error);
      alertModalContext?.showErrorModal(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Claim all matured positions
  const handleClaimAll = async () => {
    if (
      !accountData ||
      accounts.length === 0 ||
      maturedPositions.length === 0
    ) {
      alertModalContext?.showErrorModal(
        "No positions to claim or wallet not connected"
      );
      return;
    }

    setIsLoading(true);

    try {
      alertModalContext?.showInfoModal("Claiming all matured positions...");

      const parser = await SailsIdlParser.new();
      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });

      const sailsVault = new Sails(parser);
      sailsVault.parseIdl(idlVAULT);
      sailsVault.setProgramId(vaultProgramID);
      sailsVault.setApi(gearApi);

      const { signer } = await web3FromSource(accountData.meta.source);

      const positionIds = maturedPositions.map((p) => p.id);
      const transaction =
        sailsVault.services.VaultService.functions.ClaimMultiplePositions(
          positionIds
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
        fetchVaultData(hexAddress);
      }, 3000);
    } catch (error) {
      console.error("Claim all error:", error);
      alertModalContext?.showErrorModal(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTabContent = (): {
    items: VaultCardProps[];
    emptyMessage: string;
  } => {
    switch (activeTab) {
      case TABS.ACTIVE:
        return {
          items: activePositions.map((position: VaultPosition) => ({
            type: "active" as const,
            amount: `${formatAmount(position.amount)} $VST`,
            multiplier: getMultiplierString(position.conviction_level),
            secondaryLabel: "User Power",
            secondaryValue: `${formatAmount(position.power)} $sVST`,
            tertiaryLabel: "Time to Ignition",
            tertiaryValue: formatTimeRemaining(position.unlock_timestamp),
          })),
          emptyMessage: vaultLoading
            ? "Loading positions..."
            : "No active positions found.",
        };
      case TABS.AVAILABLE:
        return {
          items: maturedPositions.map((position: VaultPosition) => ({
            type: "matured" as const,
            amount: `${formatAmount(position.amount)} $VST`,
            multiplier: getMultiplierString(position.conviction_level),
            secondaryLabel: "Accrued Power",
            secondaryValue: `${formatAmount(position.power)} $sVST`,
            tertiaryLabel: "Status",
            tertiaryValue: "READY",
            onAction: () => handleUnlockPosition(position.id),
            actionLabel: isLoading ? "Processing..." : "Unlock & Claim",
          })),
          emptyMessage: vaultLoading
            ? "Loading positions..."
            : "No positions ready for ignition.",
        };
      case TABS.HISTORY:
        return {
          items: allPositions
            .filter(
              (position: VaultPosition) =>
                position.claimed || !position.is_active
            )
            .map((position: VaultPosition) => ({
              type: "history" as const,
              amount: position.claimed ? "Claimed" : "Staked",
              secondaryLabel: "Amount",
              secondaryValue: `${formatAmount(
                position.amount
              )} $VST (${getMultiplierString(position.conviction_level)})`,
              tertiaryLabel: "Date",
              tertiaryValue: formatDate(position.start_timestamp),
            })),
          emptyMessage: vaultLoading
            ? "Loading history..."
            : "Accessing archives... Mission logs clear.",
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
            className={`${styles.tab} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === TABS.AVAILABLE && maturedPositions.length > 0 && (
              <span className={styles.badge}>{maturedPositions.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === TABS.AVAILABLE && maturedPositions.length > 1 && (
        <div className={styles.claimAllContainer}>
          <button
            className={styles.claimAllBtn}
            onClick={handleClaimAll}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : `Claim All (${maturedPositions.length})`}
          </button>
        </div>
      )}

      <VaultActivePositions items={items} emptyMessage={emptyMessage} />
    </div>
  );
};

export default InventoryManager;
