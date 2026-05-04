import { FC, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SpotlightCard } from '@/components/reactbits';
import { TiltWrapper } from '@/components/molecules/TiltWrapper/TiltWrapper';
import { useMagnetic } from '@/hooks/useMagnetic';
import styles from './VSTSection.module.scss';

gsap.registerPlugin(ScrollTrigger);

const tokenFeatures = [
  {
    title: 'Protocol Utility',
    description: 'VST is the native currency of the vStreet ecosystem. Use it to pay fees, access premium features, and unlock advanced DeFi strategies.',
    number: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Vault Staking',
    description: 'Lock your VST tokens in conviction vaults to earn protocol power (sVST). Longer lock periods multiply your voting weight and rewards.',
    number: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Governance Rights',
    description: 'VST holders shape the future of the protocol. Propose and vote on key parameters, treasury allocations, and roadmap decisions.',
    number: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

const VSTSection: FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const magneticCtaRef = useMagnetic(0.25);

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

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { opacity: 0, y: 60, rotateY: -5 },
          {
            scrollTrigger: {
              trigger: validCards[0],
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
          }
        );

        // Parallax: each card moves at a different speed on scroll
        validCards.forEach((card, i) => {
          const speed = [20, -10, 15][i] || 0;
          gsap.to(card, {
            y: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        });
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.95 },
          {
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.vstSection}>
      <div className={styles.container}>
        <div ref={headerRef} className={styles.header}>
          <h2 className={styles.title}>$VST</h2>
          <p className={styles.subtitle}>
            The native token powering the vStreet DeFi protocol on Vara Network.
          </p>
        </div>

        <div className={styles.grid}>
          {tokenFeatures.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
            >
              <TiltWrapper max={6} scale={1.02}>
                <SpotlightCard
                  className={styles.card}
                  spotlightColor={index === 1 ? 'rgba(79, 255, 75, 0.12)' : 'rgba(0, 255, 196, 0.12)'}
                >
                  <div className={styles.cardInner}>
                    <span className={styles.cardNumber}>{feature.number}</span>
                    <div className={styles.cardTop}>
                      <div className={styles.iconWrapper}>{feature.icon}</div>
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{feature.title}</h3>
                      <p className={styles.cardText}>{feature.description}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </TiltWrapper>
            </div>
          ))}
        </div>

        <button
          ref={(el) => {
            ctaRef.current = el;
            (magneticCtaRef as React.MutableRefObject<HTMLElement | null>).current = el;
          }}
          className={styles.ctaButton}
          onClick={() => navigate('/vst')}
        >
          <span>Get VST</span>
        </button>
      </div>
    </section>
  );
};

export { VSTSection };
export default VSTSection;
