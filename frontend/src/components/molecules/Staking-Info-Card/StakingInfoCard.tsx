import { useContext, useRef } from "react";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { useState, useEffect } from "react";
import { getStakingInfo } from "smart-contracts-tools";
import { AlertModalContext } from "contexts/alertContext";
import InfoIcon from "assets/images/icons/info_Icon.png";
import {
  createWithdrawRewardsMessage,
  withdrawRewardsTransaction,
} from "smart-contracts-tools";

export interface FullStateVST {
  apr: number;
  users: { [key: string]: any };
}

function StakingInfoCard() {
  const [fullState, setFullState] = useState<any | undefined>({});

  const { api } = useApi();
  const { account, accounts } = useAccount();
  const alert = useAlert();

  const [isLoading, setIsLoading] = useState(false);

  const [depositedBalance, setDepositedBalance] = useState<number | null>(null);
  const [rewardsUsdc, setRewardsUsdc] = useState<number>(0);
  const [apr, setApr] = useState<number | null>(null);
  const [displayApr, setDisplayApr] = useState<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const alertModalContext = useContext(AlertModalContext);

  console.log(account?.decodedAddress);

  const handleClick = () => {
    setShowMessage((prevState) => !prevState);
  };

  const calculateDisplayApr = (apr: number | null) => {
    if (apr !== null) {
      return apr / 10000;
    }
    return null;
  };

  const formatWithCommas = (number: number) => {
    return number.toLocaleString();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setShowMessage(false);
    }
  };

  useEffect(() => {
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
        setRewardsUsdc,
        setApr,
        setFullState,
        alert
      );
    }
  }, [account, api, alert]);

  useEffect(() => {
    setDisplayApr(calculateDisplayApr(apr));
  }, [apr]);

  const handleClaim = async () => {
    const withdrawRewardsMessage = createWithdrawRewardsMessage();
    try {
      if (rewardsUsdc <= 0) return;
      console.log("withdraw rewards init");
      alertModalContext?.showAlertModal(
        `Claim rewards in progress. Please check your wallet to sign the transaction.`,
        "info"
      );
      await withdrawRewardsTransaction(
        api,
        withdrawRewardsMessage,
        account,
        accounts,
        alert,
        setIsLoading,
        alertModalContext
      );
      alertModalContext?.hideAlertModal?.();
      console.log("withdraw done");
    } catch (error) {
      console.log(error);
    }
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
              onClick={() => {
                console.log("info");
                handleClick();
              }}
              style={{ width: "1rem", height: "1rem", marginLeft: "0.5rem" }}
              src={InfoIcon}
              alt="Info Icon"
            />
          </div>{" "}
          <p>${formatWithCommas(rewardsUsdc ?? 0)} vUSD</p>
        </div>
        <div className="Flex">
          <p>APR</p>
          <p>{displayApr}%</p>
        </div>
        <div
          className={`ButtonFlex ${rewardsUsdc > 0 ? "" : "disabled"}`}
          onClick={() => {
            handleClaim();
          }}
        >
          <ButtonGradientBorder text="Claim" isDisabled={rewardsUsdc <= 0} />
        </div>
      </div>
    </div>
  );
}

interface TooltipProps {
  message: string;
}

const Tooltip: React.FC<TooltipProps> = ({ message }) => {
  return (
    <div className="custom-tooltip">
      <p>{message}</p>
    </div>
  );
};

export default StakingInfoCard;
