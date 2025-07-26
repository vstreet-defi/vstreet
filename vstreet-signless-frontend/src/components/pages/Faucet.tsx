import Header, { DappTab } from '../templates/Header/Header';
import { isMobileDevice } from '../../utils/isMobile';
import { AlertModal } from '../molecules/alert-modal/AlertModal';
import { AlertModalProvider } from '../../contexts/alertContext';
import { LiquidityProvider } from '../../contexts/stateContext';
import { FaucetCard } from '../molecules/Faucet-Card/FaucetCard';

function Faucet() {
  const navBarItems = [DappTab.Home, DappTab.Supply, DappTab.Borrow, DappTab.Markets];

  return (
    <LiquidityProvider>
      <AlertModalProvider>
        <>
          <Header items={navBarItems} isMobile={isMobileDevice()} />
          <FaucetCard></FaucetCard>
          <AlertModal />
        </>
      </AlertModalProvider>
    </LiquidityProvider>
  );
}

export { Faucet };
