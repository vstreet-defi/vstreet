import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  web3Accounts,
  web3Enable,
  web3AccountsSubscribe,
} from "@polkadot/extension-dapp";
import { decodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

interface Account {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

interface WalletContextType {
  allAccounts: Account[];
  selectedAccount: string | null;
  accountData: Account;
  hexAddress: any;
  isWalletConnected: boolean;
  handleConnectWallet: () => void;
  handleSelectAccount: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  formatAccount: (account: string) => string;
}

const NAME = "Polkattest";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [allAccounts, setAllAccounts] = useState<Account[]>(() => {
    const storedAccounts = sessionStorage.getItem("allAccounts");
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  });

  const [selectedAccount, setSelectedAccount] = useState<string | null>(() => {
    const storedSelectedAccount = sessionStorage.getItem("selectedAccount");

    return storedSelectedAccount || null;
  });

  const [accountData, setAccountData] = useState<any>();
  const [hexAddress, setHexAddress] = useState<string>(() => {
    const account = sessionStorage.getItem("selectedAccount");
    return account ? u8aToHex(decodeAddress(account)) : "";
  });

  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(() => {
    return sessionStorage.getItem("allAccounts") ? true : false;
  });

  const isSubscribed = useRef(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleConnectWallet = async () => {
    try {
      const extensions = await web3Enable(NAME);
      if (!extensions.length) {
        alert("Please install Polkadot JS or Talisman Extension to continue.");
        return;
      }

      const accounts = await web3Accounts();
      if (accounts.length > 0) {
        setAllAccounts(accounts);
        setSelectedAccount(accounts[0].address);
        sessionStorage.setItem("allAccounts", JSON.stringify(accounts));
        sessionStorage.setItem("selectedAccount", accounts[0].address);
        setIsWalletConnected(true);
      } else {
        alert(
          "No accounts found. Please connect one in your wallet extension."
        );
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleSelectAccount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const address = event.target.value;
    setSelectedAccount(address);
    const account = allAccounts.find(
      (acc: Account) => acc.address === selectedAccount
    );
    setAccountData(account);
    sessionStorage.setItem("selectedAccount", address);
    const hexAddress = address.length && u8aToHex(decodeAddress(address));

    setHexAddress(hexAddress || "");
  };

  useEffect(() => {
    if (isSubscribed.current) {
      return;
    }

    const subscribeToAccountChanges = async () => {
      try {
        await web3Enable(NAME);
        const unsubscribe = await web3AccountsSubscribe((newAccounts) => {
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }

          debounceTimeoutRef.current = setTimeout(() => {
            const storedAccounts = JSON.parse(
              sessionStorage.getItem("allAccounts") || "[]"
            );

            const accountsAreEqual = (
              accounts1: Account[],
              accounts2: Account[]
            ) => {
              if (accounts1.length !== accounts2.length) {
                return false;
              }
              const addresses1 = accounts1.map((acc) => acc.address).sort();
              const addresses2 = accounts2.map((acc) => acc.address).sort();
              return addresses1.every((addr, idx) => addr === addresses2[idx]);
            };

            const hasChanged = !accountsAreEqual(newAccounts, storedAccounts);

            if (hasChanged) {
              setAllAccounts(newAccounts);
              sessionStorage.setItem(
                "allAccounts",
                JSON.stringify(newAccounts)
              );

              if (!newAccounts.some((acc) => acc.address === selectedAccount)) {
                const firstAccount = newAccounts[0]?.address || null;
                setSelectedAccount(firstAccount);
                sessionStorage.setItem("selectedAccount", firstAccount || "");
              }

              setIsWalletConnected(newAccounts.length > 0);
            }
          }, 500);
        });

        isSubscribed.current = true;

        return () => {
          unsubscribe();
          isSubscribed.current = false;
        };
      } catch (error) {
        console.error("Error subscribing to account changes:", error);
      }
    };

    subscribeToAccountChanges();
  }, [selectedAccount]);

  const formatAccount = (account: string) =>
    account.length > 4 ? `...${account.slice(-4)}` : account;

  return (
    <WalletContext.Provider
      value={{
        allAccounts,
        selectedAccount,
        accountData,
        hexAddress,
        isWalletConnected,
        handleConnectWallet,
        handleSelectAccount,
        formatAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export { WalletProvider, useWallet };
