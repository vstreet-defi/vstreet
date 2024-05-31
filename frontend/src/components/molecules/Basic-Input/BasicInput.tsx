import { useState } from "react";

function BasicInput() {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setInputValue(value);
    }
  };
  return (
    <div
      style={{
        marginTop: "1.5rem",
      }}
    >
      <div className="BI-label--container">
        <p className="BI-label">Amount</p>
        <div style={{ display: "flex" }}>
          <p className="BI-label tag">Your Wallet Balance:</p>
          <p className="BI-label number">254651600</p>
        </div>
      </div>

      <input
        className="BasicInput"
        type="number"
        step="0.01"
        value={inputValue}
        onChange={handleInputChange}
        style={{
          backgroundColor: "transparent",
          padding: "10px",
          border: "1px solid #00ffc4",
          fontSize: "16px",
          width: "100%",
          outline: "none",
        }}
      />
    </div>
  );
}

export default BasicInput;
