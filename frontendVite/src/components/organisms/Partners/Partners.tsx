import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import varaLogo from '@/assets/images/Vara-Network-Logo.png';
import guardiansLogo from '@/assets/images/Guardianlogo-blanco.png';
import styles from './Partners.module.scss';

gsap.registerPlugin(ScrollTrigger);

const logos = [
  { src: varaLogo, alt: 'Vara Network' },
  { src: guardiansLogo, alt: 'Guardians' },
  { src: varaLogo, alt: 'Vara Network' },
  { src: guardiansLogo, alt: 'Guardians' },
  { src: varaLogo, alt: 'Vara Network' },
  { src: guardiansLogo, alt: 'Guardians' },
];

function Partners() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const renderLogos = () =>
    logos.map((logo, index) => (
      <img
        key={index}
        className={styles.logo}
        src={logo.src}
        alt={logo.alt}
      />
    ));

  return (
    <div ref={containerRef} className={styles.partners}>
      <div className={styles.track}>
        <div className={styles.group}>{renderLogos()}</div>
        <div className={styles.group}>{renderLogos()}</div>
      </div>
    </div>
  );
}

export { Partners };
