import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import VaraLogo from '@/assets/images/vara-logo-teal.png';

import styles from './Shilling.module.scss';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'High-Speed Transactions',
    text: 'Vara Network enhances DeFi with high transaction throughput and scalability. Its Gear Protocol\'s Actor model ensures rapid transactions at lower fees.',
  },
  {
    title: 'Enhanced Security',
    text: 'Security and decentralization are key in Vara Network. The Actor model supports secure, independent operation of smart contracts.',
  },
  {
    title: 'Innovative Technology',
    text: 'Vara Network\'s use of Persistent Memory and the WASM Virtual Machine optimizes performance for advanced financial services.',
  },
];

const Shilling: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: logoRef.current,
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

      const validItems = itemsRef.current.filter(Boolean);
      if (validItems.length > 0) {
        gsap.fromTo(
          validItems,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: gridRef.current,
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
              start: 'top 85%',
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
    <section ref={containerRef} className={styles.shilling}>
      <div className={styles.container}>
        <div ref={logoRef} className={styles.logoSection}>
          <img className={styles.logo} src={VaraLogo} alt="Vara Network" />
          <p className={styles.tagline}>Powered by Vara Network</p>
        </div>

        <div ref={gridRef} className={styles.grid}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { itemsRef.current[index] = el; }}
              className={styles.featureCard}
            >
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          ))}

          <div ref={ctaRef} className={styles.ctaCard}>
            <a
              href="https://vara-network.io/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaLink}
            >
              <span>Explore Vara Network</span>
              <svg className={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Shilling };
