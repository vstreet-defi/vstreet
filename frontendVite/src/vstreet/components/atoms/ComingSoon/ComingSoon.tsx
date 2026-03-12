import React from "react";
import styles from "../../templates/Dapp/Dapp.module.scss";

/**
 * ComingSoon Component
 * A minimalist placeholder component used for features that are 
 * currently under development (e.g., the Vaults tab).
 */
const ComingSoon: React.FC = () => {
  return (
    <div className={styles.comingSoonContainer}>
      <h1 className={styles.comingSoonTitle}>COMING SOON</h1>
    </div>
  );
};

export default ComingSoon;
