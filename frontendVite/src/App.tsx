import { useApi, useAccount } from '@gear-js/react-hooks';

import { ApiLoader } from '@/vstreet/components';
import { withProviders } from '@/hocs';
import { Routing } from '@/pages';
import { SmoothScroll } from '@/components/atoms/SmoothScroll/SmoothScroll';
import './App.scss';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const isAppReady = isApiReady && isAccountReady;

  return (
    <SmoothScroll>
      <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
    </SmoothScroll>
  );
}

export const App = withProviders(Component);
