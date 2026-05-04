import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { GridBackground } from '@/components/atoms/GridBackground/GridBackground';
import styles from './Hero.module.scss';

function Hero() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (titleRef.current) {
        tl.from(titleRef.current, {
          opacity: 0,
          y: 40,
          duration: 0.9,
        });
      }

      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          '-=0.5'
        );
      }

      if (buttonsRef.current) {
        tl.from(
          buttonsRef.current,
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.7,
          },
          '-=0.4'
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.hero}>
      <GridBackground />
      <div className={styles.blobs}>
        <div className={`${styles.blob} ${styles.blobCyan}`} />
        <div className={`${styles.blob} ${styles.blobGreen}`} />
        <div className={`${styles.blob} ${styles.blobMix}`} />
      </div>
      <div className={styles.noiseLayer} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <h1 ref={titleRef} className={styles.title}>vStreet</h1>
        <h2 ref={subtitleRef} className={styles.subtitle}>The DeFi Core on Vara Network</h2>

        <div ref={buttonsRef} className={styles.buttons}>
          <button
            className={styles.buttonPrimary}
            onClick={() => navigate('/dapp')}
          >
            Launch dApp
          </button>
          <button
            className={styles.buttonSecondary}
            disabled
          >
            Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}

export { Hero };
