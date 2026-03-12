import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";
import { useEffect, useState } from "react";
import { useUserInfo } from "contexts/userInfoContext";
import { useWallet } from "contexts/accountContext";
import { hexToBn } from "@polkadot/util";
import { formatWithCommasVUSD } from "utils";

interface Props {
  buttonLabel: string;
}

function FundsCard({ buttonLabel }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [convertedBalanceVUSD, setConvertedBalanceVUSD] = useState<number>(0);
  const { userInfo, fetchUserInfo, balance } = useUserInfo();
  const [formatBalanceVUSD, setFormatBalanceVUSD] = useState("");
  const [formatDepositedVUSD, setFormatDepositedVUSD] = useState("");

  const { selectedAccount, hexAddress } = useWallet();

  const isDepositCard = () => buttonLabel === "Deposit";

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
      setBalanceVFT(Number(balanceConverted) / 1000000);
    }
  }, [selectedAccount, hexAddress, balance]);

  useEffect(() => {
    if (userInfo) {
      const vUSDWalletBalance = userInfo.balance ? userInfo.balance : 0;
      const vUSDDepositedBalance = userInfo.balance_usdc
        ? userInfo.balance_usdc
        : 0;
      setDepositedBalance(vUSDDepositedBalance / 1000000);
      setConvertedBalanceVUSD(balance / 1000000);
      setFormatBalanceVUSD(formatWithCommasVUSD(balance));
      setFormatDepositedVUSD(vUSDDepositedBalance.toLocaleString());
    }
  }, [userInfo]);

  console.log("VUSD Balance:", balanceVFT);
  console.log("userINFO:", userInfo);
  console.log("formatBalancevUSD:", formatBalanceVUSD);

  return (
    <div className={styles.fundsCard}>
      <div className={styles.inputSection}>
        <div className={styles.availableBalance}>
          Available:{" "}
          <span>
            {isDepositCard() ? formatBalanceVUSD : depositedBalance} wUSDT
          </span>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputLabel}>Token</div>
            <TokenSelector />
          </div>

          <div className={styles.inputWrapper}>
            <div className={styles.inputLabel}>Amount</div>
            <BasicInput
              inputValue={inputValue}
              onInputChange={handleInputChange}
              balance={isDepositCard() ? formatBalanceVUSD : depositedBalance}
            />
          </div>
        </div>

        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? convertedBalanceVUSD : depositedBalance}
        />
      </div>

      <ButtonGradFill
        amount={inputValue}
        label={buttonLabel}
        balance={isDepositCard() ? convertedBalanceVUSD : depositedBalance}
      />
    </div>
  );
}

export { FundsCard };
