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
import { AlertModalContext } from "contexts/alertContext";
import { getUserInfo } from "smart-contracts-tools";
import { UserInfo } from "smart-contracts-tools";
import { useLiquidity } from "contexts/stateContext";

const formatWithCommas = (number: number) => {
  const decimalsFactor = 1000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
};

const formatApr = (apr: number): string => {
  return (apr / 1000000).toFixed(2);
};

type TransactionFunction = (
  api: GearApi,
  message: any,
  account: any,
  accounts: any[],
  setLoading?: (loading: boolean) => void
) => Promise<void>;

const handleTransaction = async (
  messages: { message: any; infoText: string }[],
  transactions: TransactionFunction[],
  api: GearApi,
  account: any,
  accounts: any[],
  alertModalContext: any,
  setIsLoading: (loading: boolean) => void
) => {
  for (let i = 0; i < messages.length; i++) {
    const { message, infoText } = messages[i];
    const transaction = transactions[i];

    alertModalContext?.showInfoModal(infoText);

    try {
      await transaction(
        api,
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
  const { account, accounts } = useAccount();
  const alertModalContext = useContext(AlertModalContext);
  const { liquidityData } = useLiquidity();

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const { selectedAccount, hexAddress } = useWallet();

  useEffect(() => {
    const getUserData = async () => {
      if (selectedAccount) {
        console.log("hexAddress", hexAddress);
        getUserInfo(hexAddress, setUserInfo);
      }
    };
    getUserData();
  }, [api, account, selectedAccount, hexAddress]);

  // const { depositedBalance, rewardsUsdc } = useStakingInfo(api, account);
  useOutsideClick(wrapperRef, () => setShowMessage(false));

  // const handleClaim = useCallback(async () => {
  //   const withdrawRewardsMessage = createWithdrawRewardsMessage();
  //   await handleTransaction(
  //     [
  //       {
  //         message: withdrawRewardsMessage,
  //         infoText:
  //           "Claim rewards in progress. Please check your wallet to sign the transaction.",
  //       },
  //     ],
  //     [withdrawRewardsTransaction],
  //     api as GearApi,
  //     account,
  //     accounts,
  //     alertModalContext,
  //     setIsLoading
  //   );
  // }, [api, account, accounts, alertModalContext]);

  // const handleClick = async (actionKey: string) => {
  //   setIsLoading(true);
  //   try {
  //     if (actionKey === "Claim") {
  //       await handleClaim();
  //     } else {
  //       throw new Error("Invalid action");
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "An unknown error occurred.";
  //     alertModalContext?.showErrorModal(errorMessage);
  //     if (alertModalContext?.hideAlertModal) {
  //       setTimeout(() => alertModalContext.hideAlertModal(), 3000);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
          value={liquidityData ? formatApr(liquidityData.APR) : "loading"}
        />
        <div
          className={`ButtonFlex ${"disabled"}`}
          // onClick={() => handleClick("Claim")}
        >
          <ButtonGradientBorder
            text="Claim"
            // isDisabled={rewardsUsdc <= 0 || isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default StakingInfoCard;
