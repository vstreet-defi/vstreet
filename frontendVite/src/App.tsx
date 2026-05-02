import { useApi, useAccount } from '@gear-js/react-hooks';

import { ApiLoader } from '@/vstreet/components';
import { withProviders } from '@/hocs';
import { Routing } from '@/pages';
import Background from '@/vstreet/components/atoms/Background/Background.tsx';
import './App.scss';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const isAppReady = isApiReady && isAccountReady;

  return (
    <>
      <Background />
      <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
    </>
  );
}

export const App = withProviders(Component);
