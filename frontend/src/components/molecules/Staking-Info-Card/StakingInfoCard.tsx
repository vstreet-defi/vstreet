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

const formatWithCommas = (number: number) => {
  const decimalsFactor = 1000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
};

const formatApr = (apr: number): string => {
  return (apr / 1000000).toFixed(2);
};

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const { fetchUserInfo, userInfo, balance } = useUserInfo();

  useEffect(() => {
    const getUserData = async () => {
      if (selectedAccount) {
        fetchUserInfo(hexAddress);
        console.log(userInfo);
        console.log("REWARDS", userInfo?.rewards);
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
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });

    sails.setApi(gearApi);

    if (allAccounts.length === 0) {
      throw new Error("No account found");
    }

    const transaction =
      await sails.services.LiquidityInjectionService.functions.WithdrawRewards();
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
        console.error("Error executing message:", error);
      }
    };
  }, [accountData, allAccounts]);
  const handleTransaction = useCallback(
    async (
      transactions: { transaction: TransactionFunction; infoText: string }[]
    ) => {
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
    [alertModalContext, fetchUserInfo, hexAddress]
  );

  const handleWithdrawRewards = useCallback(async () => {
    const takeLoanTransaction = await createWithdrawRewardsTransaction();
    await handleTransaction([
      {
        transaction: takeLoanTransaction,
        infoText:
          "Loan taking in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  }, [createWithdrawRewardsTransaction, handleTransaction]);

  const handleClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleWithdrawRewards();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
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
      if (actionKey === "Claim") {
        await handleClaim();
      } else {
        throw new Error("Invalid action");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alertModalContext?.showErrorModal(errorMessage);
      if (alertModalContext?.hideAlertModal) {
        setTimeout(() => alertModalContext.hideAlertModal(), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="BasicCard">
        {showMessage && (
          <Tooltip message="We allow 1 Reward Withdraw per day." />
        )}
        <InfoRow
          label="Total Deposited"
          value={`$${formatWithCommas(userInfo?.balance ?? 0)} vUSD`}
        />
        <InfoRow
          label="Total Earned"
          value={`$${formatWithCommas(userInfo?.rewards ?? 0)} vUSD`}
          icon={
            <img
              onClick={() => setShowMessage((prev) => !prev)}
              style={{
                width: "1rem",
                height: "1rem",
                marginLeft: "0.5rem",
                cursor: "pointer",
              }}
              src={InfoIcon}
              alt="Info Icon"
            />
          }
          ref={wrapperRef}
        />
        <InfoRow
          label="APR"
          value={liquidityData ? `${formatApr(liquidityData.APR)}%` : "loading"}
        />
        <div className="ButtonFlex">
          <ButtonGradientBorder
            onClick={() => handleClick("Claim")}
            text="Claim"
            isDisabled={userInfo.rewards <= 1000000 || isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default StakingInfoCard;
