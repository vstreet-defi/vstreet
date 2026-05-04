import { FC, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FeatureCard } from '@/components/molecules/cards/FeatureCard';
import { TiltWrapper } from '@/components/molecules/TiltWrapper/TiltWrapper';
import LendingIcon from '@/assets/images/icons/lend.svg?react';
import VaultsIcon from '@/assets/images/icons/vault.svg?react';
import BondsIcon from '@/assets/images/icons/bonds.svg?react';
import AgentsIcon from '@/assets/images/icons/agents.svg?react';
import styles from './Features.module.scss';

gsap.registerPlugin(ScrollTrigger);

const Features: FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          }
        );
      }

      const validItems = gridItemsRef.current.filter(Boolean);
      if (validItems.length > 0) {
        gsap.fromTo(
          validItems,
          { opacity: 0, y: 50 },
          {
            scrollTrigger: {
              trigger: validItems[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <LendingIcon />,
      title: 'Lending',
      description: 'Supply assets to earn yield or borrow against your collateral with competitive rates on Vara Network.',
      buttonText: 'View',
      onClick: () => navigate('/dapp?tab=supply'),
      disabled: false,
      comingSoon: false,
    },
    {
      icon: <VaultsIcon />,
      title: 'Vaults',
      description: 'Stake your LST tokens and earn additional yield through our optimized vault strategies.',
      buttonText: 'View',
      onClick: () => navigate('/dapp?tab=vaults'),
      disabled: false,
      comingSoon: false,
    },
    {
      icon: <BondsIcon />,
      title: 'VST Bonds',
      description: 'Mint VST stablecoins backed by your staked VARA. Low volatility, high utility for DeFi strategies.',
      buttonText: 'Coming Soon',
      onClick: () => {},
      disabled: true,
      comingSoon: true,
    },
    {
      icon: <AgentsIcon />,
      title: 'AI Trading Agents',
      description: 'Automated trading strategies powered by AI. Optimize your portfolio with intelligent agents.',
      buttonText: 'Coming Soon',
      onClick: () => {},
      disabled: true,
      comingSoon: true,
    },
  ];

  return (
    <section ref={containerRef} className={styles.features}>
      <div className={styles.container}>
        <div ref={headerRef} className={styles.header}>
          <h2 className={styles.title}>Our Features</h2>
          <p className={styles.subtitle}>
            Unlock the full potential of DeFi on Vara Network with our comprehensive suite of financial tools.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { gridItemsRef.current[index] = el; }}
              className={styles.gridItem}
            >
              <TiltWrapper max={8} scale={1.03}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  buttonText={feature.buttonText}
                  onClick={feature.onClick}
                  disabled={feature.disabled}
                  comingSoon={feature.comingSoon}
                />
              </TiltWrapper>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Features };
