import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DisplayWallet } from '../../organisms/Wallet/DisplayWallet';
import Flag from '../../atoms/Flag/Flag';
import Logo from '../../../assets/images/icons/vStreet-Navbar-Color-White.png';
import styles from '../../molecules/wallet/Wallet.module.scss';
import BurgerMenu from '../../organisms/BurgerMenu/BurgerMenu';

export enum DappTab {
  Home = 'Home',
  Supply = 'Supply',
  Borrow = 'Borrow',
  Markets = 'Markets',
}

export enum HomeTab {
  GitHub = 'GitHub',
  Team = 'Team',
  ContactUs = 'Contact us',
}

type Props = {
  items: string[];
  isMobile: boolean;
};

const Header: React.FC<Props> = ({ items, isMobile }) => {
  const [activeTab, setActiveTab] = useState<string | null>(DappTab.Supply.toLowerCase());
  const navigate = useNavigate();
  const location = useLocation();
  const isTablet = window.innerWidth < 822;
  const isDapp = location.pathname.startsWith('/dapp');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') as DappTab | null;

    if (isDapp && !tab) {
      navigate('/dapp?tab=supply', { replace: true });
      setActiveTab(DappTab.Supply.toLowerCase());
    } else if (isDapp) {
      setActiveTab((tab || DappTab.Supply).toLowerCase());
    } else {
      setActiveTab(null); // Resetear en otras rutas
    }
  }, [location.search, location.pathname, navigate, isDapp]);

  const dappTabActions: Record<DappTab, () => void> = {
    [DappTab.Home]: () => {
      navigate('/');
      setActiveTab(null);
    },
    [DappTab.Borrow]: () => {
      navigate('/dapp?tab=borrow');
      setActiveTab(DappTab.Borrow.toLowerCase());
    },
    [DappTab.Supply]: () => {
      navigate('/dapp?tab=supply');
      setActiveTab(DappTab.Supply.toLowerCase());
    },
    [DappTab.Markets]: () => {},
  };

  const homeTabActions: Record<HomeTab, () => void> = {
    [HomeTab.GitHub]: () => window.open('https://github.com/vstreet-defi/vstreet', '_blank'),
    [HomeTab.Team]: () => {
      window.location.href = '#team';
    },
    [HomeTab.ContactUs]: () => {
      window.location.href = '#social';
    },
  };

  const handleClick = (item: string): void => {
    if (Object.values(DappTab).includes(item as DappTab)) {
      dappTabActions[item as DappTab]();
    } else if (Object.values(HomeTab).includes(item as HomeTab)) {
      homeTabActions[item as HomeTab]();
    }
  };

  const renderFlag = (item: string) => {
    if (item !== DappTab.Home && isDapp) {
      return <Flag text={item === DappTab.Markets ? 'Coming Soon' : 'New'} />;
    }
    return null;
  };

  const renderItems = () =>
    items.map((item, index) => (
      <div className="item-wrapper" key={index}>
        {renderFlag(item)}
        <button
          className={`item${item.toLowerCase() === activeTab && isDapp ? '-active' : ''}`}
          onClick={() => handleClick(item)}>
          <p>{item}</p>
        </button>
      </div>
    ));

  const renderContent = () => {
    if (isMobile || isTablet) {
      return <BurgerMenu items={items} selectedTab={activeTab} />;
    }

    return (
      <>
        <div className="items-container">{renderItems()}</div>
        {true || location.pathname === '/dapp' ? (
          <DisplayWallet />
        ) : (
          <button
            className={styles.connectWallet}
            type="button"
            onClick={() => navigate('/dapp?tab=borrow')}
            style={{ opacity: 0.4 }}>
            <p>Testnet App </p>
          </button>
        )}
      </>
    );
  };

  return (
    <header>
      <img className="NavBar-Logo" src={Logo} alt="Logo" onClick={() => navigate('/')} />
      {renderContent()}
    </header>
  );
};

export default Header;
