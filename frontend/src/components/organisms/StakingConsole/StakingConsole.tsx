import React, { useState, useEffect, useContext } from "react";
import styles from "./StakingConsole.module.scss";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";
import { useUserInfo } from "contexts/userInfoContext";
import { useWallet } from "contexts/accountContext";
import { useVault } from "contexts/vaultContext";
import { AlertModalContext } from "contexts/alertContext";
import {
  vstTokenProgramID,
  vaultProgramID,
  idlVFT,
  idlVAULT,
} from "../../../utils/smartPrograms";
import { mapConvictionToEnum, ConvictionLevel } from "smart-contracts-tools";

import { useAccount } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { GearApi } from "@gear-js/api";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";

const CONVICTION_OPTIONS = [
  { id: "x1", label: "1D", multiplier: 1, color: "#00ffc4", status: "Manual" },
  {
    id: "x7",
    label: "7D",
    multiplier: 1.5,
    color: "#00ffc4",
    status: "Ignition Started",
  },
  {
    id: "x14",
    label: "14D",
    multiplier: 2,
    color: "#00ffc4",
    status: "Stable Burn",
  },
  {
    id: "x28",
    label: "28D",
    multiplier: 3,
    color: "#00ffc4",
    status: "High Velocity",
  },
  {
    id: "x90",
    label: "90D",
    multiplier: 4,
    color: "#4fff4b",
    isMax: true,
    status: "MAX IGNITION",
  },
];

/**
 * StakingConsole Component
 * The central interaction point for the Vaults page.
 * Allows users to choose conviction levels and visualize potential gains.
 */
const StakingConsole: React.FC = () => {
  const { vstBalance, vstDecimals, fetchUserInfo } = useUserInfo();
  const { hexAddress, selectedAccount, accountData } = useWallet();
  const { fetchVaultData, totalPower, totalStaked } = useVault();
  const alertModalContext = useContext(AlertModalContext);
  const { accounts } = useAccount();

  const [selectedConviction, setSelectedConviction] = useState(
    CONVICTION_OPTIONS[0]
  );
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedAccount && hexAddress) {
      console.log("Vaults: Triggering fetch for", hexAddress);
      fetchUserInfo(hexAddress);
      fetchVaultData(hexAddress);
    }
  }, [selectedAccount, hexAddress]);

  // Format balance using detected decimals
  const safeDecimals = vstDecimals || 18;
  const divisor = Math.pow(10, safeDecimals);
  const humanBalance = vstBalance / divisor;

  // If humanBalance is 0 but we have a raw balance, show the raw balance to debug decimals
  const formattedBalance =
    vstBalance > 0 && humanBalance < 0.000001
      ? `RAW: ${vstBalance}`
      : humanBalance >= 0.01
      ? humanBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : humanBalance > 0
      ? humanBalance.toFixed(6)
      : "0.00";

  const handleMax = () => {
    setAmount(
      humanBalance > 0 ? humanBalance.toString() : vstBalance.toString()
    );
  };

  const handleManualRefresh = () => {
    if (hexAddress) {
      fetchUserInfo(hexAddress);
      fetchVaultData(hexAddress);
    }
  };

  const handleSelect = (option: (typeof CONVICTION_OPTIONS)[0]) => {
    setSelectedConviction(option);
  };

  const calculateSVsST = (val: string, multiplier: number) => {
    const num = parseFloat(val) || 0;
    return (num * multiplier).toFixed(2);
  };

  // Execute Ignition (Stake VST)
  const handleExecuteIgnition = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alertModalContext?.showErrorModal("Please enter a valid amount");
      return;
    }

    if (!accountData || accounts.length === 0) {
      alertModalContext?.showErrorModal("Please connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      const parser = await SailsIdlParser.new();
      const gearApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });

      // Convert amount to raw value (with decimals)
      const rawAmount = BigInt(Math.floor(parseFloat(amount) * divisor));
      const convictionLevel = mapConvictionToEnum(selectedConviction.id);

      // Step 1: Approve VST token transfer to Vault contract
      alertModalContext?.showInfoModal("Approving VST tokens...");

      const sailsVFT = new Sails(parser);
      sailsVFT.parseIdl(idlVFT);
      sailsVFT.setProgramId(vstTokenProgramID);
      sailsVFT.setApi(gearApi);

      const { signer } = await web3FromSource(accountData.meta.source);

      const approveTransaction = sailsVFT.services.Vft.functions.Approve(
        vaultProgramID as `0x${string}`,
        rawAmount
      );
      approveTransaction.withAccount(accountData.address, {
        signer: signer as string | CodecClass<Codec, any[]> as Signer,
      });
      await approveTransaction.calculateGas(true, 15);

      const { isFinalized: approveFinalized } =
        await approveTransaction.signAndSend();
      await approveFinalized;

      // Step 2: Stake VST in Vault
      alertModalContext?.showInfoModal("Staking VST tokens...");

      const sailsVault = new Sails(parser);
      sailsVault.parseIdl(idlVAULT);
      sailsVault.setProgramId(vaultProgramID);
      sailsVault.setApi(gearApi);

      const stakeTransaction =
        sailsVault.services.VaultService.functions.StakeVst(
          rawAmount,
          convictionLevel
        );
      stakeTransaction.withAccount(accountData.address, {
        signer: signer as string | CodecClass<Codec, any[]> as Signer,
      });
      await stakeTransaction.calculateGas(true, 15);

      const { isFinalized: stakeFinalized } =
        await stakeTransaction.signAndSend();
      await stakeFinalized;

      alertModalContext?.showSuccessModal();
      setAmount("");

      // Refresh data after successful stake
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
        fetchUserInfo(hexAddress);
        fetchVaultData(hexAddress);
      }, 3000);
    } catch (error) {
      console.error("Staking error:", error);
      alertModalContext?.showErrorModal(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.console}>
      <CornerAccent
        position="top-left"
        color="#00ffc4"
        length={40}
        thickness={2}
      />
      <CornerAccent
        position="bottom-right"
        color="#4fff4b"
        length={40}
        thickness={2}
      />

      <div className={styles.header}>
        <h2 className={styles.title}>Vaults Console</h2>
        <p className={styles.subtitle}>
          Lock your $VST to gain protocol power ($sVST)
        </p>
      </div>

      <div className={styles.grid}>
        <div>
          <div className={styles.selectorContainer}>
            <span className={styles.label}>Select Conviction Level</span>
            <div className={styles.segmentedControl}>
              {CONVICTION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`${styles.option} ${
                    selectedConviction.id === option.id ? styles.active : ""
                  } ${option.isMax ? styles.maxGlow : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={styles.statusText}>
              Current Mode: {selectedConviction.status}
            </div>
          </div>

          <div className={styles.inputArea}>
            <div className={styles.vstInput}>
              <button className={styles.maxBtn} onClick={handleMax}>
                MAX
              </button>
              <input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={styles.tokenLabel}>$VST</span>
            </div>
            <div className={styles.availableBalance}>
              Available:{" "}
              <span
                onClick={handleManualRefresh}
                style={{ cursor: "pointer" }}
                title="Click to refresh balance"
              >
                {formattedBalance} $VST
              </span>
            </div>
            <button
              className={styles.stakeBtn}
              onClick={handleExecuteIgnition}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? "Processing..." : "Execute Ignition"}
            </button>
          </div>
        </div>

        <div className={styles.engineContainer}>
          <div className={styles.engineHeader}>
            <span className={styles.label}>Power Projection Engine</span>
            <div
              className={`${styles.powerBadge} ${
                selectedConviction.multiplier === 4 ? styles.peakMode : ""
              }`}
            >
              {selectedConviction.multiplier < 4
                ? `UNLOCKED +${(
                    (selectedConviction.multiplier - 1) *
                    100
                  ).toFixed(0)}% POWER`
                : "PEAK POWER ACHIEVED (+300%)"}
            </div>
          </div>

          <div className={styles.engineBody}>
            <div className={styles.unifiedBar}>
              {/* Active Fill */}
              <div
                className={styles.activeFill}
                style={{
                  width: `${
                    selectedConviction.multiplier === 1
                      ? 25
                      : 25 + ((selectedConviction.multiplier - 1) / 3) * 75
                  }%`,
                  backgroundColor: selectedConviction.isMax
                    ? "#4fff4b"
                    : "#00ffc4",
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
                <span className={styles.footerValue}>
                  {calculateSVsST(amount, selectedConviction.multiplier)} $sVST
                </span>
              </div>
              <div className={`${styles.footerLabel} ${styles.alignRight}`}>
                <span className={styles.footerSub}>Max Potential (x4)</span>
                <span
                  className={styles.footerValue}
                  style={{ color: "#4fff4b" }}
                >
                  {calculateSVsST(amount, 4)} $sVST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingConsole;
