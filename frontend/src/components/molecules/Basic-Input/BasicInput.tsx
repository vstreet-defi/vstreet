import React, { useState, useEffect } from "react";

type BasicInputProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  balance: number;
};

function BasicInput({ inputValue, onInputChange, balance }: BasicInputProps) {
  const [value, setValue] = useState(inputValue);

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (/^\d*\.?\d{0,2}$/.test(newValue)) {
      setValue(newValue);
      onInputChange(newValue);
    }
  };

  const formatBalance = (balance: number): string => {
    return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div className="BI-label--container">
        <p className="BI-label">Amount</p>
        <div style={{ display: "flex" }}>
          <p className="BI-label tag">Your Balance:</p>
          <p className="BI-label number">{formatBalance(balance)}</p>
        </div>
      </div>

      <input
        className="BasicInput"
        type="number"
        step="1"
        max={balance}
        value={value}
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
