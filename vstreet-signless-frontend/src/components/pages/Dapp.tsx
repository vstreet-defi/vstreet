import DappTemplate from '../templates/Dapp/Dapp';
import React, { useEffect, useState } from 'react';
import CollateralAndBorrowBanner from '../atoms/CollateralAndBorrowBanner/CollateralAndBorrowBanner';
import Header, { DappTab } from '../templates/Header/Header';
import { isMobileDevice } from '../../utils/isMobile';
import { AlertModal } from '../molecules/alert-modal/AlertModal';
import { FundsManager } from '../organisms/FundsManager/FundsManager';
import TotalLiquidityPool from '../atoms/TotalLiquidityPool/TotalLiquidityPool';
import { AlertModalProvider } from '../../contexts/alertContext';
import StakingInfo from '../organisms/StakingInfo/StakingInfo';
import { LiquidityProvider } from '../../contexts/stateContext';
import { useLocation } from 'react-router-dom';
import LoanInfo from '../organisms/LoanInfo/LoanInfo';
import { FundsManagerBorrow } from '../organisms/FundsManagerBorrow/FundsManagerBorrow';
import './Dapp.scss';


function DappPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');
  const isSupplyTab = tab === DappTab.Supply.toLowerCase();
  const isBorrowTab = tab === DappTab.Borrow.toLowerCase();

  //Splice escene small
  //https://prod.spline.design/Nam5w76DquhQTXJ0/scene.splinecode

  //Splice escene large
  //https://prod.spline.design/HuxD1L0ZMBZZ6p81/scene.splinecode

  const [sceneUrl, setSceneUrl] = useState('https://prod.spline.design/HuxD1L0ZMBZZ6p81/scene.splinecode');

  const navBarItems = [DappTab.Home, DappTab.Supply, DappTab.Borrow, DappTab.Markets];

  return (
    <>
      <LiquidityProvider>
        <AlertModalProvider>
          {
            <>
              <Header items={navBarItems} isMobile={isMobileDevice()} />
              <DappTemplate
                bannerComponent={
                  <>
                    <AlertModal />
                    {isSupplyTab ? <TotalLiquidityPool /> : <CollateralAndBorrowBanner />}
                  </>
                }
                leftSectionComponent={<>{isSupplyTab ? <FundsManager /> : <FundsManagerBorrow />}</>}
                rightSectionComponent={<>{isSupplyTab ? <StakingInfo /> : <LoanInfo />}</>}
              />
            </>
          }
        </AlertModalProvider>
      </LiquidityProvider>
    </>
  );
}

export default DappPage;
