import React, { useContext, useState } from 'react';
import { AlertModalContext } from 'contexts/alertContext';
import { web3FromSource } from '@polkadot/extension-dapp';

import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';

import { useWallet } from 'contexts/accountContext';
import { useUserInfo } from 'contexts/userInfoContext';

import { Codec, CodecClass } from '@polkadot/types/types';
import { Signer } from '@polkadot/types/types';

import { fungibleTokenProgramID, idlVFT, idlVSTREET, vstreetProgramID } from '../../../utils/smartPrograms';

import { Loader } from 'components/molecules/alert-modal/AlertModal';
import { GearApi } from '@gear-js/api';
import { toRawUnits } from 'utils/index';

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
}

type TransactionFunction = () => Promise<void>;

const LOG_PREFIX = '[FundsAction]';

const logTransactionContext = (stage: string, details: Record<string, unknown>) => {
  console.log(`${LOG_PREFIX} ${stage}`, details);
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const ButtonGradFill: React.FC<ButtonProps> = ({ amount, label, balance }) => {
  const { fetchUserInfo } = useUserInfo();
  const alertModalContext = useContext(AlertModalContext);

  const { accountData, hexAddress, allAccounts } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const availableAccounts = allAccounts ?? [];

  const validateTransactionPreconditions = (operation: string) => {
    const parsedAmount = Number(amount);

    logTransactionContext(`${operation}:precheck`, {
      label,
      amount,
      parsedAmount,
      balance,
      accountAddress: accountData?.address,
      accountSource: accountData?.meta.source,
      hexAddress,
      gearAccountsCount: availableAccounts.length,
    });

    if (!accountData) {
      throw new Error('No account data found');
    }

    if (availableAccounts.length === 0) {
      throw new Error('No wallet accounts available. Connect or refresh the wallet extension.');
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error(`Invalid transaction amount: ${amount}`);
    }

    return parsedAmount;
  };

  const getRequiredAccount = () => {
    if (!accountData) {
      throw new Error('No account data found');
    }

    return accountData;
  };

  const createConfiguredSails = async (operation: string, idl: string) => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idl);
    sails.setProgramId(vstreetProgramID);

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    sails.setApi(gearApi);

    logTransactionContext(`${operation}:sails-configured`, {
      programId: vstreetProgramID,
      serviceNames: Object.keys(sails.services ?? {}),
      functionNames: Object.keys(sails.services?.LiquidityInjectionService?.functions ?? {}),
    });

    return sails;
  };

  const handleTransaction = async (transactions: { transaction: TransactionFunction; infoText: string }[]) => {
    for (const { transaction, infoText } of transactions) {
      alertModalContext?.showInfoModal(infoText);

      try {
        await transaction();
      } catch (error) {
        console.error(`${LOG_PREFIX} transaction failed`, {
          infoText,
          label,
          amount,
          balance,
          accountAddress: accountData?.address,
          hexAddress,
          error,
          errorMessage: getErrorMessage(error),
        });
        throw error;
      }
    }

    alertModalContext?.showSuccessModal();
    setTimeout(() => {
      alertModalContext?.hideAlertModal();
      fetchUserInfo(hexAddress);
    }, 3000);
  };

  const createApprovalTransaction = async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVFT);
    sails.setProgramId(fungibleTokenProgramID);

    const parsedAmount = validateTransactionPreconditions('approve');
    const accountWEB = getRequiredAccount();

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    sails.setApi(gearApi);

    logTransactionContext('approve:sails-configured', {
      programId: fungibleTokenProgramID,
      serviceNames: Object.keys(sails.services ?? {}),
      functionNames: Object.keys(sails.services?.Vft?.functions ?? {}),
    });

    const amountConverted = toRawUnits(parsedAmount);

    const transaction = await sails.services.Vft.functions.Approve(vstreetProgramID, Number(amountConverted));
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    logTransactionContext('approve:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createDepositTransaction = async () => {
    const parsedAmount = validateTransactionPreconditions('deposit');
    const sails = await createConfiguredSails('deposit', idlVSTREET);
    const accountWEB = getRequiredAccount();
    const amountConverted = toRawUnits(parsedAmount);

    const transaction = await sails.services.LiquidityInjectionService.functions.DepositLiquidity(
      Number(amountConverted),
    );
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    logTransactionContext('deposit:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createWithdrawTransaction = async () => {
    const parsedAmount = validateTransactionPreconditions('withdraw');
    const sails = await createConfiguredSails('withdraw', idlVSTREET);
    const accountWEB = getRequiredAccount();
    const amountConverted = toRawUnits(parsedAmount);

    const transaction = await sails.services.LiquidityInjectionService.functions.WithdrawLiquidity(
      Number(amountConverted),
    );
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    logTransactionContext('withdraw:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
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
        logTransactionContext('click', {
          label,
          amount,
          balance,
          accountAddress: accountData?.address,
          hexAddress,
          gearAccountsCount: availableAccounts.length,
        });
        await action();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error(`${LOG_PREFIX} action failed`, {
          label,
          amount,
          balance,
          accountAddress: accountData?.address,
          hexAddress,
          gearAccountsCount: availableAccounts.length,
          error,
          errorMessage,
        });
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
      disabled={!Number.isFinite(Number(amount)) || Number(amount) > balance || Number(amount) === 0 || isLoading}>
      {isLoading ? <Loader /> : label}
    </button>
  );
};

export default ButtonGradFill;
