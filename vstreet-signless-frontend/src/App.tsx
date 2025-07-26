import { useApi, useAccount } from '@gear-js/react-hooks';
import { Header, Footer, ApiLoader } from '@/components';
import { withProviders } from '@/hocs';
import { Routing } from '@/pages';
import './App.scss';
import '@gear-js/vara-ui/dist/style.css';


function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const isAppReady = isApiReady && isAccountReady;

  return (
    <>
      <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
     
    </>
  );
}

export const App = withProviders(Component);
