import { useEffect, useState } from "react";
import { GearApi } from "@gear-js/api";
import {
  vstreetProgramID,
  decodedVstreetMeta,
} from "../../../utils/smartPrograms";
import { FullStateVST } from "../../../smart-contracts-tools";
import { formatNumber } from "utils";

const useTotalLiquidityPool = () => {
  const [totalLiquidityPool, setTotalLiquidityPool] = useState(0);
  const [fullState, setFullState] = useState<FullStateVST | undefined>(
    undefined
  );
  const [apr, setApr] = useState(0);

  const fetchTotalLiquidityPool = async () => {
    try {
      const api = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
      });
      const result = await api.programState.read(
        { programId: vstreetProgramID },
        decodedVstreetMeta
      );

      const state = result.toJSON() as unknown as FullStateVST;

      if (state && typeof state === "object" && "users" in state) {
        setFullState(state);
        const totalDeposited = Object.values(state.users).reduce(
          (acc, user) => acc + (user.balance || 0),
          0
        );
        setTotalLiquidityPool(totalDeposited);
        if (state.apr) {
          setApr(state.apr / 10000);
        }
      } else {
        throw new Error("Unexpected state format");
      }
    } catch (error) {
      console.error(
        `Failed to fetch total liquidity pool: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  useEffect(() => {
    fetchTotalLiquidityPool();
  }, []);

  return { totalLiquidityPool, apr, fullState };
};

const formatWithCommas = (number: number) => {
  return number.toLocaleString();
};

const TotalLiquidityPool: React.FC = () => {
  const { totalLiquidityPool, apr } = useTotalLiquidityPool();
  const [tvl, setTvl] = useState(0);

  useEffect(() => {
    setTvl(totalLiquidityPool / 1000000);
  }, [totalLiquidityPool]);

  return (
    <div className="Container">
      <div>
        <h2 className="Heading-Deposit">Deposit your $vUSD and earn</h2>
        <p className="DataAPY">{formatNumber(apr)}% Annual Interest (APR)</p>
      </div>
      <div className="Box">
        <h2 className="Heading">Total Liquidity Pool:</h2>
        <p className="Data"> ${formatWithCommas(tvl)} vUSD</p>
      </div>
    </div>
  );
};

export default TotalLiquidityPool;
