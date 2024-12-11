import BasicInput from "components/molecules/Basic-Input/BasicInput";
import TokenSelectorBorrow from "components/atoms/Token-Selector-Borrow/TokenSelectorBorrow";
import styles from "./Card.module.scss";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFillBorrow from "components/atoms/Button-Gradient-Fill/ButtonGradFill";
import { useEffect, useState } from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import {
  FullState,
  FullStateVST,
  getBalanceVUSD, 
} from "smart-contracts-tools";

type props = {
  buttonLabel: string;
};

function FundsCardBorrow({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [fullState, setFullState] = useState<FullStateVST | FullState>();
  const { api } = useApi();
  const { account } = useAccount();
  const isDepositCard = () => {
    return buttonLabel === "Deposit";
  };
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (account) {
      // getBalanceVUSD(api, account.address, setBalance, setFullState);
      // getStakingInfo(
      //   api,
      //   account.decodedAddress,
      //   setDepositedBalance,
      //   setFullState
      // );

      // console.log(account.decodedAddress);
    }
  }, [account, api]);
  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelectorBorrow />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? balance : depositedBalance}
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? balance : depositedBalance}
        />
        <ButtonGradFillBorrow
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? balance : depositedBalance}
        />
      </div>
    </div>
  );
}

export { FundsCardBorrow };
