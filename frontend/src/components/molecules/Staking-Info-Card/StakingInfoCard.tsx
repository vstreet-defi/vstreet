import React, { useContext, useEffect, useRef, useState } from "react";
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

interface TooltipProps {
  message: string;
}

interface StakingInfoCardProps {}

type TransactionFunction = (
  api: GearApi,
  message: any,
  account: any,
  accounts: any[],
  setLoading?: ((loading: boolean) => void) | undefined
) => Promise<void>;

const Tooltip: React.FC<TooltipProps> = ({ message }) => {
  return (
    <div className="custom-tooltip">
      <p>{message}</p>
    </div>
  );
};

const StakingInfoCard: React.FC<StakingInfoCardProps> = () => {
  const { api } = useApi();
  const { account, accounts } = useAccount();
  const alertModalContext = useContext(AlertModalContext);

  const [depositedBalance, setDepositedBalance] = useState<number | null>(null);
  const [rewardsUsdc, setRewardsUsdc] = useState<number>(0);
  const [apr, setApr] = useState<number>(0);
  const [totalLiquidityPool, setTotalLiquidityPool] = useState<number>(0);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fullState, setFullState] = useState<any | undefined>({});

  const wrapperRef = useRef<HTMLDivElement>(null);

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
        setTimeout(() => {
          alertModalContext?.hideAlertModal();
        }, 5000);
        throw error;
      }
    }

    alertModalContext?.showSuccessModal();
    setTimeout(() => {
      alertModalContext?.hideAlertModal();
    }, 2000);
  };

  const handleClaim = async () => {
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
  };

  const actions: { [key: string]: () => Promise<void> } = {
    Claim: handleClaim,
  };

  const handleClick = async (actionKey: string) => {
    setIsLoading(true);

    const action = actions[actionKey];
    if (action) {
      try {
        await action();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        alertModalContext?.showErrorModal(errorMessage);
        setTimeout(() => {
          alertModalContext?.hideAlertModal();
        }, 5000);
      }
    } else {
      alertModalContext?.showErrorModal("Invalid action");
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 5000);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowMessage(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (account) {
      getStakingInfo(
        api,
        account.decodedAddress,
        setDepositedBalance,
        setFullState,
        setRewardsUsdc
      );
    }
  }, [api, account, depositedBalance]);

  useEffect(() => {
    getAPR(api, setApr, setFullState);
  }, [api, fullState]);

  const formatWithCommas = (number: number) => {
    return number.toLocaleString();
  };

  return (
    <div>
      <div className="BasicCard">
        {showMessage && (
          <Tooltip message="We allow 1 Reward Withdraw per day." />
        )}
        <div className="Flex">
          <p>Total Deposited</p>{" "}
          <p>${formatWithCommas(depositedBalance ?? 0)} vUSD</p>
        </div>

        <div className="Flex">
          <div
            ref={wrapperRef}
            style={{
              display: "flex",
            }}
          >
            <p>Total Earned</p>
            <img
              onClick={() => setShowMessage((prev) => !prev)}
              style={{ width: "1rem", height: "1rem", marginLeft: "0.5rem" }}
              src={InfoIcon}
              alt="Info Icon"
            />
          </div>{" "}
          <p>${formatWithCommas(rewardsUsdc ?? 0)} vUSD</p>
        </div>
        <div className="Flex">
          <p>APR</p>
          <p>{apr}%</p>
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
