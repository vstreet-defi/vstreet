import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FC, useRef, useEffect } from 'react';

import github from '@/assets/images/socials/icon _github_.png';
import x from '@/assets/images/socials/icon _x_.png';
import ivan from '@/assets/images/team img/Ivan 1.png';
import robin from '@/assets/images/team img/Robin 1.png';
import rafa from '@/assets/images/team img/rafa 1.png';
import { SectionGrid } from '@/components/atoms/SectionGrid/SectionGrid';

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
          { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            clipPath: 'inset(0 0% 0 0)',
            duration: 1,
            ease: 'power3.inOut',
          }
        );
      }

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { opacity: 0, y: 60 },
          {
            scrollTrigger: {
              trigger: validCards[0],
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.team} id="team">
      <SectionGrid variant="team" />
      <div className={styles.container}>
        <div ref={headerRef} className={styles.header}>
          <h2 className={styles.title}>Team</h2>
          <p className={styles.subtitle}>
            Built by a focused team of engineers and designers passionate about DeFi.
          </p>
        </div>

        <div className={styles.grid}>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={styles.card}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const rx = (e.clientX - rect.left) / rect.width - 0.5;
                const ry = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transition = 'transform 0.1s ease, border-color 0.4s ease, box-shadow 0.4s ease';
                card.style.transform = `perspective(700px) rotateX(${ry * -10}deg) rotateY(${rx * 10}deg) translateY(-4px)`;
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                card.style.transition = 'transform 0.55s ease, border-color 0.4s ease, box-shadow 0.4s ease';
                card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)';
              }}
            >
              <div className={styles.cardTop}>
                <div className={styles.avatarWrap}>
                  <img src={member.avatar} alt={`${member.name} avatar`} loading="lazy" />
                </div>
              </div>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.title}</p>
              <div className={styles.socials}>
                {member.socials.map((social, i) => (
                  <a
                    key={i}
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
export default Team;
