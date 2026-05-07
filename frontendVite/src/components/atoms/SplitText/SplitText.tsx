import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SplitText.module.scss';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  stagger = 0.04,
  duration = 0.7,
}: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(`.${styles.char}`);
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay, stagger, duration]);

  return (
    <span ref={containerRef} className={`${styles.splitText} ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={styles.char}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
