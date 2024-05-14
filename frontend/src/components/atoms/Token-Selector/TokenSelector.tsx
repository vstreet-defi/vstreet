import React, { useState } from "react";

function TokenSelector() {
  const [showMessage, setShowMessage] = useState(false);
  const handleClick = () => {
    setShowMessage((prevState) => !prevState);
  };
  return (
    <div onClick={handleClick} className="Token-Selector">
      <p className="TS-Label">Token</p>
      <select disabled>
        <option value="">USDC</option>
      </select>
      <span className="custom-arrow"></span>
      {showMessage && (
        <div className="custom-message">
          At the moment we only allow USDC Liquidity Deposits.
        </div>
      )}
    </div>
  );
}

export default TokenSelector;
