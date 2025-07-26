import React, { useState } from 'react';
import BasicInput from '../../../components/molecules/Basic-Input/BasicInput';
import TokenSelectorBorrow from '../../../components/atoms/Token-Selector-Borrow/TokenSelectorBorrow';
import styles from './Card.module.scss';
import PercentageSelector from '../Percentage-Selector/PercentageSelector';
import ButtonGradFillBorrowSignless from '@/components/signless/ButtonGradFillBorrowSignless';
import { useAccount } from '@gear-js/react-hooks';
import { useNativeBalance } from '../../../hooks/useNativeBalance';
import { useUserInfo } from '../../../contexts/userInfoContext';

type Props = {
  buttonLabel: string;
};

function formatBalance(balance: number | string, decimals = 12, symbol = 'TVARA') {
  if (!balance) return `0 ${symbol}`;
  let bal = typeof balance === 'string' ? Number(balance) : balance;
  const value = bal / Math.pow(10, decimals);
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
}

function FundsCardBorrow({ buttonLabel }: Props) {
  const [inputValue, setInputValue] = useState('');

  const { account } = useAccount();
  const nativeBalance = useNativeBalance(account?.address);
  const { userInfo } = useUserInfo();

  const withdrawableBalance = userInfo.available_to_withdraw_vara ?? 0;

  const isDepositCard = () => buttonLabel === 'Deposit';
  const handleInputChange = (value: string) => setInputValue(value);

  const handleClearInput = () => setInputValue('');

  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelectorBorrow />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? (nativeBalance ? Number(nativeBalance) / 1e12 : 0) : withdrawableBalance / 1e12}
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? (nativeBalance ? Number(nativeBalance) / 1e12 : 0) : withdrawableBalance / 1e12}
        />

        <ButtonGradFillBorrowSignless
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? (nativeBalance ? Number(nativeBalance) / 1e12 : 0) : withdrawableBalance / 1e12}
          onSuccessCallback={handleClearInput}
        />
      </div>
    </div>
  );
}

export { FundsCardBorrow };
