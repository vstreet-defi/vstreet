<<<<<<< HEAD
import vStreetLogoWhite from '@/assets/images/icons/vStreet-Logo-White-Big.png';
import './HomeFooter.scss';

function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="legal-disclaimer">
        <h5>LEGAL DISCLAIMER</h5>
        <p>
          The information provided on this website does not constitute investment advice, financial advice, trading
          advice, or any other sort of advice and you should not treat any of the website&apos;s content as such. The
          vStreet team provides the website as a service to the public, and is not responsible for, and expressly
          disclaims all liability for, damages of any kind arising out of use, reference to, or reliance on any
          information contained within this website. While the information contained within this website is periodically
          updated, no guarantee is given that the information provided in this website is correct, complete, and
          up-to-date. vStreet
        </p>
      </div>
      <div className="rights">
        <img src={vStreetLogoWhite} alt="vStreet" />
        <br />
        <p>2024 &copy; All rights reserved by vStreet</p>
        <br />
        <a href="mailto:contact@vstreet.io">contact@vstreet.io</a>
      </div>
    </footer>
  );
}
=======
import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import vStreetLogoWhite from '@/assets/images/icons/vStreet-Logo-White-Big.png';
import discordIcon from '@/assets/images/icons/discord-icon.png';
import githubIcon from '@/assets/images/icons/github-icon.png';
import xIcon from '@/assets/images/icons/x-social-media-white-icon.png';

import styles from './HomeFooter.module.scss';

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { icon: xIcon, alt: 'X', url: 'https://twitter.com/vstreet_io' },
  { icon: discordIcon, alt: 'Discord', url: 'https://discord.gg/jBMqWd8kET' },
  { icon: githubIcon, alt: 'GitHub', url: 'https://github.com/vstreet-defi/vstreet' },
];

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
              start: 'top 85%',
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
            delay: 0.15,
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

        <div ref={bottomRef} className={styles.bottom}>
          <img className={styles.logo} src={vStreetLogoWhite} alt="vStreet" />
          <p className={styles.copyright}>© {new Date().getFullYear()} vStreet. All rights reserved.</p>
          <div className={styles.socials}>
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={link.alt}
              >
                <img src={link.icon} alt="" />
              </a>
            ))}
          </div>
          <a href="mailto:contact@vstreet.io" className={styles.email}>
            contact@vstreet.io
          </a>
        </div>
      </div>
    </footer>
  );
};
>>>>>>> VST-182-FE-MIGRATION-VITE

export { HomeFooter };
