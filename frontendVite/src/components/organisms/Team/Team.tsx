import { FC, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProfileCard } from '@/components/reactbits';
import { TiltWrapper } from '@/components/molecules/TiltWrapper/TiltWrapper';

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
    title: 'Backend Lead',
    avatar: rafa,
    socials: [
      { icon: x, url: 'https://x.com/Rafael_Acuna', alt: 'X' },
      { icon: github, url: 'https://github.com/RafaelAcuna', alt: 'GitHub' },
    ],
  },
  {
    name: 'Robin',
    title: 'Frontend',
    avatar: robin,
    socials: [
      { icon: x, url: 'https://twitter.com/robinhodl69', alt: 'X' },
      { icon: github, url: 'https://github.com/robinhodl69', alt: 'GitHub' },
    ],
  },
  {
    name: 'Terratek',
    title: 'Full Stack',
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
          <h2 className={styles.title}>Team</h2>
        </div>

        <div className={styles.grid}>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
            >
              <TiltWrapper max={8} scale={1.03}>
                <ProfileCard
                  avatarUrl={member.avatar}
                  name={member.name}
                  title={member.title}
                  socials={member.socials}
                />
              </TiltWrapper>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Team };
export default Team;
