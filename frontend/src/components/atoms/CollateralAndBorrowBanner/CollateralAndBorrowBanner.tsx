import React from "react";
import "./CollateralAndBorrowBanner.scss";

const CollateralAndBorrowBanner: React.FC = () => {
  return (
    <div className="BannerContainer">
      <div className="BannerLeft">
        Deposit Synthetic Tokens <br /> as{" "}
        <span className="HighlightCollateral">Collateral</span>
      </div>
      <div className="BannerCenter">and</div>
      <div className="BannerRight">
        <div className="Highlight">Borrow USDC</div>
      </div>
    </div>
  );
};

export default CollateralAndBorrowBanner;
