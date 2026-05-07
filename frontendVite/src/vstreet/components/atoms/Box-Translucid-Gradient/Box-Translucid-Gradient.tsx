import React from "react";
import styles from "./BoxTranslucidGradient.module.scss";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

function BoxTranslucidGradient({ children, className }: Props) {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      {children}
    </div>
  );
}

export { BoxTranslucidGradient };
