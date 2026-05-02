import React, { useState, useEffect } from "react";

type BasicInputProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  balance: number | string;
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

  return (
    <div>
      <input
        className="BasicInput"
        type="number"
        step="1"
        max={balance}
        value={value}
        onChange={handleInputChange}
        placeholder="0.00"
      />
    </div>
  );
}

export default BasicInput;
