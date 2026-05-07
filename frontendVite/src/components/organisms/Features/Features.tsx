import React, { FC, useRef, useEffect, useCallback, useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LendingIcon from '@/assets/images/icons/lend.svg?react';
import VaultsIcon from '@/assets/images/icons/vault.svg?react';
import BondsIcon from '@/assets/images/icons/bonds.svg?react';
import AgentsIcon from '@/assets/images/icons/agents.svg?react';
import { SectionGrid } from '@/components/atoms/SectionGrid/SectionGrid';
import styles from './Features.module.scss';

gsap.registerPlugin(ScrollTrigger);

/* ── 3D tilt hook ── */
function useCard3D(max = 6, scale = 1.02) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    transition: 'transform 0.45s ease-out',
  });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      setStyle({
        transform: `perspective(900px) rotateX(${((y - cy) / cy) * -max}deg) rotateY(${((x - cx) / cx) * max}deg) scale3d(${scale},${scale},${scale})`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [max, scale],
  );

  const onLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: 'transform 0.45s ease-out',
    });
  }, []);

  return { ref, style, onMove, onLeave };
}

/* ── Card3D wrapper ── */
const Card3D: FC<{
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}> = ({ children, className = '', innerRef }) => {
  const { ref, style, onMove, onLeave } = useCard3D(5, 1.015);

  return (
    <div
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (typeof innerRef === 'function') innerRef(el);
        else if (innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}>
      {children}
    </div>
  );
};

const Features: FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            clipPath: 'inset(0 0% 0 0)',
            duration: 1,
            ease: 'power3.inOut',
          },
        );
      }

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { opacity: 0, y: 60 },
          {
            scrollTrigger: {
              trigger: validCards[0],
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[index] = el;
  };

  return (
    <section ref={containerRef} className={styles.features}>
      <SectionGrid variant="features" />
      <div className={styles.container}>
        <div ref={headerRef} className={styles.header}>
          <h2 className={styles.title}>Our Features</h2>
          <p className={styles.subtitle}>
            Unlock the full potential of DeFi on Vara Network with our comprehensive suite of financial tools.
          </p>
        </div>

        <div className={styles.bento}>
          {/* Row 1, Col 1 — Lending (horizontal, active) */}
          <Card3D innerRef={setCardRef(0)} className={`${styles.card} ${styles.cardHorizontal}`}>
            <span className={styles.cardNumber}>01</span>
            <div className={styles.cardIcon}>
              <LendingIcon />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Lending</h3>
              <p className={styles.cardText}>
                Supply assets to earn yield or borrow against your collateral with competitive rates on Vara Network.
              </p>
              <button className={styles.cardCta} onClick={() => navigate('/dapp?tab=supply')}>
                Open Lending
                <span className={styles.cardCtaArrow}>→</span>
              </button>
            </div>
          </Card3D>

          {/* Row 1, Col 2 — Vaults (horizontal, active) */}
          <Card3D innerRef={setCardRef(1)} className={`${styles.card} ${styles.cardHorizontal}`}>
            <span className={styles.cardNumber}>02</span>
            <div className={styles.cardIcon}>
              <VaultsIcon />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Vaults</h3>
              <p className={styles.cardText}>
                Stake your LST tokens and earn additional yield through our optimized vault strategies.
              </p>
              <button className={styles.cardCta} onClick={() => navigate('/dapp?tab=vaults')}>
                Open Vaults
                <span className={styles.cardCtaArrow}>→</span>
              </button>
            </div>
          </Card3D>

          {/* Row 2, Col 1 — VST Bonds */}
          <Card3D innerRef={setCardRef(2)} className={`${styles.card} ${styles.cardHorizontal} ${styles.cardMuted}`}>
            <span className={`${styles.cardNumber} ${styles.cardNumberMuted}`}>03</span>
            <div className={`${styles.cardIcon} ${styles.cardIconMuted}`}>
              <BondsIcon />
            </div>
            <div className={styles.cardContent}>
              <h3 className={`${styles.cardTitle} ${styles.cardTitleMuted}`}>VST Bonds</h3>
              <p className={styles.cardText}>
                Mint VST stablecoins backed by your staked VARA. Low volatility, high utility for DeFi strategies.
              </p>
              <button className={styles.cardCta} disabled>
                Coming Soon
              </button>
            </div>
          </Card3D>

          {/* Row 2, Col 2 — AI Trading Agents */}
          <Card3D innerRef={setCardRef(3)} className={`${styles.card} ${styles.cardHorizontal} ${styles.cardMuted}`}>
            <span className={`${styles.cardNumber} ${styles.cardNumberMuted}`}>04</span>
            <div className={`${styles.cardIcon} ${styles.cardIconMuted}`}>
              <AgentsIcon />
            </div>
            <div className={styles.cardContent}>
              <h3 className={`${styles.cardTitle} ${styles.cardTitleMuted}`}>AI Trading Agents</h3>
              <p className={styles.cardText}>
                Automated trading strategies powered by AI. Optimize your portfolio with intelligent agents.
              </p>
              <button className={styles.cardCta} disabled>
                Coming Soon
              </button>
            </div>
          </Card3D>
        </div>
      </div>
    </section>
  );
};

export { Features };
