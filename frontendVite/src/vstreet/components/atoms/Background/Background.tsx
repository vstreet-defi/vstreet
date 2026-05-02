import React from 'react';
import styles from './Background.module.scss';

const Background: React.FC = () => {
    return (
        <div className={styles.backgroundContainer}>
            <div className={styles.nebula1}></div>
            <div className={styles.nebula2}></div>
            <div className={styles.grid}></div>
        </div>
    );
};

export default Background;
