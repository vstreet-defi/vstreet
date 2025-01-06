import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";
import { useEffect, useState } from "react";

import { getUserInfo, getVFTBalance } from "smart-contracts-tools";
import { useWallet } from "contexts/accountContext";
import { UserInfo } from "smart-contracts-tools";
import { hexToBn } from "@polkadot/util";

type props = {
  buttonLabel: string;
};

function FundsCard({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<UserInfo>();

  const { selectedAccount, hexAddress } = useWallet();

  const isDepositCard = () => {
    return buttonLabel === "Deposit";
  };
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const convertHexToDecimal = (hexValue: string) => {
    return hexToBn(hexValue).toString();
  };

  useEffect(() => {
    if (selectedAccount) {
      //call sails get balance
      getVFTBalance(hexAddress, (balance: number) => {
        const humanReadableBalance = convertHexToDecimal(balance.toString());
        setBalance(Number(humanReadableBalance));
      });
      getUserInfo(hexAddress, setUserInfo);
    }
  }, [selectedAccount, hexAddress]);

  useEffect(() => {
    if (userInfo) {
      setDepositedBalance(userInfo.balance_usdc ?? 0);
    }
  }, [userInfo]);

  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelector />
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
        <ButtonGradFill
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? balance : depositedBalance}
        />
      </div>
    </div>
  );
}

export { FundsCard };
