import DappTemplate from "components/templates/Dapp";
import ApiLoader from "components/atoms/ApiLoader";
import { useApi, useAccount } from "@gear-js/react-hooks";
import Header from "components/templates/Header/Header";
import { isMobileDevice } from "utils/isMobile";
import { LiquidityInjection } from "components/organisms/LiquidityInjection/LiquidityInjection";
import { Box } from "@chakra-ui/react";

function DappPage() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const isAppReady = isApiReady && isAccountReady;
  const navBarItems = ["Home", "Supply", "Borrow", "Markets"];
  return (
    <>
      {isAppReady ? (
        <>
          <Header
            isAccountVisible={isAccountReady}
            items={navBarItems}
            isMobile={isMobileDevice()}
          />
          <DappTemplate
            bannerComponent={<></>}
            leftSectionComponent={
              <>
                <LiquidityInjection />
              </>
            }
            rightSectionComponent={<></>}
          />
        </>
      ) : (
        <ApiLoader />
      )}
    </>
  );
}

export default DappPage;
