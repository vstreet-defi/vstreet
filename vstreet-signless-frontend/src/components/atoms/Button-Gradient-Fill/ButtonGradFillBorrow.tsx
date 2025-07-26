import React, { useContext, useState } from 'react';
import { AlertModalContext } from '../../../contexts/alertContext';
import { useAccount } from '@gear-js/react-hooks';
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { useUserInfo } from '../../../contexts/userInfoContext';
import { Program, Service } from '@/hocs/lib';

import { idlVSTREET, vstreetProgramID } from '../../../utils/smartPrograms';

import { Loader } from '../../../components/molecules/alert-modal/AlertModal';
import { decodeAddress, GearApi } from '@gear-js/api';
import { Signer } from '@polkadot/types/types';
import { Codec, CodecClass } from '@polkadot/types/types';

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
  onSuccessCallback?: () => void;
}

type TransactionFunction = () => Promise<void>;

const ButtonGradFillBorrow: React.FC<ButtonProps> = ({ amount, label, balance, onSuccessCallback }) => {
  const { account } = useAccount();
  const alertModalContext = useContext(AlertModalContext);
  const { fetchUserInfo } = useUserInfo();
  const [isLoading, setIsLoading] = useState(false);

  console.debug('[ButtonGradFillBorrow] Render', {
    account,
    balance,
    amount,
    label,
  });

  const handleTransaction = async (transactions: { transaction: TransactionFunction; infoText: string }[]) => {
    for (let i = 0; i < transactions.length; i++) {
      const { transaction, infoText } = transactions[i];
      alertModalContext?.showInfoModal(infoText);

      try {
        await transaction();
      } catch (error) {
        console.error('[handleTransaction] Error:', error);
        throw error;
      }
    }

    alertModalContext?.showSuccessModal();
    setTimeout(() => {
      alertModalContext?.hideAlertModal();
      if (account?.address) fetchUserInfo(account.address);
    }, 3000);
  };

  const createDepositTransaction = async () => {
    if (!account) {
      throw new Error('No account found in Polkadot extension');
    }

    await web3Enable('vStreet');

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    const program = new Program(gearApi, vstreetProgramID);
    const svc = new Service(program);

    const transaction = await svc.depositCollateral(decodeAddress(account.address), null);

    const { signer } = await web3FromSource(account.meta.source);
    transaction.withAccount(account.address, {
      signer: signer as Signer,
    });

    transaction.withValue(BigInt(Number(amount) * 1e12));
    await transaction.calculateGas(true, 15);

    return async () => {
      const { response, isFinalized } = await transaction.signAndSend();
      await isFinalized;
      onSuccessCallback?.();
      try {
        await response();
      } catch (error) {
        console.error('Error executing message:', error);
      }
    };
  };

  const createWithdrawTransaction = async () => {
    if (!account) {
      throw new Error('No account found in Polkadot extension');
    }
    await web3Enable('vStreet');

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    const program = new Program(gearApi, vstreetProgramID);
    const svc = new Service(program);

    const amountNumber = Number(amount);

    let transaction;
    try {
      transaction = await svc.withdrawCollateral(decodeAddress(account.address), amountNumber, null);
    } catch (e) {
      throw e;
    }

    const { signer } = await web3FromSource(account.meta.source);

    transaction.withAccount(account.address, {
      signer: signer as Signer,
    });

    try {
      await transaction.calculateGas(true, 15);
    } catch (e) {
      throw e;
    }

    return async () => {
      try {
        const { response, isFinalized } = await transaction.signAndSend();
        await isFinalized;
        onSuccessCallback?.();
        try {
          await response();
        } catch (error) {
          console.error('[createWithdrawTransaction] Error executing message:', error);
        }
      } catch (e) {
        console.error('[createWithdrawTransaction] ERROR en signAndSend:', e);
        throw e;
      }
    };
  };

  const handleDeposit = async () => {
    console.debug('[handleDeposit] Clicked', { account, amount });
    const transaction = await createDepositTransaction();
    await handleTransaction([
      {
        transaction,
        infoText: 'Deposit in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  };

  const handleWithdraw = async () => {
    console.debug('[handleWithdraw] Clicked', { account, amount });
    const transaction = await createWithdrawTransaction();
    await handleTransaction([
      {
        transaction,
        infoText: 'Withdrawal in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  };

  const actions: { [key: string]: () => Promise<void> } = {
    Deposit: handleDeposit,
    Withdraw: handleWithdraw,
  };

  const handleClick = async () => {
    setIsLoading(true);

    const action = actions[label];
    if (action) {
      try {
        await action();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('[handleClick] Action error:', errorMessage, error);
        alertModalContext?.showErrorModal(errorMessage);
        setTimeout(() => {
          alertModalContext?.hideAlertModal();
        }, 3000);
      }
    } else {
      console.error('[handleClick] Invalid action', { label });
      alertModalContext?.showErrorModal('Invalid action');
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  };

  return (
    <button
      className={`btn-grad-fill ${isLoading ? 'btn-grad-fill--loading' : ''}`}
      onClick={handleClick}
      disabled={Number(amount) > balance || Number(amount) === 0 || isLoading}>
      {isLoading ? <Loader /> : label}
    </button>
  );
};

export default ButtonGradFillBorrow;
