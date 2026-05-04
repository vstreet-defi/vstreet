import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { GridBackground } from '@/components/atoms/GridBackground/GridBackground';
import { useMagnetic } from '@/hooks/useMagnetic';
import styles from './Hero.module.scss';

gsap.registerPlugin(ScrollTrigger);

function Hero() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const blobCyanRef = useRef<HTMLDivElement>(null);
  const blobGreenRef = useRef<HTMLDivElement>(null);
  const blobMixRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Entrance timeline
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        paused: prefersReducedMotion,
      });

      if (prefersReducedMotion) {
        // Instant reveal for reduced motion
        gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], { opacity: 1, y: 0, scale: 1 });
      } else {
        if (titleRef.current) {
          tl.from(titleRef.current, {
            opacity: 0,
            y: 40,
            duration: 0.9,
          });
        }

        if (subtitleRef.current) {
          const words = subtitleRef.current.querySelectorAll('.word');
          if (words.length > 0) {
            tl.from(
              words,
              {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.06,
              },
              '-=0.5'
            );
          } else {
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
        }

        if (buttonsRef.current) {
          tl.from(
            buttonsRef.current,
            {
              opacity: 0,
              scale: 0.9,
              duration: 0.7,
            },
            '-=0.3'
          );
        }
      }

      // Blob parallax on scroll
      if (!prefersReducedMotion) {
        const blobs = [
          { ref: blobCyanRef.current, speed: 80 },
          { ref: blobGreenRef.current, speed: -60 },
          { ref: blobMixRef.current, speed: 40 },
        ];

        blobs.forEach(({ ref, speed }) => {
          if (!ref) return;
          gsap.to(ref, {
            y: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const magneticRef = useMagnetic(0.25);
  const subtitleWords = 'The DeFi Core on Vara Network'.split(' ');

  return (
    <section ref={containerRef} className={styles.hero}>
      <GridBackground />
      <div className={styles.blobs}>
        <div ref={blobCyanRef} className={`${styles.blob} ${styles.blobCyan}`} />
        <div ref={blobGreenRef} className={`${styles.blob} ${styles.blobGreen}`} />
        <div ref={blobMixRef} className={`${styles.blob} ${styles.blobMix}`} />
      </div>
      <div className={styles.noiseLayer} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <h1 ref={titleRef} className={styles.title}>vStreet</h1>
        <h2 ref={subtitleRef} className={styles.subtitle}>
          {subtitleWords.map((word, i) => (
            <span key={i} className="word" style={{ display: 'inline-block', marginRight: '0.3em' }}>
              {word}
            </span>
          ))}
        </h2>

        <div ref={buttonsRef} className={styles.buttons}>
          <button
            ref={magneticRef as React.RefObject<HTMLButtonElement>}
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
