import { FC, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import styles from './VSTSection.module.scss';

gsap.registerPlugin(ScrollTrigger);

const tokenFeatures = [
  {
    title: 'Protocol Utility',
    description: 'VST is the native currency of the vStreet ecosystem. Use it to pay fees, access premium features, and unlock advanced DeFi strategies.',
  },
  {
    title: 'Vault Staking',
    description: 'Lock your VST tokens in conviction vaults to earn protocol power (sVST). Longer lock periods multiply your voting weight and rewards.',
  },
  {
    title: 'Governance Rights',
    description: 'VST holders shape the future of the protocol. Propose and vote on key parameters, treasury allocations, and roadmap decisions.',
  },
];

const VSTSection: FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLButtonElement>(null);

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
          { opacity: 0, y: 50 },
          {
            scrollTrigger: {
              trigger: validCards[0],
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
              className={styles.card}
            >
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardText}>{feature.description}</p>
            </div>
          ))}
        </div>

        <button
          ref={ctaRef}
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
