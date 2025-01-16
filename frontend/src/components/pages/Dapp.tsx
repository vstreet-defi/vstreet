import DappTemplate from "components/templates/Dapp";
import React, { useEffect, useState } from "react";
import ApiLoader from "components/atoms/ApiLoader";
import { useApi, useAccount } from "@gear-js/react-hooks";
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

import "./Dapp.scss";
import { position } from "@chakra-ui/react";

function DappPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");
  const isSupplyTab = tab === DappTab.Supply.toLowerCase();
  const isBorrowTab = tab === DappTab.Borrow.toLowerCase();

  //Splice escene small
  //https://prod.spline.design/Nam5w76DquhQTXJ0/scene.splinecode

  //Splice escene large
  //https://prod.spline.design/HuxD1L0ZMBZZ6p81/scene.splinecode

  const [sceneUrl, setSceneUrl] = useState(
    "https://prod.spline.design/HuxD1L0ZMBZZ6p81/scene.splinecode"
  );

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
