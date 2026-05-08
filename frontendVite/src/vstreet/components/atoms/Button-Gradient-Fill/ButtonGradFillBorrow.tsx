import React, { useContext, useState } from 'react';
import { AlertModalContext } from 'contexts/alertContext';
import { web3FromSource } from '@polkadot/extension-dapp';

import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';

import { useWallet } from 'contexts/accountContext';
import { useUserInfo } from 'contexts/userInfoContext';

import { fungibleTokenProgramID, idlVFT, idlVSTREET, vstreetProgramID } from '../../../utils/smartPrograms';

import { Loader } from 'components/molecules/alert-modal/AlertModal';
import { GearApi } from '@gear-js/api';
import { Codec, CodecClass } from '@polkadot/types/types';
import { Signer } from '@polkadot/types/types';
import { RAW_DECIMALS_FACTOR_VARA, toRawUnits } from 'utils/index';

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
}

type TransactionFunction = () => Promise<void>;

const LOG_PREFIX = '[BorrowAction]';

const logTransactionContext = (stage: string, details: Record<string, unknown>) => {
  console.log(`${LOG_PREFIX} ${stage}`, details);
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const ButtonGradFillBorrow: React.FC<ButtonProps> = ({ amount, label, balance }) => {
  const alertModalContext = useContext(AlertModalContext);
  const { fetchUserInfo } = useUserInfo();

  const { accountData, hexAddress, fetchBalance, allAccounts } = useWallet();

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
      walletAccountsCount: availableAccounts.length,
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

    if (operation === 'withdraw' && !Number.isInteger(parsedAmount)) {
      throw new Error('Collateral withdrawal only accepts whole TVARA amounts.');
    }

    return parsedAmount;
  };

  const getRequiredAccount = () => {
    if (!accountData) {
      throw new Error('No account data found');
    }
    return accountData;
  };

  const createConfiguredSails = async (operation: string, idl: string, programId: string) => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idl);
    sails.setProgramId(programId as `0x${string}`);

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
    });

    sails.setApi(gearApi);

    logTransactionContext(`${operation}:sails-configured`, {
      programId,
      serviceNames: Object.keys(sails.services ?? {}),
      functionNames: Object.keys(
        sails.services?.LiquidityInjectionService?.functions ?? sails.services?.Vft?.functions ?? {},
      ),
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
      fetchBalance();
    }, 3000);
  };

  const createDepositTransaction = async () => {
    validateTransactionPreconditions('deposit');
    const sails = await createConfiguredSails('deposit', idlVSTREET, vstreetProgramID);
    const accountWEB = getRequiredAccount();

    const transaction = await sails.services.LiquidityInjectionService.functions.DepositCollateral();
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    const value = BigInt(toRawUnits(amount, RAW_DECIMALS_FACTOR_VARA));
    transaction.withValue(value);
    await transaction.calculateGas(true, 15);

    logTransactionContext('deposit:transaction-created', {
      value: value.toString(),
      signerSource: accountWEB.meta.source,
    });

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createWithdrawTransaction = async () => {
    const parsedAmount = validateTransactionPreconditions('withdraw');
    const sails = await createConfiguredSails('withdraw', idlVSTREET, vstreetProgramID);
    const accountWEB = getRequiredAccount();
    // Contract expects amount in TVARA units here and internally scales by one_tvara.
    const amountConverted = Math.round(parsedAmount);

    const transaction = await sails.services.LiquidityInjectionService.functions.WithdrawCollateral(amountConverted);
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    logTransactionContext('withdraw:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createTakeLoanTransaction = async () => {
    const parsedAmount = validateTransactionPreconditions('borrow');
    const sails = await createConfiguredSails('borrow', idlVSTREET, vstreetProgramID);
    const accountWEB = getRequiredAccount();
    const amountConverted = toRawUnits(parsedAmount);

    const transaction = await sails.services.LiquidityInjectionService.functions.TakeLoan(amountConverted);
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    logTransactionContext('borrow:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createPayLoanTransaction = async () => {
    const parsedAmount = validateTransactionPreconditions('pay');
    const sails = await createConfiguredSails('pay', idlVSTREET, vstreetProgramID);
    const accountWEB = getRequiredAccount();
    const amountConverted = toRawUnits(parsedAmount);

    const transaction = await sails.services.LiquidityInjectionService.functions.PayLoan(amountConverted);
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    logTransactionContext('pay:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createApprovalTransaction = async () => {
    const parsedAmount = validateTransactionPreconditions('approve');
    const sails = await createConfiguredSails('approve', idlVFT, fungibleTokenProgramID);
    const accountWEB = getRequiredAccount();
    const amountConverted = toRawUnits(parsedAmount);

    const transaction = await sails.services.Vft.functions.Approve(vstreetProgramID, amountConverted);
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    logTransactionContext('approve:transaction-created', {
      amountConverted,
      signerSource: accountWEB.meta.source,
    });

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const handleDeposit = async () => {
    const transaction = await createDepositTransaction();
    await handleTransaction([
      {
        transaction,
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

  const handleBorrow = async () => {
    const transaction = await createTakeLoanTransaction();
    await handleTransaction([
      {
        transaction,
        infoText: 'Loan taking in progress. Please check your wallet to sign the transaction.',
      },
    ]);
  };

  const handlePay = async () => {
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
  };

  const actions: { [key: string]: () => Promise<void> } = {
    Deposit: handleDeposit,
    Withdraw: handleWithdraw,
    Borrow: handleBorrow,
    Pay: handlePay,
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
          walletAccountsCount: availableAccounts.length,
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
          walletAccountsCount: availableAccounts.length,
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

export default ButtonGradFillBorrow;
