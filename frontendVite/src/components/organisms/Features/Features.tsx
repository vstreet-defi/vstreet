import { FC, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FeatureCard } from '@/components/molecules/cards/FeatureCard';
import styles from './Features.module.scss';

gsap.registerPlugin(ScrollTrigger);

const LendingIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00ffc4" fill="none">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.786l.996-1.651a.75.75 0 01.996-.001l1.65.995a11.95 11.95 0 01-10.45 6.95l-.995-1.65-1.65.996a.75.75 0 01-.997 0L9 17.25l-6.75-6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0l3-3m-3 3l-3-3" />
  </svg>
);

const VaultsIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00ffc4" fill="none">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9l9-5.25m-9 9v9l9-5.25M3 7.5l9 5.25" />
  </svg>
);

const BondsIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00ffc4" fill="none">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.514.514a3.5 3.5 0 004.972 0l.514-.514a3.5 3.5 0 00-4.972 0l-.514.514zm0-4.364l.514-.514a3.5 3.5 0 014.972 0l.514.514a3.5 3.5 0 01-4.972 0l-.514-.514z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M3.75 3h16.5" />
  </svg>
);

const AgentsIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00ffc4" fill="none">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.09-1.979a2.25 2.25 0 01-.659-1.591V6.25m0 0l.252-.206a3 3 0 013.651-.091l.841.56a3 3 0 010 4.971l-.84.56m-2.914-5.79a3 3 0 00-4.397 0M5 14.5l2.09 1.979a2.25 2.25 0 001.59.659h6.32a2.25 2.25 0 001.59-.659L19 14.5" />
  </svg>
);

const Features: FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate header on scroll using ref
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

      // Stagger animation for feature cards using refs
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
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                buttonText={feature.buttonText}
                onClick={feature.onClick}
                disabled={feature.disabled}
                comingSoon={feature.comingSoon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Features };
