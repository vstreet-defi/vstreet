import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import discordIcon from '@/assets/images/icons/discord-icon.png';
import githubIcon from '@/assets/images/icons/github-icon.png';
import xIcon from '@/assets/images/icons/x-social-media-white-icon.png';

import styles from './SocialMedia.module.scss';

gsap.registerPlugin(ScrollTrigger);

const socialMediaLinks = [
  {
    icon: xIcon,
    alt: 'X (Twitter)',
    url: 'https://twitter.com/vstreet_io',
  },
  {
    icon: discordIcon,
    alt: 'Discord',
    url: 'https://discord.gg/jBMqWd8kET',
  },
  {
    icon: githubIcon,
    alt: 'GitHub',
    url: 'https://github.com/vstreet-defi/vstreet',
  },
];

const SocialMedia: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
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

      const validIcons = iconsRef.current.filter(Boolean);
      if (validIcons.length > 0) {
        gsap.fromTo(
          validIcons,
          { opacity: 0, scale: 0.6, y: 20 },
          {
            scrollTrigger: {
              trigger: validIcons[0],
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'back.out(1.7)',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleIconHover = (index: number, isEnter: boolean) => {
    const icon = iconsRef.current[index];
    if (!icon) return;

    if (isEnter) {
      gsap.to(icon, {
        scale: 1.2,
        duration: 0.3,
        ease: 'elastic.out(1, 0.3)',
      });
    } else {
      gsap.to(icon, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <section ref={containerRef} className={styles.socialMedia} id="social">
      <div ref={sectionRef} className={styles.container}>
        <h3 className={styles.title}>Follow Us</h3>
        <p className={styles.description}>
          Engage with a community of sophisticated web3 investors and create smart DeFi strategies on top of the fastest blockchain.
        </p>
        
        <div className={styles.icons}>
          {socialMediaLinks.map((link, index) => (
            <a
              key={index}
              ref={(el) => { iconsRef.current[index] = el; }}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconLink}
              aria-label={link.alt}
              onMouseEnter={() => handleIconHover(index, true)}
              onMouseLeave={() => handleIconHover(index, false)}
            >
              <img src={link.icon} alt="" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;