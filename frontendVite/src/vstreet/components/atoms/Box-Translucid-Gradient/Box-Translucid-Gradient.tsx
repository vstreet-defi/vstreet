import React from "react";
import styles from "./BoxTranslucidGradient.module.scss";

interface Props {
  children?: React.ReactNode;
<<<<<<< HEAD
}

function BoxTranslucidGradient({ children }: Props) {
  return (
    <div className={styles.container}>
=======
  className?: string;
}

function BoxTranslucidGradient({ children, className }: Props) {
  return (
    <div className={`${styles.container} ${className || ""}`}>
>>>>>>> VST-182-FE-MIGRATION-VITE
      {children}
    </div>
  );
}

export { BoxTranslucidGradient };
