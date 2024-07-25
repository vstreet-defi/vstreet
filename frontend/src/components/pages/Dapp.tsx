import DappTemplate from "components/templates/Dapp";
import ApiLoader from "components/atoms/ApiLoader";
import { useApi, useAccount } from "@gear-js/react-hooks";
import Header from "components/templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { AlertModal } from "components/molecules/alert-modal/AlertModal";
import { FundsManager } from "components/organisms/FundsManager/FundsManager";
import { AlertModalProvider } from "contexts/alertContext";

function DappPage() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const isAppReady = isApiReady && isAccountReady;
  const navBarItems = ["Home", "Supply", "Borrow", "Markets"];

  return (
    <>
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
                  <AlertModal type="info" />
                  {/* <ReadState /> */}
                </>
              }
              leftSectionComponent={
                <>
                  <FundsManager />
                </>
              }
              rightSectionComponent={<></>}
            />
          </>
        ) : (
          <ApiLoader />
        )}
      </AlertModalProvider>
    </>
  );
}

export default DappPage;
