import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import vStreetLogoWhite from '@/assets/images/icons/vStreet-Logo-White-Big.png';

import styles from './HomeFooter.module.scss';

gsap.registerPlugin(ScrollTrigger);

const HomeFooter: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const legalRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (legalRef.current) {
        gsap.fromTo(
          legalRef.current,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: legalRef.current,
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

      if (bottomRef.current) {
        gsap.fromTo(
          bottomRef.current,
          { opacity: 0, y: 20 },
          {
            scrollTrigger: {
              trigger: bottomRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.2,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={containerRef} className={styles.footer}>
      <div className={styles.container}>
        <div ref={legalRef} className={styles.legal}>
          <h5 className={styles.legalTitle}>Legal Disclaimer</h5>
          <p className={styles.legalText}>
            The information provided on this website does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the website&apos;s content as such. The vStreet team provides the website as a service to the public, and is not responsible for, and expressly disclaims all liability for, damages of any kind arising out of use, reference to, or reliance on any information contained within this website. While the information contained within this website is periodically updated, no guarantee is given that the information provided in this website is correct, complete, and up-to-date.
          </p>
        </div>

        <p className={styles.rightsText}>© 2026 vStreet. All rights reserved.</p>

        <div ref={bottomRef} className={styles.bottom}>
          <img className={styles.logo} src={vStreetLogoWhite} alt="vStreet" />
          <p className={styles.copyright}>2024 © All rights reserved by vStreet</p>
          <a href="mailto:contact@vstreet.io" className={styles.email}>
            contact@vstreet.io
          </a>
        </div>
      </div>
    </footer>
  );
};

export { HomeFooter };
