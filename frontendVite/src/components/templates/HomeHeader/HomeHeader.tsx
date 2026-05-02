import React, { useState } from 'react';
import Logo from '@/assets/images/icons/vStreet-Navbar-Color-White.png';
import styles from './HomeHeader.module.scss';

export enum HomeTab {
  GitHub = 'GitHub',
  Team = 'Team',
  ContactUs = 'Contact us',
}

type Props = {
  items: string[];
  isMobile: boolean;
};

const HomeHeader: React.FC<Props> = ({ items, isMobile }) => {
  const [menuOpen, setMenuOpen] = useState(false);

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
    if (Object.values(HomeTab).includes(item as HomeTab)) {
      homeTabActions[item as HomeTab]();
    }
    setMenuOpen(false);
  };

  const renderItems = () =>
    items.map((item, index) => (
      <div className={styles.itemWrapper} key={index}>
        <button className={styles.navTab} onClick={() => handleClick(item)}>
          {item}
        </button>
      </div>
    ));

  return (
    <header className={styles.header}>
      <button className={styles.logoButton} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <img className={styles.logo} src={Logo} alt="Logo" />
      </button>
      {isMobile ? (
        <div className={styles.burgerMenu}>
          <button className={styles.burgerIcon} onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`${styles.line} ${menuOpen ? styles.open : ''}`}></div>
            <div className={`${styles.line} ${menuOpen ? styles.open : ''}`}></div>
            <div className={`${styles.line} ${menuOpen ? styles.open : ''}`}></div>
          </button>
          {menuOpen && (
            <div className={styles.mobileMenu}>
              <ul>
                {items.map((item, index) => (
                  <li key={index}>
                    <button onClick={() => handleClick(item)}>{item}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={styles.itemsContainer}>{renderItems()}</div>
          <button className={styles.connectButton} type="button" onClick={() => (window.location.href = '/dapp')}>
            Launch App
          </button>
        </>
      )}
    </header>
  );
};

export { HomeHeader };
