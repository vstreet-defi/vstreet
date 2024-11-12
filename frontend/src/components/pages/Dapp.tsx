import DappTemplate from "components/templates/Dapp";
import ApiLoader from "components/atoms/ApiLoader";
import CollateralAndBorrowBanner from "components/atoms/CollateralAndBorrowBanner/CollateralAndBorrowBanner";
import { useApi, useAccount } from "@gear-js/react-hooks";
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
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";

function DappPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");
  const isSupplyTab = tab === DappTab.Supply.toLowerCase();
  const isBorrowTab = tab === DappTab.Borrow.toLowerCase();
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const isAppReady = isApiReady && isAccountReady;
  const navBarItems = [
    DappTab.Home,
    DappTab.Supply,
    DappTab.Borrow,
    DappTab.Markets,
  ];

  return (
    <>
      <LiquidityProvider>
        <AlertModalProvider>
          {isAppReady ? (
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
          ) : (
            <ApiLoader />
          )}
        </AlertModalProvider>
      </LiquidityProvider>
    </>
  );
}

export default DappPage;
