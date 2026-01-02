import React from "react";
import styles from "./BoxTranslucidGradient.module.scss";

interface Props {
  children?: React.ReactNode;
}

function BoxTranslucidGradient({ children }: Props) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}

export { BoxTranslucidGradient };
