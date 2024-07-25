import React, { useState, useEffect } from "react";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { getBalance } from "smart-contracts-tools";

interface BasicInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
}

export interface FullState {
  balances: [string, any][];
}

function BasicInput({ inputValue, onInputChange }: BasicInputProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      onInputChange(value);
    }
  };

  const { api } = useApi();
  const { account } = useAccount();
  const alert = useAlert();

  const [balance, setBalance] = useState<any | undefined>(0);
  const [fullState, setFullState] = useState<FullState | undefined>(undefined);

  useEffect(() => {
    if (account) {
      getBalance(api, account.address, setBalance, setFullState, alert);
    }
  }, [account, api, alert]);

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div className="BI-label--container">
        <p className="BI-label">Amount</p>
        <div style={{ display: "flex" }}>
          <p className="BI-label tag">Your Wallet Balance:</p>
          <p className="BI-label number">{balance}</p>
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
