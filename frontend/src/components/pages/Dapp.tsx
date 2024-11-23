import DappTemplate from "components/templates/Dapp";
import CollateralAndBorrowBanner from "components/atoms/CollateralAndBorrowBanner/CollateralAndBorrowBanner";
import Header, { DappTab } from "components/templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { AlertModal } from "components/molecules/alert-modal/AlertModal";
import { FundsManager } from "components/organisms/FundsManager/FundsManager";
import TotalLiquidityPool from "components/atoms/TotalLiquidityPool/TotalLiquidityPool";
import { AlertModalProvider } from "contexts/alertContext";
import StakingInfo from "components/organisms/StakingInfo/StakingInfo";
import { LiquidityProvider } from "contexts/stateContext";
import { useLocation } from "react-router-dom";
import LoanInfo from "components/organisms/LoanInfo/LoanInfo";
import { FundsManagerBorrow } from "components/organisms/FundsManagerBorrow/FundsManagerBorrow";
import { useWallet } from "../../contexts/accountContext";

function DappPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");
  const isSupplyTab = tab === DappTab.Supply.toLowerCase();
  const isBorrowTab = tab === DappTab.Borrow.toLowerCase();

  //Polkadot Extension Wallet-Hook by PSYLABS
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
    DappTab.Markets,
  ];

  const isAccountReady = allAccounts.length > 0;

  return (
    <>
      <LiquidityProvider>
        <AlertModalProvider>
          {
            <>
              <Header
                isAccountVisible={isAccountReady}
                items={navBarItems}
                isMobile={isMobileDevice()}
              />
              <DappTemplate
                bannerComponent={
                  <>
                    <AlertModal />
                    {isSupplyTab ? (
                      <TotalLiquidityPool />
                    ) : (
                      <CollateralAndBorrowBanner />
                    )}
                  </>
                }
                leftSectionComponent={
                  <>{isSupplyTab ? <FundsManager /> : <FundsManagerBorrow />}</>
                }
                rightSectionComponent={
                  <>{isSupplyTab ? <StakingInfo /> : <LoanInfo />}</>
                }
              />
            </>
          }
        </AlertModalProvider>
      </LiquidityProvider>
    </>
  );
}

export default DappPage;
