import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import github from '@/assets/images/socials/icon _github_.png';
import x from '@/assets/images/socials/icon _x_.png';
import ivan from '@/assets/images/team img/Ivan 1.png';
import rafa from '@/assets/images/team img/rafa 1.png';
import robin from '@/assets/images/team img/Robin 1.png';

import styles from './Team.module.scss';

gsap.registerPlugin(ScrollTrigger);

const teamMembers = [
  {
    name: 'Rafa',
    role: 'Backend Lead',
    avatar: rafa,
    socials: [
      { icon: x, url: 'https://x.com/Rafael_Acuna', alt: 'X' },
      { icon: github, url: 'https://github.com/RafaelAcuna', alt: 'GitHub' },
    ],
  },
  {
    name: 'Robin',
    role: 'Frontend',
    avatar: robin,
    socials: [
      { icon: x, url: 'https://twitter.com/robinhodl69', alt: 'X' },
      { icon: github, url: 'https://github.com/robinhodl69', alt: 'GitHub' },
    ],
  },
  {
    name: 'Terratek',
    role: 'Full Stack',
    avatar: ivan,
    socials: [
      { icon: x, url: 'https://twitter.com/IvanTerratek', alt: 'X' },
      { icon: github, url: 'https://github.com/TerratekMusic', alt: 'GitHub' },
    ],
  },
];

const Team: FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate header
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: headerRef.current,
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

      // Stagger animation for team cards using refs
      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            scrollTrigger: {
              trigger: validCards[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.2,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.team} id="team">
      <div className={styles.container}>
        <div ref={headerRef} className={styles.header}>
          <h2 className={styles.title}>Our Team</h2>
        </div>
        
        <div className={styles.grid}>
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              ref={(el) => { cardsRef.current[index] = el; }}
              className={styles.card}
            >
              <div 
                className={styles.avatar} 
                style={{ backgroundImage: `url(${member.avatar})` }}
              />
              <h3 className={styles.name}>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              
              <div className={styles.socials}>
                {member.socials.map((social, socialIndex) => (
                  <a
                    key={socialIndex}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <img src={social.icon} alt={social.alt} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Team };