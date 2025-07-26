import React, { useState, useEffect } from 'react';

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
    let newValue = event.target.value;

    if (/^\d*\.?\d*$/.test(newValue) || newValue === '') {
      setValue(newValue);
      onInputChange(newValue);
    }
  };

  const formatBalance = (bal: number): string => {

    if (!bal || isNaN(bal)) return '0.00';
    return Number(bal)
      .toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

 
  const safeValue = value && !isNaN(Number(value)) ? value : '';

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="BI-label--container">
        <p className="BI-label">Amount</p>
        <div style={{ display: 'flex' }}>
          <p className="BI-label tag">Your Balance:</p>
          <p className="BI-label number">{formatBalance(balance)}</p>
        </div>
      </div>

      <input
        className="BasicInput"
        type="number"
        step="any"
        min="0"
        max={balance || ''}
        value={safeValue}
        onChange={handleInputChange}
        style={{
          backgroundColor: 'transparent',
          padding: '10px',
          border: '1px solid #00ffc4',
          fontSize: '16px',
          width: '100%',
          outline: 'none',
        }}
       
        inputMode="decimal"
      />
    </div>
  );
}

export default BasicInput;
