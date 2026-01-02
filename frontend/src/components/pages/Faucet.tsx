import Header, { DappTab } from "components/templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { AlertModal } from "components/molecules/alert-modal/AlertModal";
import { AlertModalProvider } from "contexts/alertContext";
import { LiquidityProvider } from "contexts/stateContext";
import { useWallet } from "../../contexts/accountContext";
import { FaucetCard } from "components/molecules/Faucet-Card/FaucetCard";

function Faucet() {
  const {
    allAccounts,
    selectedAccount,
    handleConnectWallet,
    handleSelectAccount,
    formatAccount,
  } = useWallet();

  const navBarItems = [
    DappTab.Home,
    DappTab.Supply,
    DappTab.Borrow,

    DappTab.Vaults,
  ];

  const isAccountReady = allAccounts.length > 0;

  return (
    <LiquidityProvider>
      <AlertModalProvider>
        <>
          <Header
            isAccountVisible={isAccountReady}
            items={navBarItems}
            isMobile={isMobileDevice()}
          />
          <FaucetCard></FaucetCard>
          <AlertModal />
        </>
      </AlertModalProvider>
    </LiquidityProvider>
  );
}

export { Faucet };
