<<<<<<< HEAD
import React, { useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { GearApi } from '@gear-js/api';
import { ButtonGradientBorder } from 'components/atoms/Button-Gradient-Border/Button-Gradient-Border';
import InfoIcon from 'assets/images/icons/info_Icon.png';
import { useWallet } from 'contexts/accountContext';
import {
  createWithdrawRewardsMessage,
  // withdrawRewardsTransaction,
} from 'smart-contracts-tools/index';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { AlertModalContext } from 'contexts/alertContext';
import { useUserInfo } from 'contexts/userInfoContext';
import { useLiquidity } from 'contexts/stateContext';
import { idlVSTREET, vstreetProgramID } from 'utils/smartPrograms';
import { web3FromSource } from '@polkadot/extension-dapp';
import { Codec, CodecClass } from '@polkadot/types/types';
import { Signer } from '@polkadot/types/types';
=======
import React, {
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { GearApi } from "@gear-js/api";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import InfoIcon from "assets/images/icons/info_Icon.png";
import { useWallet } from "contexts/accountContext";
import {
  createWithdrawRewardsMessage,
  // withdrawRewardsTransaction,
} from "smart-contracts-tools";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { AlertModalContext } from "contexts/alertContext";
import { useUserInfo } from "contexts/userInfoContext";
import { useLiquidity } from "contexts/stateContext";
import { idlVSTREET, vstreetProgramID } from "utils/smartPrograms";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";
>>>>>>> VST-182-FE-MIGRATION-VITE

const formatWithCommas = (number: number) => {
  const decimalsFactor = 1000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
};

const formatApr = (apr: number): string => {
  return (apr / 1000000).toFixed(2);
};

<<<<<<< HEAD
const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
=======
const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void
) => {
>>>>>>> VST-182-FE-MIGRATION-VITE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

<<<<<<< HEAD
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
=======
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
>>>>>>> VST-182-FE-MIGRATION-VITE
    };
  }, [ref, callback]);
};

// Components
interface TooltipProps {
  message: string;
}

const Tooltip: React.FC<TooltipProps> = ({ message }) => (
  <div className="custom-tooltip">
    <p>{message}</p>
  </div>
);

type TransactionFunction = () => Promise<void>;

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

<<<<<<< HEAD
const InfoRow = React.forwardRef<HTMLDivElement, InfoRowProps>(({ label, value, icon }, ref) => (
  <div className="Flex" ref={ref}>
    <div style={{ display: 'flex' }}>
      <p>{label}</p>
      {icon}
    </div>
    <p>{value}</p>
  </div>
));

InfoRow.displayName = 'InfoRow';
=======
const InfoRow = React.forwardRef<HTMLDivElement, InfoRowProps>(
  ({ label, value, icon }, ref) => (
    <div className="Flex" ref={ref}>
      <div style={{ display: "flex" }}>
        <p>{label}</p>
        {icon}
      </div>
      <p>{value}</p>
    </div>
  )
);

InfoRow.displayName = "InfoRow";
>>>>>>> VST-182-FE-MIGRATION-VITE

// Main component
interface StakingInfoCardProps {}

const StakingInfoCard: React.FC<StakingInfoCardProps> = () => {
  const { api } = useApi();

  const alertModalContext = useContext(AlertModalContext);
  const { liquidityData } = useLiquidity();
  const { selectedAccount, hexAddress, allAccounts, accountData } = useWallet();

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);

  const { fetchUserInfo, userInfo, balance } = useUserInfo();

  useEffect(() => {
    const getUserData = async () => {
      if (selectedAccount) {
        fetchUserInfo(hexAddress);
        console.log(userInfo);
<<<<<<< HEAD
        console.log('REWARDS', userInfo?.rewards);
=======
        console.log("REWARDS", userInfo?.rewards);
>>>>>>> VST-182-FE-MIGRATION-VITE
      }
    };
    getUserData();
  }, [api, selectedAccount, hexAddress, userInfo.rewards]);

  // const { depositedBalance, rewardsUsdc } = useStakingInfo(api, account);
  useOutsideClick(wrapperRef, () => setShowMessage(false));

  const createWithdrawRewardsTransaction = useCallback(async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVSTREET);
    sails.setProgramId(vstreetProgramID);

    const accountWEB = accountData;
    if (!accountWEB) {
<<<<<<< HEAD
      throw new Error('No account data found');
    }

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
=======
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
>>>>>>> VST-182-FE-MIGRATION-VITE
    });

    sails.setApi(gearApi);

    if (allAccounts.length === 0) {
<<<<<<< HEAD
      throw new Error('No account found');
    }

    const transaction = await sails.services.LiquidityInjectionService.functions.WithdrawRewards();
=======
      throw new Error("No account found");
    }

    const transaction =
      await sails.services.LiquidityInjectionService.functions.WithdrawRewards();
>>>>>>> VST-182-FE-MIGRATION-VITE
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
<<<<<<< HEAD
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
=======
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();
>>>>>>> VST-182-FE-MIGRATION-VITE

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
<<<<<<< HEAD
        console.error('Error executing message:', error);
=======
        console.error("Error executing message:", error);
>>>>>>> VST-182-FE-MIGRATION-VITE
      }
    };
  }, [accountData, allAccounts]);
  const handleTransaction = useCallback(
<<<<<<< HEAD
    async (transactions: { transaction: TransactionFunction; infoText: string }[]) => {
=======
    async (
      transactions: { transaction: TransactionFunction; infoText: string }[]
    ) => {
>>>>>>> VST-182-FE-MIGRATION-VITE
      for (let i = 0; i < transactions.length; i++) {
        const { transaction, infoText } = transactions[i];

        alertModalContext?.showInfoModal(infoText);

        try {
          await transaction();
        } catch (error) {
          throw error;
        }
      }

      alertModalContext?.showSuccessModal();
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
        // Fetch user info again to refresh values
        fetchUserInfo(hexAddress);
      }, 3000);
    },
<<<<<<< HEAD
    [alertModalContext, fetchUserInfo, hexAddress],
=======
    [alertModalContext, fetchUserInfo, hexAddress]
>>>>>>> VST-182-FE-MIGRATION-VITE
  );

  const handleWithdrawRewards = useCallback(async () => {
    const takeLoanTransaction = await createWithdrawRewardsTransaction();
    await handleTransaction([
      {
        transaction: takeLoanTransaction,
<<<<<<< HEAD
        infoText: 'Rewards Claim in progress. Please check your wallet to sign the transaction.',
=======
        infoText:
          "Rewards Claim in progress. Please check your wallet to sign the transaction.",
>>>>>>> VST-182-FE-MIGRATION-VITE
      },
    ]);
  }, [createWithdrawRewardsTransaction, handleTransaction]);

  const handleClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleWithdrawRewards();
    } catch (error) {
<<<<<<< HEAD
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
=======
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
>>>>>>> VST-182-FE-MIGRATION-VITE
      alertModalContext?.showErrorModal(errorMessage);
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  }, [handleWithdrawRewards, alertModalContext]);

  const handleClick = async (actionKey: string) => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      if (actionKey === 'Claim') {
        await handleClaim();
      } else {
        throw new Error('Invalid action');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
=======
      if (actionKey === "Claim") {
        await handleClaim();
      } else {
        throw new Error("Invalid action");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
>>>>>>> VST-182-FE-MIGRATION-VITE
      alertModalContext?.showErrorModal(errorMessage);
      if (alertModalContext?.hideAlertModal) {
        setTimeout(() => alertModalContext.hideAlertModal(), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      const formatedBalance = userInfo.balance ? userInfo.balance / 1000000 : 0;
      setDepositedBalance(formatedBalance);
    }
  }, [userInfo]);

  return (
    <div>
      <div className="BasicCard">
        {showMessage && <Tooltip message="Minimum claim: $1 USD." />}
<<<<<<< HEAD
        <InfoRow label="Total Deposited" value={`$${formatWithCommas(depositedBalance)} vUSD`} />
=======
        <InfoRow
          label="Total Deposited"
          value={`$${formatWithCommas(depositedBalance)} vUSD`}
        />
>>>>>>> VST-182-FE-MIGRATION-VITE
        <InfoRow
          label="Total Earned"
          value={`$${formatWithCommas(userInfo?.rewards ?? 0)} vUSD`}
          icon={
            <img
              onClick={() => setShowMessage((prev) => !prev)}
              style={{
<<<<<<< HEAD
                width: '1rem',
                height: '1rem',
                marginLeft: '0.5rem',
                cursor: 'pointer',
=======
                width: "1rem",
                height: "1rem",
                marginLeft: "0.5rem",
                cursor: "pointer",
>>>>>>> VST-182-FE-MIGRATION-VITE
              }}
              src={InfoIcon}
              alt="Info Icon"
            />
          }
          ref={wrapperRef}
        />
<<<<<<< HEAD
        <InfoRow label="APR" value={liquidityData ? `${formatApr(liquidityData.APR)}%` : 'loading'} />
        <div className="ButtonFlex">
          <ButtonGradientBorder
            onClick={() => handleClick('Claim')}
=======
        <InfoRow
          label="APR"
          value={liquidityData ? `${formatApr(liquidityData.APR)}%` : "loading"}
        />
        <div className="ButtonFlex">
          <ButtonGradientBorder
            onClick={() => handleClick("Claim")}
>>>>>>> VST-182-FE-MIGRATION-VITE
            text="Claim"
            isDisabled={userInfo.rewards <= 1000000 || isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default StakingInfoCard;
