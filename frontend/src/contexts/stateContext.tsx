import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { GearApi } from "@gear-js/api";
import { FullStateVST } from "smart-contracts-tools";
import { decodedVstreetMeta, vstreetProgramID } from "utils/smartPrograms";
import { formatNumber } from "utils";
import { useApi } from "@gear-js/react-hooks";

interface LiquidityContextProps {
  apr: number;
  totalLiquidityPool: number;
  loading: boolean;
  refetchData: () => Promise<void>;
}

const LiquidityContext = createContext<LiquidityContextProps | undefined>(
  undefined
);

export const useLiquidityData = () => {
  const context = useContext(LiquidityContext);
  if (context === undefined) {
    throw new Error("useLiquidityData must be used within a LiquidityProvider");
  }
  return context;
};

interface LiquidityProviderProps {
  children: React.ReactNode;
}

export const LiquidityProvider: React.FC<LiquidityProviderProps> = ({
  children,
}) => {
  const [liquidityData, setLiquidityData] = useState<
    Omit<LiquidityContextProps, "refetchData">
  >({
    apr: 0,
    totalLiquidityPool: 0,
    loading: true,
  });
  const { api } = useApi();

  const fetchLiquidityData = useCallback(async () => {
    try {
      const result = await api.programState.read(
        {
          programId: vstreetProgramID,
          payload: ''
        },
        decodedVstreetMeta
      );

      const state = result.toJSON() as FullStateVST | null;

      if (state && typeof state === "object") {
        setLiquidityData((prevData) => ({
          ...prevData,
          totalLiquidityPool:
            "totalDeposited" in state && state.totalDeposited !== undefined
              ? Number(state.totalDeposited)
              : prevData.totalLiquidityPool,
          apr:
            "apr" in state && state.apr !== undefined
              ? formatNumber(state.apr / 10000)
              : prevData.apr,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching liquidity data:", error);
      setLiquidityData((prevData) => ({ ...prevData, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchLiquidityData();
  }, [fetchLiquidityData]);

  const contextValue: LiquidityContextProps = {
    ...liquidityData,
    refetchData: fetchLiquidityData,
  };

  return (
    <LiquidityContext.Provider value={contextValue}>
      {children}
    </LiquidityContext.Provider>
  );
};
