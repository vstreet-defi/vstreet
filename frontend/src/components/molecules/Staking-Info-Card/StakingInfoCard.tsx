import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { useState, useEffect } from "react";
import { getStakingInfo } from "smart-contracts-tools";

export interface FullStateVST {
  apr: number;
  users: { [key: string]: any };
}

function StakingInfoCard() {
  const [fullState, setFullState] = useState<any | undefined>({});

  const { api } = useApi();
  const { account } = useAccount();
  const alert = useAlert();

  const [depositedBalance, setDepositedBalance] = useState<number | null>(null);
  const [rewardsUsdc, setRewardsUsdc] = useState<number | null>(null);
  const [apr, setApr] = useState<number | null>(null);
  const [displayApr, setDisplayApr] = useState<number | null>(null);

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
          <ButtonGradientBorder text="Claim" />
        </div>
      </div>
    </div>
  );
}

export default StakingInfoCard;
