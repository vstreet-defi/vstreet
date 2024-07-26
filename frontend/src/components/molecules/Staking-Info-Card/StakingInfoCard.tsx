import { useContext } from "react";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { useState, useEffect } from "react";
import { getStakingInfo } from "smart-contracts-tools";
import { AlertModalContext } from "contexts/alertContext";
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
  const [rewardsUsdc, setRewardsUsdc] = useState<number | null>(null);
  const [apr, setApr] = useState<number | null>(null);
  const [displayApr, setDisplayApr] = useState<number | null>(null);
  const alertModalContext = useContext(AlertModalContext);

  console.log(account?.decodedAddress);

  const calculateDisplayApr = (apr: number | null) => {
    if (apr !== null) {
      return apr / 10000;
    }
    return null;
  };

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
        <div className="Flex">
          <p>Total Deposited</p> <p>{depositedBalance}</p>
        </div>

        <div className="Flex">
          <p>Total Earned</p> <p>{rewardsUsdc}</p>
        </div>
        <div className="Flex">
          <p>APR</p>

          <p>{displayApr}%</p>
        </div>
        <div className="ButtonFlex">
          <div
            onClick={() => {
              handleClaim();
            }}
          >
            <ButtonGradientBorder text="Claim" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StakingInfoCard;
