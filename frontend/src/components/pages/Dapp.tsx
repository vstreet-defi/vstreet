import DappTemplate from "components/templates/Dapp";
import ApiLoader from "components/atoms/ApiLoader";
import { useApi, useAccount } from "@gear-js/react-hooks";
import Header, { DappTab } from "components/templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { AlertModal } from "components/molecules/alert-modal/AlertModal";
import { FundsManager } from "components/organisms/FundsManager/FundsManager";
import TotalLiquidityPool from "components/atoms/TotalLiquidityPool/TotalLiquidityPool";
import { AlertModalProvider } from "contexts/alertContext";
import StakingInfo from "components/organisms/StakingInfo/StakingInfo";
import { LiquidityProvider } from "contexts/stateContext";
import { useWallet } from "../../contexts/accountContext";
import Spline from "@splinetool/react-spline";
import "./Dapp.scss";
import { position } from "@chakra-ui/react";

function DappPage() {
  // const { isApiReady } = useApi();
  // const { isAccountReady } = useAccount();
  // const isAppReady = isApiReady && isAccountReady;

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
                  <div className="background-container">
                    <Spline scene="https://prod.spline.design/Nam5w76DquhQTXJ0/scene.splinecode" />
                    <div
                      className="content"
                      style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <AlertModal />
                      <TotalLiquidityPool />
                    </div>
                  </div>
                }
                leftSectionComponent={
                  <>
                    <FundsManager />
                  </>
                }
                rightSectionComponent={
                  <>
                    <StakingInfo />
                  </>
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
