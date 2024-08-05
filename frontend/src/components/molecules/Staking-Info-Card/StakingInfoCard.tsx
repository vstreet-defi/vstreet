import { useContext, useRef } from "react";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { useState, useEffect } from "react";
import { getStakingInfo } from "smart-contracts-tools";
import { AlertModalContext } from "contexts/alertContext";
import { GearApi } from "@gear-js/api";
import { programIDVST, metadataVST } from "../../../utils/smartPrograms";
import InfoIcon from "assets/images/icons/info_Icon.png";
import {
  createWithdrawRewardsMessage,
  withdrawRewardsTransaction,
} from "smart-contracts-tools";

function StakingInfoCard() {
  const [fullState, setFullState] = useState<any | undefined>({});

  const { api } = useApi();
  const { account, accounts } = useAccount();
  const alert = useAlert();

  const [depositedBalance, setDepositedBalance] = useState<number | null>(null);
  const [rewardsUsdc, setRewardsUsdc] = useState<number>(0);
  const [apr, setApr] = useState(0);
  const [totalLiquidityPool, setTotalLiquidityPool] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const alertModalContext = useContext(AlertModalContext);

  const handleClick = () => {
    setShowMessage((prevState) => !prevState);
  };

  const calculateDisplayApr = () => {
    setApr(fullState.apr / 10000);
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
        setFullState,
        setRewardsUsdc
      );

      console.log(depositedBalance);
    }
  }, [account, alert, depositedBalance]);

  useEffect(() => {
    const fetchTotalLiquidityPool = async () => {
      const api = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
      await api.programState
        .read({ programId: programIDVST }, metadataVST)
        .then((result) => {
          setFullState(result.toJSON());
          console.log("fullState", fullState);
          setTotalLiquidityPool(fullState.totalDeposited);
          setApr(fullState.apr / 10000);
        })
        .catch(({ message }: Error) => console.log(message));
    };

    try {
      fetchTotalLiquidityPool();
    } catch (error) {}
  }, [fullState.totalDeposited]);

  // useEffect(() => {
  //   const aprDisplay = fullState.apr / 10000;
  //   console.log("aprDisplay", aprDisplay);
  //   setApr(aprDisplay);
  // }, [account]);
  console.log("fullState.apr", apr);

  const handleClaim = async () => {
    const withdrawRewardsMessage = createWithdrawRewardsMessage();
    try {
      if (rewardsUsdc <= 0) return;
      alertModalContext?.showInfoModal(
        "Claim rewards in progress. Please check your wallet to sign the transaction."
      );
      await withdrawRewardsTransaction(
        api,
        withdrawRewardsMessage,
        account,
        accounts
      );
      alertModalContext?.hideAlertModal?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alertModalContext?.showErrorModal(errorMessage);
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 5000);
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
          <p>{apr}%</p>
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
