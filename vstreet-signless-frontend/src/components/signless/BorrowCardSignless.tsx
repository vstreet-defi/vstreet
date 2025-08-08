import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import BasicInput from '../molecules/Basic-Input/BasicInput';
import styles from '../molecules/cards/Card.module.scss';
import TokenSelectorBorrowUnder from '../atoms/Token-Selector-Borrow/TokenSelectorBorrowUnder';
import { ButtonGradientBorderBorrow } from '../atoms/Button-Gradient-Border/Button-Gradient-Border-Borrow';
import { useAccount } from '@gear-js/react-hooks';
import { AlertModalContext } from '../../contexts/alertContext';
import { useUserInfo } from '../../contexts/userInfoContext';
import { Program } from '@/hocs/lib';
import { useNativeBalance } from '@/hooks/useNativeBalance';
import { useProgram } from '@gear-js/react-hooks';
import { useToast } from '@chakra-ui/react';
import { Toast } from './Toast';
import { useSignlessTransactions, useGaslessTransactions, usePrepareEzTransactionParams } from 'gear-ez-transactions';
import type { TransactionReturn, GenericTransactionReturn } from '@gear-js/react-hooks/dist/hooks/sails/types';
import { useSignAndSend } from '@/hooks/use-sign-and-send';
import { usePrepareProgramTransaction } from '@gear-js/react-hooks';

const ALLOWED_SIGNLESS_ACTIONS = ['DepositCollateral', 'WithdrawCollateral', 'TakeLoan', 'PayLoan'];

function BorrowCardSignless() {
  const [inputValue, setInputValue] = useState('');
  const alertModalContext = useContext(AlertModalContext);
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, fetchUserInfo } = useUserInfo();
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const toast = useToast();

  const { account } = useAccount();
  const nativeBalance = useNativeBalance(account?.address);

  // --- SIGNLESS HOOKS ---
  const signless = useSignlessTransactions();
  const gasless = useGaslessTransactions();
  const { prepareEzTransactionParams } = usePrepareEzTransactionParams();
  const { signAndSend } = useSignAndSend();

  const { data: program } = useProgram({
    library: Program,
    id: import.meta.env.VITE_PROGRAMID,
  });

  const { prepareTransactionAsync: prepareTakeLoanAsync } = usePrepareProgramTransaction({
    program,
    serviceName: 'service',
    functionName: 'takeLoan',
  });
  const { prepareTransactionAsync: preparePayLoanAsync } = usePrepareProgramTransaction({
    program,
    serviceName: 'service',
    functionName: 'payLoan',
  });
  // ----------------------------------------

  // --- VOUCHER HANDLING ---
  const [voucherPending, setVoucherPending] = useState(false);
  const hasRequestedOnceRef = useRef(false);

  useEffect(() => {
    hasRequestedOnceRef.current = false;
  }, [account?.address]);
  useEffect(() => {
    if (!account?.address || !gasless.isEnabled || hasRequestedOnceRef.current) return;
    hasRequestedOnceRef.current = true;
    setVoucherPending(true);
    const requestVoucherSafely = async () => {
      try {
        if (gasless.voucherStatus?.enabled) {
          setVoucherPending(false);
          return;
        }
        await gasless.requestVoucher(account.address);
        let retries = 5;
        while (retries-- > 0) {
          await new Promise((res) => setTimeout(res, 300));
          if (gasless.voucherStatus?.enabled) {
            setVoucherPending(false);
            return;
          }
        }
        setVoucherPending(false);
      } catch {
        hasRequestedOnceRef.current = false;
        setVoucherPending(false);
      }
    };
    void requestVoucherSafely();
  }, [account?.address, gasless.isEnabled]);
  // ------------------------

  useEffect(() => {
    if (account?.address) {
      fetchUserInfo(account.address);
      setBalanceVFT(Number(nativeBalance ? nativeBalance / BigInt(1e12) : 0));
    }
  }, [account?.address, nativeBalance, fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      const mla = Number(userInfo.mla);
      setMaxLoanAmount(mla ?? 0);
      const la = Number(userInfo.loan_amount);
      setLoanAmount(la ?? 0);
    }
  }, [userInfo]);

  const handleInputChange = useCallback((value: string): void => {
    setInputValue(value);
  }, []);

  const handleSignlessTakeLoan = useCallback(async () => {
    if (!signless.isActive) {
      alertModalContext?.showErrorModal('Signless session is not active');
      return;
    }
    if (!account) {
      alertModalContext?.showErrorModal('No account found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { sessionForAccount, ...params } = await prepareEzTransactionParams(false);
      if (!sessionForAccount) throw new Error('Missing sessionForAccount');
      const amountToSend = BigInt(Math.floor(Number(inputValue)*100000));

      const { transaction } = await prepareTakeLoanAsync({
        args: [amountToSend, sessionForAccount, sessionForAccount],
        ...params,
      });

      signAndSend(transaction as unknown as TransactionReturn<() => GenericTransactionReturn<null>>, {
        onSuccess: () => {
          toast({
            position: 'bottom',
            duration: 3000,
            render: () => <Toast type="success" message="Transaction executed successfully!" />,
          });
          setIsLoading(false);
          setInputValue('');
          if (account?.address) fetchUserInfo(account.address);
        },
        onError: () => {
          setIsLoading(false);
          toast({
            position: 'bottom',
            duration: 3000,
            render: () => <Toast type="error" message="Transaction error!" />,
          });
        },
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message="Transaction error!" />,
      });
    }
  }, [
    signless,
    prepareEzTransactionParams,
    inputValue,
    account,
    alertModalContext,
    fetchUserInfo,
    signAndSend,
    prepareTakeLoanAsync,
  ]);

  const handleSignlessPayLoan = useCallback(async () => {
    if (!signless.isActive) {
      alertModalContext?.showErrorModal('Signless session is not active');
      return;
    }
    setIsLoading(true);
    try {
      const { sessionForAccount, ...params } = await prepareEzTransactionParams(false);
      if (!sessionForAccount) throw new Error('Missing sessionForAccount');
      const payAmount = BigInt(inputValue).toString();

      const { transaction } = await preparePayLoanAsync({
        args: [payAmount, sessionForAccount, sessionForAccount],
        ...params,
      });

      signAndSend(transaction as unknown as TransactionReturn<() => GenericTransactionReturn<null>>, {
        onSuccess: () => {
          toast({
            position: 'bottom',
            duration: 3000,
            render: () => <Toast type="success" message="Loan paid successfully!" />,
          });
          setIsLoading(false);
          if (account?.address) fetchUserInfo(account.address);
        },
        onError: () => {
          setIsLoading(false);
          toast({
            position: 'bottom',
            duration: 3000,
            render: () => <Toast type="error" message={'Transaction failed.'} />,
          });
        },
      });
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      alertModalContext?.showErrorModal(errorMessage);
    }
  }, [
    signless,
    prepareEzTransactionParams,
    inputValue,
    account,
    alertModalContext,
    fetchUserInfo,
    signAndSend,
    preparePayLoanAsync,
  ]);

  return (
    <div className={styles.ContainerBorrow}>
      <div className={styles.BasicCardBorrow}>
        <TokenSelectorBorrowUnder />
        <BasicInput inputValue={inputValue} onInputChange={handleInputChange} balance={Number(userInfo.mla) / 1e6} />
        <div style={{ display: 'flex', gap: '6rem', marginTop: '20px' }}>
          {signless.isActive ? (
            <>
              <ButtonGradientBorderBorrow
                text="Borrow"
                onClick={handleSignlessTakeLoan}
                isLoading={isLoading || voucherPending}
              />
              <ButtonGradientBorderBorrow
                text="Pay Loan"
                onClick={() => handleSignlessPayLoan()}
                isLoading={isLoading || voucherPending}
              />
            </>
          ) : (
            <>
              <ButtonGradientBorderBorrow text="Borrow" onClick={() => {}} isLoading={isLoading} />
              <ButtonGradientBorderBorrow text="Pay Loan" onClick={() => {}} isLoading={isLoading} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { BorrowCardSignless };
