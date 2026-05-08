import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Logo from '@/assets/images/icons/vStreet-Navbar-Color-White.png';
import styles from './HomeHeader.module.scss';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      let lastScroll = 0;

      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          const currentScroll = self.scroll();

          setScrolled(currentScroll > 50);

          if (currentScroll > lastScroll && currentScroll > 100) {
            gsap.to(headerRef.current, {
              y: -100,
              duration: 0.3,
              ease: 'power2.out',
            });
          } else {
            gsap.to(headerRef.current, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          }

          lastScroll = currentScroll;
        },
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

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

  const handleLogoClick = () => {
    gsap.to(window, {
      scrollTo: { y: 0, autoKill: true },
      duration: 0.8,
      ease: 'power2.inOut',
    });
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
    <header ref={headerRef} className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <button className={styles.logoButton} onClick={handleLogoClick}>
        <img className={styles.logo} src={Logo} alt="Logo" />
      </button>
      {isMobile ? (
        <div className={styles.burgerMenu}>
          <button className={styles.burgerIcon} onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`${styles.line} ${menuOpen ? styles.open : ''}`}></div>
            <div className={`${styles.line} ${menuOpen ? styles.open : ''}`}></div>
            <div className={`${styles.line} ${menuOpen ? styles.open : ''}`}></div>
          </button>
          <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuOpen : ''}`}>
            <ul>
              {items.map((item, index) => (
                <li key={index}>
                  <button onClick={() => handleClick(item)}>{item}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.itemsContainer}>{renderItems()}</div>
          <button className={styles.connectButton} type="button" onClick={() => navigate('/dapp')}>
            Launch App
          </button>
        </>
      )}
    </header>
  );
};

export { HomeHeader };
