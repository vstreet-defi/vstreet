import React, { useContext, useState } from 'react';
import { AlertModalContext } from '../../../contexts/alertContext';
import { useAccount } from '@gear-js/react-hooks';
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp';
import { Program as VFTProgram, Service as VFTService } from '@/hocs/vft';
import { Program, Service } from '@/hocs/lib';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { useUserInfo } from '../../../contexts/userInfoContext';
import { Codec, CodecClass } from '@polkadot/types/types';
import { Signer } from '@polkadot/types/types';
import { fungibleTokenProgramID, idlVFT, idlVSTREET, vstreetProgramID } from '../../../utils/smartPrograms';
import { Loader } from '../../../components/molecules/alert-modal/AlertModal';
import { decodeAddress, GearApi, HexString } from '@gear-js/api';

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
  onSuccessCallback?: () => void;
}

type TransactionFunction = () => Promise<void>;

const ButtonGradFill: React.FC<ButtonProps> = ({ amount, label, balance, onSuccessCallback }) => {
  const { account } = useAccount();
  const { fetchUserInfo } = useUserInfo();
  const alertModalContext = useContext(AlertModalContext);

  const [isLoading, setIsLoading] = useState(false);

  const handleTransaction = async (transactions: { transaction: TransactionFunction; infoText: string }[]) => {
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
  };

  const multiplyAmount = (amount: string): BigInt => {
    const multiplier = BigInt('1000000000000000000');
    return BigInt(amount) * multiplier;
  };

  const createApprovalTransaction = async () => {
    if (!account) throw new Error('No account data found');

    await web3Enable('vStreet');

    const gearApi = await GearApi.create({ providerAddress: 'wss://testnet.vara.network' });
    const program = new VFTProgram(gearApi, fungibleTokenProgramID as HexString);
    const service = new VFTService(program);

    const transaction = await service.approve(vstreetProgramID as HexString, amount);

    const { signer } = await web3FromSource(account.meta.source);

    transaction.withAccount(account.address, {
      signer: signer,
    });

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

  const createDepositTransaction = async () => {
    if (!account) throw new Error('No account data found');

    await web3Enable('vStreet');

    const gearApi = await GearApi.create({ providerAddress: 'wss://testnet.vara.network' });

    const program = new Program(gearApi, vstreetProgramID);
    const service = new Service(program);

    const multiplyAmount = (amount: string): bigint => {
      return BigInt(Math.floor(Number(amount)));
    };

    const multipliedAmount = BigInt(amount);

    const transaction = await service.depositLiquidity(multipliedAmount, decodeAddress(account.address), null);

    const { signer } = await web3FromSource(account.meta.source);
    transaction.withAccount(account.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

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
    if (!account) throw new Error('No account data found');

    await web3Enable('vStreet');

    const gearApi = await GearApi.create({ providerAddress: 'wss://testnet.vara.network' });

    const program = new Program(gearApi, vstreetProgramID);
    const service = new Service(program);

    const multipliedAmount = BigInt(amount);

    const transaction = await service.withdrawLiquidity(multipliedAmount, decodeAddress(account.address), null);
    const { signer } = await web3FromSource(account.meta.source);
    transaction.withAccount(account.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
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

  const handleApproveAndDeposit = async () => {
    const approvalTransaction = await createApprovalTransaction();
    const depositTransaction = await createDepositTransaction();
    await handleTransaction([
      {
        transaction: approvalTransaction,
        infoText: 'Approval in progress. Please check your wallet to approve the transaction.',
      },
      {
        transaction: depositTransaction,
        infoText: 'Deposit in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  };

  const handleWithdraw = async () => {
    const transaction = await createWithdrawTransaction();
    await handleTransaction([
      {
        transaction,
        infoText: 'Withdrawal in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  };

  const actions: { [key: string]: () => Promise<void> } = {
    Deposit: handleApproveAndDeposit,
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
        alertModalContext?.showErrorModal(errorMessage);
        setTimeout(() => {
          alertModalContext?.hideAlertModal();
        }, 3000);
      }
    } else {
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

export default ButtonGradFill;
