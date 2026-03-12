import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  VaultPosition,
  GlobalVaultStats,
  UserVaultInfo,
  getUserActivePositions,
  getUserMaturedPositions,
  getUserAllPositions,
  getUserVaultInfo,
  getUserTotalPower,
  getUserTotalStaked,
  getGlobalVaultStats,
} from "smart-contracts-tools";

interface VaultContextProps {
  // Global stats
  globalStats: GlobalVaultStats | null;
  // User's positions
  activePositions: VaultPosition[];
  maturedPositions: VaultPosition[];
  allPositions: VaultPosition[];
  // User's aggregated info
  userVaultInfo: UserVaultInfo | null;
  totalPower: bigint;
  totalStaked: bigint;
  // Loading state
  isLoading: boolean;
  // Refresh functions
  fetchVaultData: (hexAddress: string) => Promise<void>;
  refreshGlobalStats: () => Promise<void>;
}

const VaultContext = createContext<VaultContextProps | undefined>(undefined);

interface VaultProviderProps {
  children: ReactNode;
}

export const VaultProvider: React.FC<VaultProviderProps> = ({ children }) => {
  const [globalStats, setGlobalStats] = useState<GlobalVaultStats | null>(null);
  const [activePositions, setActivePositions] = useState<VaultPosition[]>([]);
  const [maturedPositions, setMaturedPositions] = useState<VaultPosition[]>([]);
  const [allPositions, setAllPositions] = useState<VaultPosition[]>([]);
  const [userVaultInfo, setUserVaultInfo] = useState<UserVaultInfo | null>(
    null
  );
  const [totalPower, setTotalPower] = useState<bigint>(BigInt(0));
  const [totalStaked, setTotalStaked] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);

  const refreshGlobalStats = useCallback(async () => {
    try {
      const stats = await getGlobalVaultStats();
      if (stats) {
        setGlobalStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch global vault stats:", error);
    }
  }, []);

  const fetchVaultData = useCallback(async (hexAddress: string) => {
    if (!hexAddress) return;

    setIsLoading(true);
    console.log("VaultContext: Starting fetch for", hexAddress);

    try {
      // Fetch all data in parallel for efficiency
      const [active, matured, all, vaultInfo, power, staked, stats] =
        await Promise.all([
          getUserActivePositions(hexAddress),
          getUserMaturedPositions(hexAddress),
          getUserAllPositions(hexAddress),
          getUserVaultInfo(hexAddress),
          getUserTotalPower(hexAddress),
          getUserTotalStaked(hexAddress),
          getGlobalVaultStats(),
        ]);

      setActivePositions(active);
      setMaturedPositions(matured);
      setAllPositions(all);
      setUserVaultInfo(vaultInfo);
      setTotalPower(power);
      setTotalStaked(staked);
      if (stats) {
        setGlobalStats(stats);
      }

      console.log("VaultContext: Data fetched successfully", {
        activePositions: active.length,
        maturedPositions: matured.length,
        allPositions: all.length,
        totalPower: power.toString(),
        totalStaked: staked.toString(),
      });
    } catch (error) {
      console.error("VaultContext: Failed to fetch vault data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <VaultContext.Provider
      value={{
        globalStats,
        activePositions,
        maturedPositions,
        allPositions,
        userVaultInfo,
        totalPower,
        totalStaked,
        isLoading,
        fetchVaultData,
        refreshGlobalStats,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
};
