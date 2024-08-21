import { useEffect, useState } from "react";
import { GearApi } from "@gear-js/api";

import {
  vstreetProgramID,
  decodedVstreetMeta,
} from "../../../utils/smartPrograms";

function TotalLiquidityPool() {
  const [totalLiquidityPool, setTotalLiquidityPool] = useState(0);
  const [fullState, setFullState] = useState<any | undefined>({});
  const [apr, setApr] = useState(0);
  const [tvl, setTvl] = useState(0);

  const TLVdisplay = async () => {
    if (fullState) {
      const tvl1 = fullState.totalDeposited / 1000000;
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
        .read({ programId: vstreetProgramID }, decodedVstreetMeta)
        .then((result) => {
          setFullState(result.toJSON());
          setTotalLiquidityPool(fullState.totalDeposited);
          setApr(fullState.apr / 10000);
        })
        .catch(({ message }: Error) => console.log(message));
    };

    try {
      fetchTotalLiquidityPool();
      TLVdisplay();
    } catch (error) {}
  }, [fullState.totalDeposited]);

  return (
    <div className="Container">
      <div>
        <h2 className="Heading-Deposit">Deposit your $vUSDC and earn</h2>
        <p className="DataAPY">{apr}% Annual Interest APY</p>
      </div>
      <div className="Box">
        <h2 className="Heading">Total Liquidity Pool: </h2>

        <p className="Data"> ${formatWithCommas(tvl)} vUSDC</p>
      </div>
    </div>
  );
}

export default TotalLiquidityPool;
