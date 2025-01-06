import BasicInput from "components/molecules/Basic-Input/BasicInput";
import TokenSelectorBorrow from "components/atoms/Token-Selector-Borrow/TokenSelectorBorrow";
import styles from "./Card.module.scss";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFillBorrow from "components/atoms/Button-Gradient-Fill/ButtonGradFillBorrow";
import { useEffect, useState } from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { FullState, FullStateVST } from "smart-contracts-tools";
import { useWallet } from "contexts/accountContext";
import { getUserInfo } from "smart-contracts-tools";
import { UserInfo } from "smart-contracts-tools";
import { formatWithDecimalsVARA } from "utils";

type props = {
  buttonLabel: string;
};

function FundsCardBorrow({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState("");
  const [balanceVara, setBalanceVara] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [fullState, setFullState] = useState<FullStateVST | FullState>();
  const { selectedAccount, hexAddress, balance } = useWallet();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const { api } = useApi();
  const { account } = useAccount();
  const isDepositCard = () => {
    return buttonLabel === "Deposit";
  };
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (selectedAccount) {
      setBalanceVara(Number(balance));
      getUserInfo(hexAddress, setUserInfo);
    }
  }, [selectedAccount, balance, hexAddress]);

  useEffect(() => {
    if (userInfo) {
      setDepositedBalance(userInfo.available_to_withdraw_vara);
    }
  }, [selectedAccount, hexAddress, userInfo]);
  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelectorBorrow />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={
            isDepositCard()
              ? formatWithDecimalsVARA(balanceVara)
              : formatWithDecimalsVARA(depositedBalance)
          }
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={
            isDepositCard()
              ? formatWithDecimalsVARA(balanceVara)
              : formatWithDecimalsVARA(depositedBalance)
          }
        />
        <ButtonGradFillBorrow
          amount={inputValue}
          label={buttonLabel}
          balance={
            isDepositCard()
              ? formatWithDecimalsVARA(balanceVara)
              : formatWithDecimalsVARA(depositedBalance)
          }
        />
      </div>
    </div>
  );
}

export { FundsCardBorrow };
