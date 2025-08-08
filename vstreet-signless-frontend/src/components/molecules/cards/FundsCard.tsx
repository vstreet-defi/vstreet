import BasicInput from '../../molecules/Basic-Input/BasicInput';
import styles from './Card.module.scss';
import TokenSelector from '../../atoms/Token-Selector/TokenSelector';
import PercentageSelector from '../Percentage-Selector/PercentageSelector';
import ButtonGradFill from '../../atoms/Button-Gradient-Fill/ButtonGradFill';
import ButtonGradFillSignless from '@/components/signless/ButtonGradFillSignless';
import { useEffect, useState } from 'react';
import { useUserInfo } from '../../../contexts/userInfoContext';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { hexToBn } from '@polkadot/util';
import { formatWithCommasVUSD } from '../../../utils';
import { getVFTBalance } from '@/smart-contracts-tools';
import { decodeAddress } from '@gear-js/api';

type props = {
  buttonLabel: string;
};

function FundsCard({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState('');
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);

  const { account } = useAccount();
  const { api } = useApi();
  const { userInfo, fetchUserInfo } = useUserInfo();

  const isDepositCard = () => buttonLabel === 'Deposit';

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleClearInput = () => setInputValue('');

  const convertHexToDecimal = (hexValue: string) => {
    return hexToBn(hexValue).toString();
  };

  useEffect(() => {
    if (account?.address && api) {
      fetchUserInfo(account.address);
      getVFTBalance(setBalanceVFT, decodeAddress(account.address), api);
    }
  }, [account?.address, api]);

  useEffect(() => {
    if (userInfo) {
      const formatedBalance = userInfo.balance ? userInfo.balance : 0;

      const balanceFormatted = Number(formatedBalance / 12);
      console.log('balance', balanceFormatted, 'Infobalance', userInfo.balance);
      setDepositedBalance(balanceFormatted);
    }
  }, [userInfo]);

  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelector />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? Number(balanceVFT.toFixed(2)) : depositedBalance}
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? Number(balanceVFT.toFixed(2)) : depositedBalance}
        />
        <ButtonGradFillSignless
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? Number(balanceVFT.toFixed(2)) : depositedBalance}
          onSuccessCallback={handleClearInput}
        />
      </div>
    </div>
  );
}

export { FundsCard };
