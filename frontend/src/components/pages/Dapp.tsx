import DappTemplate from "components/templates/Dapp";
import ApiLoader from "components/atoms/ApiLoader";
import { useApi, useAccount } from "@gear-js/react-hooks";
import Header from "components/templates/Header/Header";

function DappPage() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const isAppReady = isApiReady && isAccountReady;
  return (
    <>
      {isAppReady ? (
        <>
          <Header isAccountVisible={isAccountReady} />
          <DappTemplate
            bannerComponent={<></>}
            leftSectionComponent={<></>}
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
