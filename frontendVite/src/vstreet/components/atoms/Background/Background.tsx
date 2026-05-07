import React from 'react';
import styles from './Background.module.scss';

const Background: React.FC = () => {
<<<<<<< HEAD
    return (
        <div className={styles.backgroundContainer}>
            <div className={styles.nebula1}></div>
            <div className={styles.nebula2}></div>
            <div className={styles.grid}></div>
        </div>
    );
=======
  return (
    <div className={`${styles.backgroundContainer} ${styles.fixed}`}>
      <div className={styles.nebula1}></div>
      <div className={styles.nebula2}></div>
      <div className={styles.grid}></div>
    </div>
  );
>>>>>>> VST-182-FE-MIGRATION-VITE
};

export default Background;
