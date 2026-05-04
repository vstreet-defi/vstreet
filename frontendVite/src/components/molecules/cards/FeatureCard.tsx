import { FC } from 'react';

import { SpotlightCard } from '@/components/reactbits';

import styles from './FeatureCard.module.scss';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
  disabled = false,
  comingSoon = false,
}) => {
  return (
    <SpotlightCard
      className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${comingSoon ? styles.comingSoon : ''}`}
      spotlightColor={comingSoon ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 255, 196, 0.06)'}
      tilt={false}
    >
      <div className={styles.cardInner}>
        <div className={styles.accentBar} />
        <div className={styles.iconContainer}>{icon}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {comingSoon ? (
          <span className={styles.soonBadge}>{buttonText}</span>
        ) : (
          <button
            className={styles.button}
            onClick={onClick}
            disabled={disabled}
          >
            {buttonText}
          </button>
        )}
      </div>
    </SpotlightCard>
  );
};

export default FeatureCard;
