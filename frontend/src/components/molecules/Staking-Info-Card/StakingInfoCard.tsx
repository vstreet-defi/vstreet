import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { programIDVST, metadataVST } from "utils/smartPrograms";
import { decodeAddress, GearApi } from "@gear-js/api";
import { useState, useEffect } from "react";
import { useAccount } from "@gear-js/react-hooks";
import { get } from "http";

function StakingInfoCard() {
  const [fullState, setFullState] = useState<any | undefined>({});
  const totalLiquidity = fullState.totalDeposited || [];
  const totalSynthLocked = fullState.totalSynteticDeposited || [];

  const [balanceUsdc, setBalanceUsdc] = useState<number | null>(null);
  const { account } = useAccount();

  console.log(account?.decodedAddress);

  const readState = async () => {
    const api = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });
    await api.programState
      .read({ programId: programIDVST }, metadataVST)
      .then((result) => {
        setFullState(result.toJSON());
        console.log(result.toJSON());
        // alert.success("Successful state");
        setFullState(result.toJSON());
      })
      .catch(({ message }: Error) => console.log(message));

    const userAddress = account?.decodedAddress;
    if (userAddress && fullState.users && fullState?.users[userAddress]) {
      setBalanceUsdc(fullState?.users[userAddress].balanceUsdc);
      return fullState?.users[userAddress].balanceUsdc;
    } else {
      console.log("User not found or no balanceUsdc available");
      return null;
    }
  };

  const getUserBalanceUsdc = async () => {
    const api = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });
    try {
      const result = await api.programState.read(
        { programId: programIDVST },
        metadataVST
      );
      const state = result.toJSON();
      setFullState(state);
      console.log(state);

      const userAddress = account?.decodedAddress;
      if (userAddress && fullState.users && fullState?.users[userAddress]) {
        return fullState?.users[userAddress].balanceUsdc;
      } else {
        console.log("User not found or no balanceUsdc available");
        return null;
      }
    } catch (error) {
      // console.log(error.message);
      return null;
    }
  };

  useEffect(() => {
    readState();
  }, [account]);
  console.log(balanceUsdc);

  return (
    <div>
      <div className="BasicCard">
        <div className="Flex">
          <p>Total Deposited</p> <p>{balanceUsdc}</p>
        </div>

        <div className="Flex">
          <p>Total Earned</p> <p>5</p>
        </div>
        <div className="Flex">
          <p>APR</p> <p>%5</p>
        </div>
        <div className="ButtonFlex">
          <ButtonGradientBorder text="Claim" />
        </div>
      </div>
    </div>
  );
}

export default StakingInfoCard;
