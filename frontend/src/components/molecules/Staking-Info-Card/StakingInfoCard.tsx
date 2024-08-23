import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { GearApi } from "@gear-js/api";
import InfoIcon from "assets/images/icons/info_Icon.png";
import {
  createWithdrawRewardsMessage,
  getAPR,
  getStakingInfo,
  withdrawRewardsTransaction,
} from "smart-contracts-tools";
import { AlertModalContext } from "contexts/alertContext";
import { formatNumber } from "utils";

interface TooltipProps {
  message: string;
}

interface StakingInfoCardProps {}

type TransactionFunction = (
  api: GearApi,
  message: any,
  account: any,
  accounts: any[],
  setLoading?: (loading: boolean) => void
) => Promise<void>;

const Tooltip: React.FC<TooltipProps> = ({ message }) => (
  <div className="custom-tooltip">
    <p>{message}</p>
  </div>
);

const useStakingInfo = (api: GearApi | undefined, account: any) => {
  const [depositedBalance, setDepositedBalance] = useState<number | null>(null);
  const [rewardsUsdc, setRewardsUsdc] = useState<number>(0);
  const [apr, setApr] = useState<number>(0);
  const [fullState, setFullState] = useState<any | undefined>({});

  useEffect(() => {
    if (api && account) {
      getStakingInfo(
        api,
        account.decodedAddress,
        setDepositedBalance,
        setFullState,
        setRewardsUsdc
      );
    }
  }, [api, account]);

  useEffect(() => {
    if (api) {
      getAPR(api, setApr, setFullState);
    }
  }, [api, fullState]);

  return { depositedBalance, rewardsUsdc, apr };
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

const StakingInfoCard: React.FC<StakingInfoCardProps> = () => {
  const { api } = useApi();
  const { account, accounts } = useAccount();
  const alertModalContext = useContext(AlertModalContext);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { depositedBalance, rewardsUsdc, apr } = useStakingInfo(api, account);

  useOutsideClick(wrapperRef, () => setShowMessage(false));

  const handleTransaction = async (
    messages: { message: any; infoText: string }[],
    transactions: TransactionFunction[]
  ) => {
    for (let i = 0; i < messages.length; i++) {
      const { message, infoText } = messages[i];
      const transaction = transactions[i];

      alertModalContext?.showInfoModal(infoText);

      try {
        await transaction(
          api as GearApi,
          message,
          account,
          accounts,
          i === messages.length - 1 ? setIsLoading : undefined
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        alertModalContext?.showErrorModal(errorMessage);
        if (alertModalContext?.hideAlertModal) {
          setTimeout(() => alertModalContext.hideAlertModal(), 3000);
        }

        throw error;
      }
    }

    alertModalContext?.showSuccessModal();
    if (alertModalContext?.hideAlertModal) {
      setTimeout(() => alertModalContext.hideAlertModal(), 2000);
    }
  };

  const handleClaim = useCallback(async () => {
    const withdrawRewardsMessage = createWithdrawRewardsMessage();
    await handleTransaction(
      [
        {
          message: withdrawRewardsMessage,
          infoText:
            "Claim rewards in progress. Please check your wallet to sign the transaction.",
        },
      ],
      [withdrawRewardsTransaction]
    );
  }, [api, account, accounts]);

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

  const formatWithCommas = (number: number) => number.toLocaleString();

  return (
    <div>
      <div className="BasicCard">
        {showMessage && (
          <Tooltip message="We allow 1 Reward Withdraw per day." />
        )}
        <div className="Flex">
          <p>Total Deposited</p>
          <p>${formatWithCommas(depositedBalance ?? 0)} vUSD</p>
        </div>
        <div className="Flex">
          <div ref={wrapperRef} style={{ display: "flex" }}>
            <p>Total Earned</p>
            <img
              onClick={() => setShowMessage((prev) => !prev)}
              style={{ width: "1rem", height: "1rem", marginLeft: "0.5rem" }}
              src={InfoIcon}
              alt="Info Icon"
            />
          </div>
          <p>${formatWithCommas(rewardsUsdc ?? 0)} vUSD</p>
        </div>
        <div className="Flex">
          <p>APR</p>
          <p>{formatNumber(apr)}%</p>
        </div>
        <div
          className={`ButtonFlex ${rewardsUsdc > 0 ? "" : "disabled"}`}
          onClick={() => handleClick("Claim")}
        >
          <ButtonGradientBorder
            text="Claim"
            isDisabled={rewardsUsdc <= 0 || isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default StakingInfoCard;
