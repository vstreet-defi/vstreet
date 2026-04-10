import { FC } from 'react';

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
    <div className={`${styles.card} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.iconContainer}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <button
        className={styles.button}
        onClick={onClick}
        disabled={disabled}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default FeatureCard;