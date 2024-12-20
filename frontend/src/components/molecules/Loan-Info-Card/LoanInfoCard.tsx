import React, {
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { GearApi } from "@gear-js/api";

import InfoIcon from "assets/images/icons/info_Icon.png";
import {
  createWithdrawRewardsMessage,
  // getStakingInfo,
  // withdrawRewardsTransaction,
} from "smart-contracts-tools";
import { AlertModalContext } from "contexts/alertContext";
import { useLiquidity } from "contexts/stateContext";
import { useWallet } from "contexts/accountContext";
import { getUserInfo } from "smart-contracts-tools";
import { UserInfo } from "smart-contracts-tools";
import { formatWithCommasVARA, formatWithCommasVUSD } from "utils/index";

const formatDayliInterest = (number: number) => {
  const decimalsFactor = 1000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
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

const useStakingInfo = (api: GearApi | undefined, account: any) => {
  const [depositedBalance, setDepositedBalance] = useState<number | null>(null);
  const [rewardsUsdc, setRewardsUsdc] = useState<number>(0);
  const [fullState, setFullState] = useState<any | undefined>({});

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

  return { depositedBalance, rewardsUsdc, useOutsideClick };
};

// Components
interface TooltipProps {
  message: string;
  className: string;
}

const Tooltip: React.FC<TooltipProps> = ({ message, className }) => (
  <div className={className}>
    <p>{message}</p>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueStyle?: React.CSSProperties;
}

const InfoRow = React.forwardRef<HTMLDivElement, InfoRowProps>(
  ({ label, value, icon, valueStyle }, ref) => (
    <div className="Flex" ref={ref}>
      <div style={{ display: "flex" }}>
        <p>{label}</p>
        {icon}
      </div>
      <p style={valueStyle}>{value}</p>
    </div>
  )
);

InfoRow.displayName = "InfoRow";

// Main component
interface LoanInfoCardProps {}

const LoanInfoCard: React.FC<LoanInfoCardProps> = () => {
  const { api } = useApi();
  const { account, accounts } = useAccount();
  const alertModalContext = useContext(AlertModalContext);
  const liquidityData = useLiquidity();

  const [activeTooltip, setActiveTooltip] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { selectedAccount, hexAddress } = useWallet();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const { depositedBalance, rewardsUsdc, useOutsideClick } = useStakingInfo(
    api,
    account
  );

  useEffect(() => {
    if (selectedAccount) {
      //sails call getUserInfo
      getUserInfo(hexAddress, setUserInfo);
      console.log("hexAddress", hexAddress);
    }
  }, [selectedAccount, hexAddress]);

  useOutsideClick(wrapperRef, () => setActiveTooltip(""));

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

  //Logic for LTV styles an Status
  const greenTextStyle: React.CSSProperties = { color: "green" };
  const yellowTextStyle: React.CSSProperties = { color: "yellow" };
  const redTextStyle: React.CSSProperties = { color: "red" };
  const defaultTextStyle: React.CSSProperties = { color: "white" };

  const getLtvStyleAndStatus = (ltv: number) => {
    if (ltv === 0) {
      return { style: defaultTextStyle, status: "NO ACTIVE LOAN" };
    } else if (ltv <= 20 && ltv > 0) {
      return { style: greenTextStyle, status: "Low Risk" };
    } else if (ltv <= 40) {
      return { style: yellowTextStyle, status: "Medium Risk" };
    } else if (ltv <= 70) {
      return { style: redTextStyle, status: "High Risk" };
    } else {
      return { style: defaultTextStyle, status: "NO ACTIVE LOAN" };
    }
  };

  const ltv = userInfo?.ltv || 0;
  const { style: ltvStyle, status: ltvStatus } = getLtvStyleAndStatus(ltv);

  const tooltipMessages: Record<string, string> = {
    borrow:
      "Indicates the maximum amount that can be borrowed based on the collateral and the platform's LTV ratio",
    debt: "Displays the total borrowed amount, including accrued interest.",
    loanToValue:
      "Represents the ratio of the loan amount to the value of the collateral, expressed as a percentage",
  };

  return (
    <div>
      <div className="BasicCard">
        {activeTooltip !== "" && (
          <Tooltip
            message={tooltipMessages[activeTooltip]}
            className={`custom-tooltip-${activeTooltip}`}
          />
        )}
        <InfoRow
          label="Total Collateral Deposited"
          value={`$${formatWithCommasVARA(userInfo?.balance_vara ?? 0)} TVARA`}
        />
        <InfoRow
          label="Available To Borrow"
          value={`$${formatWithCommasVUSD(userInfo?.mla ?? 0)} vUSD`}
          icon={
            <img
              onClick={() =>
                setActiveTooltip((prev) => (prev === "borrow" ? "" : "borrow"))
              }
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
          label="Current Loan/Debt"
          value={`$${
            userInfo?.loan_amount_usdc ? userInfo?.loan_amount_usdc : 0
          } vUSD`}
          icon={
            <img
              onClick={() =>
                setActiveTooltip((prev) => (prev === "" ? "debt" : ""))
              }
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
          label="Loan To Value"
          value={`${ltv}%`}
          icon={
            <img
              onClick={() =>
                setActiveTooltip((prev) => (prev === "" ? "loanToValue" : ""))
              }
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
          valueStyle={ltvStyle}
        />
        <InfoRow label="Status" value={ltvStatus} valueStyle={ltvStyle} />
        <InfoRow
          label="Daily Loan Interest"
          value={`${formatDayliInterest(
            liquidityData?.liquidityData?.InterestRate ?? 0
          )}%`}
          valueStyle={greenTextStyle}
        />
        <div
          className={`ButtonFlex ${rewardsUsdc > 0 ? "" : "disabled"}`}
          // onClick={() => handleClick("Claim")}
        ></div>
      </div>
    </div>
  );
};

export default LoanInfoCard;
