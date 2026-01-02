import BasicInput from "components/molecules/Basic-Input/BasicInput";
import TokenSelectorBorrow from "components/atoms/Token-Selector-Borrow/TokenSelectorBorrow";
import TokenSelectorBorrowUnder from "components/atoms/Token-Selector-Borrow/TokenSelectorBorrowUnder";
import styles from "./Card.module.scss";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFillBorrow from "components/atoms/Button-Gradient-Fill/ButtonGradFillBorrow";
import { useEffect, useState } from "react";
import { useWallet } from "contexts/accountContext";
import { useUserInfo } from "contexts/userInfoContext";
import { formatWithDecimalsVARA, formatWithCommasVUSD } from "utils";
import { hexToBn } from "@polkadot/util";

interface Props {
  buttonLabel: string;
  mode: string;
}

function FundsCardBorrow({ buttonLabel, mode }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [balanceVara, setBalanceVara] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [mla, setMla] = useState<number>(0);

  const { selectedAccount, hexAddress, balance, fetchBalance } = useWallet();
  const { userInfo, fetchUserInfo } = useUserInfo();

  const isCollateralMode = mode === "Collateral";
  const isDeposit = buttonLabel === "Deposit";
  const isBorrow = buttonLabel === "Borrow";
  const isPay = buttonLabel === "Pay";

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const convertHexToDecimal = (hexValue: string) => {
    return hexToBn(hexValue).toString();
  };

  useEffect(() => {
    if (selectedAccount) {
      fetchBalance();
      fetchUserInfo(hexAddress);

      const balanceConverted = convertHexToDecimal(balance.toString());
      setBalanceVara(Number(balanceConverted));
    }
  }, [selectedAccount, balance, hexAddress]);

  useEffect(() => {
    if (userInfo) {
      setDepositedBalance(userInfo.available_to_withdraw_vara || 0);
      setLoanAmount(userInfo.loan_amount || 0);
      setMla(userInfo.mla || 0);
    }
  }, [userInfo]);

  const getActiveBalance = () => {
    if (isCollateralMode) {
      return isDeposit ? balanceVara / 1e12 : depositedBalance / 1e12;
    } else {
      return isBorrow ? mla / 1e6 : loanAmount / 1e6;
    }
  };

  const getFormattedBalance = () => {
    const bal = getActiveBalance();
    return isCollateralMode ? formatWithDecimalsVARA(bal * 1e12) : formatWithCommasVUSD(bal);
  };

  const getSymbol = () => (isCollateralMode ? "TVARA" : "vUSD");

  return (
    <div className={styles.fundsCard}>
      <div className={styles.inputSection}>
        <div className={styles.availableBalance}>
          {isBorrow ? "Available to Borrow" : isPay ? "Current Debt" : "Available"}: <span>{getFormattedBalance()} {getSymbol()}</span>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputLabel}>Token</div>
            {isCollateralMode ? <TokenSelectorBorrow /> : <TokenSelectorBorrowUnder />}
          </div>

          <div className={styles.inputWrapper}>
            <div className={styles.inputLabel}>Amount</div>
            <BasicInput
              inputValue={inputValue}
              onInputChange={handleInputChange}
              balance={getActiveBalance()}
            />
          </div>
        </div>

        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={getActiveBalance()}
        />
      </div>

      <ButtonGradFillBorrow
        amount={inputValue}
        label={buttonLabel}
        balance={getActiveBalance()}
      />
    </div>
  );
}

export { FundsCardBorrow };
