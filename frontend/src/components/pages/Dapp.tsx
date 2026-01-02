import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Template & Layout
import DappTemplate from "components/templates/Dapp";
import Header, { DappTab } from "components/templates/Header/Header";

// Contexts & Providers
import { LiquidityProvider } from "contexts/stateContext";
import { AlertModalProvider } from "contexts/alertContext";
import { useWallet } from "../../contexts/accountContext";

// Components
import { AlertModal } from "components/molecules/alert-modal/AlertModal";
import CollateralAndBorrowBanner from "components/atoms/CollateralAndBorrowBanner/CollateralAndBorrowBanner";
import { FundsManager } from "components/organisms/FundsManager/FundsManager";
import { FundsManagerBorrow } from "components/organisms/FundsManagerBorrow/FundsManagerBorrow";
import StatsPanel from "components/organisms/StatsPanel/StatsPanel";
import StakingInfo from "components/organisms/StakingInfo/StakingInfo";
import LoanInfo from "components/organisms/LoanInfo/LoanInfo";
import ComingSoon from "components/atoms/ComingSoon/ComingSoon";
import VaultsManager from "components/organisms/VaultsManager/VaultsManager";

// Utilities
import { isMobileDevice } from "utils/isMobile";

/**
 * DappPage Component
 * Main entry point for the dApp interface. Handles tab navigation, 
 * page transitions, and conditional rendering of sidebar/content areas.
 */
function DappPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Determine current tab from URL or default to Supply
  const tab = searchParams.get("tab") || DappTab.Supply.toLowerCase();
  const isSupplyTab = tab === DappTab.Supply.toLowerCase();
  const isBorrowTab = tab === DappTab.Borrow.toLowerCase();
  const isVaultsTab = tab === DappTab.Vaults.toLowerCase();

  // Framer-motion variants for the 'Cyber-Slide' page transition
  const variants = {
    initial: { opacity: 0, x: 20, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -20, filter: "blur(10px)" },
  };

  // Wallet connection state from PSYLABS account context
  const { allAccounts } = useWallet();

  const NAV_ITEMS = [
    DappTab.Supply,
    DappTab.Borrow,
    DappTab.Vaults,
  ];

  const isAccountReady = allAccounts.length > 0;

  return (
    <LiquidityProvider>
      <AlertModalProvider>
        <Header
          isAccountVisible={isAccountReady}
          items={NAV_ITEMS}
          isMobile={isMobileDevice()}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ width: "100%", overflow: "hidden" }}
          >
            <DappTemplate
              bannerComponent={
                isVaultsTab ? null : (
                  <>
                    <AlertModal />
                    {isSupplyTab ? (
                      <CollateralAndBorrowBanner text="DEPOSIT AND EARN REWARDS" />
                    ) : (
                      <CollateralAndBorrowBanner />
                    )}
                  </>
                )
              }
              sidebarLeft={isBorrowTab || isVaultsTab ? null : <StatsPanel />}
              mainContent={
                isSupplyTab ? (
                  <FundsManager />
                ) : isVaultsTab ? (
                  <VaultsManager />
                ) : (
                  <FundsManagerBorrow />
                )
              }
              sidebarRight={
                isSupplyTab ? <StakingInfo /> : isVaultsTab ? null : <LoanInfo />
              }
            />
          </motion.div>
        </AnimatePresence>
      </AlertModalProvider>
    </LiquidityProvider>
  );
}

export default DappPage;
