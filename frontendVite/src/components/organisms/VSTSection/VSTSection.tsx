import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FC, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SectionGrid } from '@/components/atoms/SectionGrid/SectionGrid';
import { useMagnetic } from '@/hooks/useMagnetic';

import styles from './VSTSection.module.scss';

gsap.registerPlugin(ScrollTrigger);

const tokenFeatures = [
  {
    title: 'Protocol Utility',
    description:
      'VST is the native currency of the vStreet ecosystem. Use it to pay fees, access premium features, and unlock advanced DeFi strategies.',
    number: '01',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.iconSvg}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Vault Staking',
    description:
      'Lock VST tokens in conviction vaults to earn protocol power (sVST). Longer lock periods multiply voting weight and rewards.',
    number: '02',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.iconSvg}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Governance Rights',
    description:
      'VST holders shape the future of the protocol. Propose and vote on key parameters, treasury allocations, and roadmap decisions.',
    number: '03',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.iconSvg}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

const VSTSection: FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const magneticCtaRef = useMagnetic(0.25);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const validCards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
        if (validCards.length < 2) return;

        const PEEK = 60;
        const X_OFFSETS = [-22, 0, 22];
        const SCROLL_PER_CARD = window.innerHeight * 0.85;
        const DWELL = window.innerHeight * 1.2;

        gsap.set(validCards[0], { y: 0, x: X_OFFSETS[0], rotation: 0, scale: 1, autoAlpha: 1, zIndex: 1 });
        validCards.slice(1).forEach((card, i) => {
          gsap.set(card, {
            y: window.innerHeight,
            x: X_OFFSETS[i + 1],
            rotation: 0,
            scale: 1,
            autoAlpha: 0,
            zIndex: i + 2,
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${(validCards.length - 1) * SCROLL_PER_CARD + DWELL}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        validCards.slice(1).forEach((card, i) => {
          tl.set(card, { autoAlpha: 1 }).to(card, { y: PEEK * (i + 1), ease: 'none', duration: 1 }, '<');
        });
        tl.to({}, { duration: DWELL / SCROLL_PER_CARD });
      }, containerRef);

      return () => ctx.revert();
    });

    mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
      const ctx = gsap.context(() => {
        const validCards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
        validCards.forEach((card, i) => {
          gsap.set(card, { y: 0, x: 0, scale: 1, autoAlpha: 1, zIndex: i + 1, clearProps: 'transform' });
          gsap.from(card, {
            opacity: 0,
            y: 40,
            immediateRender: false,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
          });
        });
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.vstSection}>
      <SectionGrid variant="vst" />

      <div className={styles.container}>
        {/* Left column: always-visible text content */}
        <div className={styles.header}>
          <span className={styles.label}>Native Token</span>
          <h2 className={styles.title}>$VST</h2>
          <p className={styles.subtitle}>The native token powering the vStreet DeFi protocol on Vara Network.</p>
          <button
            ref={magneticCtaRef as React.RefObject<HTMLButtonElement>}
            className={styles.ctaButton}
            onClick={() => navigate('/vst')}>
            Tokenomics
          </button>
        </div>

        {/* Right column: stacking cards animation */}
        <div className={styles.cardsCol}>
          <div className={styles.cardsStack}>
            <div className={styles.stackViewport}>
              {tokenFeatures.map((feature, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={styles.cardWrapper}>
                  <div className={styles.card}>
                    <span className={styles.cardNumber}>{feature.number}</span>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconWrapper}>{feature.icon}</div>
                      <h3 className={styles.cardTitle}>{feature.title}</h3>
                    </div>
                    <p className={styles.cardText}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { VSTSection };
export default VSTSection;
