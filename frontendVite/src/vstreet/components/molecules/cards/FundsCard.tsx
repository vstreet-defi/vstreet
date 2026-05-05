import BasicInput from 'components/molecules/Basic-Input/BasicInput';
import styles from './Card.module.scss';
import TokenSelector from 'components/atoms/Token-Selector/TokenSelector';
import PercentageSelector from '../Percentage-Selector/PercentageSelector';
import ButtonGradFill from 'components/atoms/Button-Gradient-Fill/ButtonGradFill';
import 'components/atoms/Token-Selector/TokenSelector.scss';
import 'components/molecules/Basic-Input/BasicInput.scss';
import 'components/molecules/Percentage-Selector/PercentageSelector.scss';
import 'components/atoms/Button-Gradient-Fill/ButtonGradFill.scss';
import { useEffect, useState } from 'react';
import { useUserInfo } from 'contexts/userInfoContext';
import { useWallet } from 'contexts/accountContext';
import { formatHumanVUSD, formatWithCommasVUSD, fromRawUnits } from 'utils/index';

interface Props {
  buttonLabel: string;
}

function FundsCard({ buttonLabel }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [convertedBalanceVUSD, setConvertedBalanceVUSD] = useState<number>(0);
  const { userInfo, fetchUserInfo, balance } = useUserInfo();
  const [formatBalanceVUSD, setFormatBalanceVUSD] = useState('');
  const [formatDepositedVUSD, setFormatDepositedVUSD] = useState('');

  const { selectedAccount, hexAddress } = useWallet();

  const isDepositCard = () => buttonLabel === 'Deposit';

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (selectedAccount) {
      fetchUserInfo(hexAddress);
      setBalanceVFT(fromRawUnits(balance));
    }
  }, [selectedAccount, hexAddress, balance, fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      const vUSDDepositedBalance = userInfo.balance_usdc ? userInfo.balance_usdc : 0;
      setDepositedBalance(vUSDDepositedBalance);
      setConvertedBalanceVUSD(fromRawUnits(balance));
      setFormatBalanceVUSD(formatWithCommasVUSD(balance));
      setFormatDepositedVUSD(formatHumanVUSD(vUSDDepositedBalance));
    }
  }, [userInfo, balance]);

  console.log('VUSD Balance:', balanceVFT);
  console.log('userINFO:', userInfo);
  console.log('formatBalancevUSD:', formatBalanceVUSD);

  return (
    <div className={styles.fundsCard}>
      <div className={styles.inputSection}>
        <div className={styles.availableBalance}>
          Available: <span>{isDepositCard() ? formatBalanceVUSD : depositedBalance} wUSDT</span>
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
