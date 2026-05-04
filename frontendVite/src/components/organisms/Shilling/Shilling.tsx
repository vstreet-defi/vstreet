import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { TiltWrapper } from '@/components/molecules/TiltWrapper/TiltWrapper';
import VaraLogo from '@/assets/images/vara-logo-teal.png';

import styles from './Shilling.module.scss';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'High-Speed Transactions',
    text: 'Vara Network enhances DeFi with high transaction throughput and scalability. Its Gear Protocol\'s Actor model ensures rapid transactions at lower fees.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Enhanced Security',
    text: 'Security and decentralization are key in Vara Network. The Actor model supports secure, independent operation of smart contracts.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Innovative Technology',
    text: 'Vara Network\'s use of Persistent Memory and the WASM Virtual Machine optimizes performance for advanced financial services.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
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
];

const Shilling: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const iconsRef = useRef<(SVGSVGElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax: logo moves slower
      if (leftColRef.current) {
        gsap.to(leftColRef.current, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      }

      // Logo entrance
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.9 },
          {
            scrollTrigger: {
              trigger: logoRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
          }
        );


      }

      // Cards stagger entrance
      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { opacity: 0, x: 40 },
          {
            scrollTrigger: {
              trigger: validCards[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
          }
        );
      }

      // SVG icon draw-in animation
      iconsRef.current.forEach((svg) => {
        if (!svg) return;
        const paths = svg.querySelectorAll('path, polygon, rect, line');
        paths.forEach((path) => {
          const el = path as SVGGeometryElement;
          const length = el.getTotalLength ? el.getTotalLength() : 100;
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
          gsap.to(el, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: svg,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });
        });
      });

      // CTA entrance
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          {
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.shilling}>
      {/* Ambient glow */}
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        {/* Left Column: Logo + CTA */}
        <div ref={leftColRef} className={styles.leftColumn}>
          <div ref={logoRef} className={styles.logoWrapper}>
            <img className={styles.logo} src={VaraLogo} alt="Vara Network" />
          </div>
          <p className={styles.tagline}>Powered by</p>

          <a
            ref={ctaRef}
            href="https://vara-network.io/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
          >
            <span>Explore Vara</span>
          </a>
        </div>

        {/* Right Column: Data Cards */}
        <div className={styles.rightColumn}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={styles.dataCard}
            >
              <TiltWrapper max={5} scale={1.01}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <div className={styles.cardIcon}>
                    <div
                      ref={(el) => {
                        if (el) {
                          iconsRef.current[index] = el.querySelector('svg');
                        }
                      }}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                    <p className={styles.cardText}>{feature.text}</p>
                  </div>
                </div>
              </TiltWrapper>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Shilling };
