import { FC, useRef, ReactNode } from 'react';

import styles from './SpotlightCard.module.scss';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  tilt?: boolean;
}

const SpotlightCard: FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  tilt = false,
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);

    if (tilt) {
      const rotateX = ((y / rect.height) - 0.5) * -14;
      const rotateY = ((x / rect.width) - 0.5) * 14;
      divRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
      divRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    }
  };

  const handleMouseLeave = () => {
    if (!divRef.current || !tilt) return;
    divRef.current.style.setProperty('--rotate-x', '0deg');
    divRef.current.style.setProperty('--rotate-y', '0deg');
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${styles.cardSpotlight} ${tilt ? styles.tiltEnabled : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export { SpotlightCard };
