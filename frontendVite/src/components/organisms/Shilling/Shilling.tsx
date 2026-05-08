import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FC, useRef, useLayoutEffect } from 'react';

import { SectionGrid } from '@/components/atoms/SectionGrid/SectionGrid';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useTypewriter } from '@/hooks/useTypewriter';

import styles from './Shilling.module.scss';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'Actor Model',
    text: 'Asynchronous messaging enables parallel execution and stronger security through isolated contract state.',
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
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Delayed Messaging',
    text: 'Schedule autonomous on-chain actions without centralized inputs. Build self-sustaining applications.',
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Gasless Transactions',
    text: 'Execute transactions without gas fees or signatures, reducing costs and expanding dApp design possibilities.',
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Persistent Memory',
    text: 'Data always available and secure. Programs access only their own memory space, enhancing reliability.',
    number: '04',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.iconSvg}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Async Processing',
    text: 'Parallel task execution dramatically boosts performance beyond legacy smart contract platforms.',
    number: '05',
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
    title: 'Interoperability',
    text: 'Integrate with other chains in a decentralized way to leverage more DeFi legos for feature-rich dApps.',
    number: '06',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.iconSvg}>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
        <path d="M12 7v8M7 12h3l4 4M14 9l3 3" />
      </svg>
    ),
  },
  {
    title: 'Zero-Knowledge Proofs',
    text: 'Elevate privacy and security for your applications with built-in ZKP support, ensuring user trust.',
    number: '07',
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
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
];

const Shilling: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const cardsStripRef = useRef<HTMLDivElement>(null);
  const magneticCtaRef = useMagnetic(0.25);
  const { displayed: typedWord } = useTypewriter({
    words: ['DeFi', 'Web3'],
    typeSpeed: 140,
    deleteSpeed: 90,
    pauseDuration: 2200,
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      if (!rightRef.current || !cardsStripRef.current) return;

      const ctx = gsap.context(() => {
        if (leftRef.current) {
          gsap.fromTo(
            leftRef.current.children,
            { opacity: 0, y: 30 },
            {
              scrollTrigger: {
                trigger: leftRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out',
            },
          );
        }

        const rightHeight = rightRef.current!.offsetHeight;
        const stripHeight = cardsStripRef.current!.offsetHeight;
        const DWELL = window.innerHeight * 0.5;

        gsap.set(cardsStripRef.current, { y: rightHeight });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${rightHeight + stripHeight + DWELL}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl.to(cardsStripRef.current, {
          y: -stripHeight,
          ease: 'none',
          duration: rightHeight + stripHeight,
        });

        tl.to({}, { duration: DWELL });
      }, containerRef);

      return () => ctx.revert();
    });

    mm.add('(max-width: 900px)', () => {
      const ctx = gsap.context(() => {
        if (cardsStripRef.current) {
          gsap.set(cardsStripRef.current, { y: 0, clearProps: 'transform' });
        }

        if (leftRef.current) {
          gsap.fromTo(
            leftRef.current.children,
            { opacity: 0, y: 20 },
            {
              scrollTrigger: {
                trigger: leftRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
            },
          );
        }
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.shilling}>
      <SectionGrid variant="shilling" />
      <div className={styles.container}>
        <div ref={leftRef} className={styles.left}>
          <span className={styles.overline}>Infrastructure</span>
          <h2 className={styles.headline}>
            Built on the <span className={styles.headlineAccent}>fastest chain</span> for{' '}
            <span className={styles.typewriter}>
              {typedWord}
              <span className={styles.cursor} />
            </span>
          </h2>
          <a
            ref={magneticCtaRef as React.RefObject<HTMLAnchorElement>}
            href="https://vara-network.io/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}>
            Explore Vara
          </a>
        </div>

        <div ref={rightRef} className={styles.right}>
          <div ref={cardsStripRef} className={styles.cardsStrip}>
            {features.map((feature, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrap}>{feature.icon}</div>
                  <span className={styles.cardNumber}>{feature.number}</span>
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Shilling };
