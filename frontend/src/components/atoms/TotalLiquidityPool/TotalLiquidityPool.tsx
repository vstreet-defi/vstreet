import { useEffect, useState } from "react";
import { GearApi } from "@gear-js/api";

import { programIDVST, metadataVST } from "../../../utils/smartPrograms";

function TotalLiquidityPool() {
  const [totalLiquidityPool, setTotalLiquidityPool] = useState(0);
  const [fullState, setFullState] = useState<any | undefined>({});
  const [tvl, setTvl] = useState(0);

  const TLVdisplay = () => {
    if (fullState) {
      const tvl1 = fullState.totalDeposited / 1000000;

      tvl1.toLocaleString();
      console.log(tvl1);
      setTvl(tvl1);
    }
  };
  const formatWithCommas = (number: number) => {
    return number.toLocaleString();
  };

  useEffect(() => {
    const fetchTotalLiquidityPool = async () => {
      const api = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
      await api.programState
        .read({ programId: programIDVST }, metadataVST)
        .then((result) => {
          setFullState(result.toJSON());
          console.log(result.toJSON());
          setTotalLiquidityPool(fullState.totalDeposited);
          // TLVdisplay();

          // alert.success("Successful state");
        })
        .catch(({ message }: Error) => console.log(message));
    };
    fetchTotalLiquidityPool();
  }, [fullState]);

  return (
    <div className="Box">
      <h2 className="Heading">Total Liquidity Pool </h2>

      <p className="Data"> ${totalLiquidityPool} vUSDC</p>
    </div>
  );
}

export default TotalLiquidityPool;
