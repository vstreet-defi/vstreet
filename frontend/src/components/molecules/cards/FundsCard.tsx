import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";
import { useEffect, useState } from "react";
import { useUserInfo } from "contexts/userInfoContext";
import { useWallet } from "contexts/accountContext";
import { getVFTBalance } from "smart-contracts-tools";
import { hexToBn } from "@polkadot/util";
import { formatWithCommasVUSD } from "utils";
type props = {
  buttonLabel: string;
};

function FundsCard({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState("");
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const { userInfo, fetchUserInfo, balance } = useUserInfo();

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
      fetchUserInfo(hexAddress);

      const balanceConverted = convertHexToDecimal(balance.toString());
      setBalanceVFT(Number(balanceConverted));
    }
  }, [selectedAccount, hexAddress, balance]);

  useEffect(() => {
    if (userInfo) {
      const formatedBalance = userInfo.balance ? userInfo.balance / 1000000 : 0;
      setDepositedBalance(formatedBalance);
    }
  }, [userInfo]);

  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelector />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? balanceVFT : depositedBalance}
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? balanceVFT : depositedBalance}
        />
        <ButtonGradFill
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? balanceVFT : depositedBalance}
        />
      </div>
    </div>
  );
}

export { FundsCard };
