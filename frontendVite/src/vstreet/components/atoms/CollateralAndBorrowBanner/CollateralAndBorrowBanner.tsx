import React from "react";
import styles from "./CollateralAndBorrowBanner.module.scss";
import CornerAccent from "../CornerAccent/CornerAccent";

interface Props {
  text?: string;
}

const CollateralAndBorrowBanner: React.FC<Props> = ({ text = "UNLOCK YOUR LIQUIDITY POTENTIAL" }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <p className={styles.neonText}>
          {text}
        </p>
      </div>
    </div>
  );
};

export default CollateralAndBorrowBanner;
