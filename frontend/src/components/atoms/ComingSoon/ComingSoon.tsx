import React from "react";
import styles from "../../templates/Dapp/Dapp.module.scss";

/**
 * ComingSoon Component
 * A minimalist placeholder component used for features that are
 * currently under development (e.g., the Vaults tab).
 */

type ComingSoonProps = {
  small?: boolean;
};

const ComingSoon: React.FC<ComingSoonProps> = ({ small }) => {
  if (small) {
    return (
      <span
        style={{
          fontSize: "0.7em",
          color: "#3FFFC8",
          fontWeight: 700,
          letterSpacing: "0.05em",
          marginLeft: 6,
          verticalAlign: "middle",
        }}
      >
        COMING SOON
      </span>
    );
  }
  return (
    <div className={styles.comingSoonContainer}>
      <h1 className={styles.comingSoonTitle}>COMING SOON</h1>
    </div>
  );
};

export default ComingSoon;
