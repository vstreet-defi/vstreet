import BasicInput from '../../../components/molecules/Basic-Input/BasicInput';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import styles from '../../../components/molecules/cards/Card.module.scss';
import TokenSelectorBorrowUnder from '../../../components/atoms/Token-Selector-Borrow/TokenSelectorBorrowUnder';
import { ButtonGradientBorderBorrow } from '../../../components/atoms/Button-Gradient-Border/Button-Gradient-Border-Borrow';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { GearApi, decodeAddress, HexString } from '@gear-js/api';
import { Codec, CodecClass } from '@polkadot/types/types';
import { Signer } from '@polkadot/types/types';
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp';
import { Program as VFTProgram, Service as VFTService } from '@/hocs/vft';
import { getVFTBalance } from '../../../smart-contracts-tools';
import { idlVSTREET, idlVFT, vstreetProgramID, fungibleTokenProgramID } from '../../../utils/smartPrograms';
import { AlertModalContext } from '../../../contexts/alertContext';
import { useUserInfo } from '../../../contexts/userInfoContext';
import { Program, Service } from '@/hocs/lib';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { useNativeBalance } from '@/hooks/useNativeBalance';

type props = {
  buttonLabel: string;
};

type TransactionFunction = () => Promise<void>;

function BorrowCard() {
  const [inputValue, setInputValue] = useState('');
  const alertModalContext = useContext(AlertModalContext);
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, fetchUserInfo } = useUserInfo();
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const { api } = useApi();

  const { account } = useAccount();
  const nativeBalance = useNativeBalance(account?.address);

  useEffect(() => {
    if (account?.address) {
      fetchUserInfo(account.address);

      setBalanceVFT(Number(nativeBalance ? nativeBalance / BigInt(1e12) : 0));
    }
  }, [account?.address, nativeBalance, fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      const mla = Number(userInfo.mla);
      console.log('mla', mla);
      setMaxLoanAmount(mla ?? 0);
      const la = Number(userInfo.loan_amount);
      setLoanAmount(la ?? 0);

      const userBalance = userInfo.balance_usdc ? Number(userInfo.balance_usdc) / 1e18 : 0;
      console.log('userBalance', userBalance);
    }
  }, [userInfo]);

  //get vftBalance
  useEffect(() => {
    if (account?.address && api) {
      getVFTBalance(setBalanceVFT, decodeAddress(account.address), api);
      console.log('balanceVFT', balanceVFT);
    }
  }, [account?.address, api]);

  // Handlers

  const handleInputChange = useCallback((value: string): void => {
    setInputValue(value);
  }, []);

  const multiplyAmount = (amount: string): BigInt => {
    const multiplier = BigInt('1');
    return BigInt(amount) * multiplier;
  };

  const multiplyAmountApprove = (amount: string): BigInt => {
    const multiplier = BigInt('1000000000000000000');
    return BigInt(amount) * multiplier;
  };

  const handleTransaction = useCallback(
    async (transactions: { transaction: TransactionFunction; infoText: string }[]) => {
      for (let i = 0; i < transactions.length; i++) {
        const { transaction, infoText } = transactions[i];
        alertModalContext?.showInfoModal(infoText);
        try {
          await transaction();
        } catch (error) {
          throw error;
        }
      }
      alertModalContext?.showSuccessModal();
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
        if (account?.address) fetchUserInfo(account.address);
      }, 3000);
    },
    [alertModalContext, fetchUserInfo, account?.address],
  );

  const createApprovalTransaction = useCallback(async () => {
    const gearApi = await GearApi.create({ providerAddress: 'wss://testnet.vara.network' });
    const program = new VFTProgram(gearApi, fungibleTokenProgramID as HexString);
    const service = new VFTService(program);

    const multipliedAmount = BigInt(Number(inputValue)) * 1000000n;

    const transaction = await service.approve(vstreetProgramID as HexString, multipliedAmount);

    if (!account) throw new Error('No account data found');

    const { signer } = await web3FromSource(account.meta.source);

    transaction.withAccount(account.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    return async () => {
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
      const finalized = await isFinalized;
      try {
        const result = await response();
      } catch (error) {
        console.error('Error executing message:', error);
      }
    };
  }, [account, inputValue]);

  const createPayLoanTransaction = useCallback(async () => {
    if (!account) throw new Error('No account data found');

    await web3Enable('vStreet');
    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    const program = new Program(gearApi, vstreetProgramID);
    const svc = new Service(program);

    const multipliedAmount = multiplyAmount(inputValue);
    const { signer } = await web3FromSource(account.meta.source);
    const transaction = await svc.payLoan(inputValue, decodeAddress(account.address),decodeAddress(account.address));
    transaction.withAccount(account.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
      const finalized = await isFinalized;
      try {
        const result = await response();
      } catch (error) {
        console.error('Error executing message:', error);
      }
    };
  }, [account, inputValue]);

  const createTakeLoanTransaction = useCallback(async () => {
    await web3Enable('vStreet');
    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    const program = new Program(gearApi, vstreetProgramID);
    const svc = new Service(program);

    if (!account) throw new Error('No account data found');

    const multipliedAmount = BigInt(Math.floor(Number(inputValue) * 1e18));
    const U128_MAX = 340282366920938463463374607431768211455n;

    if (multipliedAmount > U128_MAX) {
      throw new Error('Amount too large for u128!');
    }

    const { signer } = await web3FromSource(account.meta.source);
    const transaction = await svc.takeLoan(multipliedAmount, decodeAddress(account.address), null);
    transaction.withAccount(account.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
      const finalized = await isFinalized;
      try {
        const result = await response();
      } catch (error) {
        console.error('Error executing message:', error);
      }
    };
  }, [account, inputValue]);

  const handleApproveAndPayLoan = useCallback(async () => {
    const approvalTransaction = await createApprovalTransaction();
    const payLoanTransaction = await createPayLoanTransaction();
    await handleTransaction([
      {
        transaction: approvalTransaction,
        infoText: 'Approval in progress. Please check your wallet to approve the transaction.',
      },
      {
        transaction: payLoanTransaction,
        infoText: 'Loan pay in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  }, [createApprovalTransaction, createPayLoanTransaction, handleTransaction]);

  const handleTakeLoan = useCallback(async () => {
    const takeLoanTransaction = await createTakeLoanTransaction();
    await handleTransaction([
      {
        transaction: takeLoanTransaction,
        infoText: 'Loan taking in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  }, [createTakeLoanTransaction, handleTransaction]);

  const handleClickTakeLoan = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleTakeLoan();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      alertModalContext?.showErrorModal(errorMessage);
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  }, [handleTakeLoan, alertModalContext]);

  const handleClickApproveAndPayLoan = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleApproveAndPayLoan();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      alertModalContext?.showErrorModal(errorMessage);
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  }, [handleApproveAndPayLoan, alertModalContext]);

  return (
    <div className={styles.ContainerBorrow}>
      <div className={styles.BasicCardBorrow}>
        <TokenSelectorBorrowUnder />
        <BasicInput inputValue={inputValue} onInputChange={handleInputChange} balance={Number(balanceVFT) / 1e18} />

        <div style={{ display: 'flex', gap: '6rem', marginTop: '20px' }}>
          <ButtonGradientBorderBorrow text="Borrow" onClick={handleClickTakeLoan} isLoading={isLoading} />
          <ButtonGradientBorderBorrow text="Pay Loan USDT" onClick={handleClickApproveAndPayLoan} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export { BorrowCard };
