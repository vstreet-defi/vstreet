import BasicInput from '../../molecules/Basic-Input/BasicInput';
import styles from './Card.module.scss';
import TokenSelector from '../../atoms/Token-Selector/TokenSelector';
import PercentageSelector from '../Percentage-Selector/PercentageSelector';
import ButtonGradFill from '../../atoms/Button-Gradient-Fill/ButtonGradFill';
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
      const formatedBalance = userInfo.balance ? userInfo.balance / 1e15 : 0;
      const balanceFormatted = Number(formatedBalance / 1e18);
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
          balance={isDepositCard() ? Number((balanceVFT / 1e18).toFixed(2)) : depositedBalance}
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? Number((balanceVFT / 1e18).toFixed(2)) : depositedBalance}
        />
        <ButtonGradFill
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? Number((balanceVFT / 1e18).toFixed(2)) : depositedBalance}
        />
      </div>
    </div>
  );
}

export { FundsCard };
