import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "components/molecules/cards/Card.module.scss";
import TokenSelectorBorrowUnder from "components/atoms/Token-Selector-Borrow/TokenSelectorBorrowUnder";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";
import { useEffect, useState } from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { GearApi } from "@gear-js/api";
import {
  FullState,
  FullStateVST,
  getVFTBalance,
  getStakingInfo,
} from "smart-contracts-tools";

// Import useWallet from contexts
import { useWallet } from "contexts/accountContext";

// Sails-js Imports
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

type props = {
  buttonLabel: string;
};

function BorrowCard() {
  const [inputValue, setInputValue] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [fullState, setFullState] = useState<FullStateVST | FullState>();
  const { api } = useApi();
  const { account } = useAccount();
  const { selectedAccount, hexAddress } = useWallet();

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (selectedAccount && account) {
      getVFTBalance(api, hexAddress, setBalance);
      // getStakingInfo(
      //   api,
      //   account.decodedAddress,
      //   setDepositedBalance,
      //   setFullState
      // );
    }
  }, [selectedAccount, account, api]);

  return (
    <div className={styles.ContainerBorrow}>
      <div className={styles.BasicCardBorrow}>
        <TokenSelectorBorrowUnder />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={depositedBalance}
        />
        <div style={{ display: "flex", gap: "6rem", marginTop: "10px" }}>
          <ButtonGradientBorder text="Borrow" isDisabled={true} />
          <ButtonGradientBorder text="Re-Pay" isDisabled={true} />
        </div>
      </div>
    </div>
  );
}

export { BorrowCard };
