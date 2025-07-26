import {
  useSignlessTransactions,
  useGaslessTransactions,
  usePrepareEzTransactionParams,
  EzTransactionsSwitch,
} from 'gear-ez-transactions';
import type { TransactionReturn, GenericTransactionReturn } from '@gear-js/react-hooks/dist/hooks/sails/types';
import { usePrepareProgramTransaction } from '@gear-js/react-hooks';
import { useProgram, useAccount } from '@gear-js/react-hooks';
import { useSignAndSend } from '@/hooks/use-sign-and-send';
import { useState, useRef, useEffect } from 'react';
import { useUserInfo } from '@/contexts/userInfoContext';
import { Program } from '@/hocs/lib';
import { encodeAddress } from '@polkadot/util-crypto';
import { Box } from '@chakra-ui/react';
import { useNativeBalance } from '@/hooks/useNativeBalance';
import { useApi } from '@gear-js/react-hooks';
import ButtonGradFillBorrow from '@/components/atoms/Button-Gradient-Fill/ButtonGradFillBorrow';
import { RelayerInfo } from './RelayerInfo';

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
  onSuccessCallback?: () => void;
}

const ALLOWED_SIGNLESS_ACTIONS = ['DepositCollateral', 'WithdrawCollateral'];

export const ButtonGradFillBorrowSignless: React.FC<ButtonProps> = ({ amount, label, balance, onSuccessCallback }) => {
  const { account } = useAccount();
  const { fetchUserInfo } = useUserInfo();
  const signless = useSignlessTransactions();
  const gasless = useGaslessTransactions();
  const { data: program } = useProgram({
    library: Program,
    id: import.meta.env.VITE_PROGRAMID,
  });

  const { prepareTransactionAsync: prepareDepositAsync } = usePrepareProgramTransaction({
    program,
    serviceName: 'service',
    functionName: 'depositCollateral',
  });
  const { prepareTransactionAsync: prepareWithdrawAsync } = usePrepareProgramTransaction({
    program,
    serviceName: 'service',
    functionName: 'withdrawCollateral',
  });

  const { prepareEzTransactionParams } = usePrepareEzTransactionParams();
  const { signAndSend } = useSignAndSend();

  const [loading, setLoading] = useState(false);
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

  const DECIMALS = 12;

  const handleSendDeposit = async () => {
    const relayerAddressVara = signless.pair ? encodeAddress(signless.pair.address, 137) : '';

    console.log('Address en formato Vara:', relayerAddressVara, 'Balance:', balance);

    if (!signless.isActive) {
      alert('Signless session is not active');
      return;
    }
    if (!amount || isNaN(Number(amount)) || BigInt(amount) <= 0n) {
      alert('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const { sessionForAccount, ...params } = await prepareEzTransactionParams(false);
      if (!sessionForAccount) throw new Error('Missing sessionForAccount');
      const amountToSend = BigInt(Math.floor(Number(amount) * 10 ** DECIMALS));

      const { transaction } = await prepareDepositAsync({
        args: [sessionForAccount, sessionForAccount],
        value: amountToSend,
        ...params,
      });

      signAndSend(transaction as unknown as TransactionReturn<() => GenericTransactionReturn<null>>, {
        onSuccess: () => {
          setLoading(false);
          fetchUserInfo(sessionForAccount);
          onSuccessCallback?.();
        },
        onError: () => setLoading(false),
      });
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSendWithdraw = async () => {
    if (!signless.isActive) {
      alert('Signless session is not active');
      return;
    }
    if (!amount || isNaN(Number(amount)) || BigInt(amount) <= 0n) {
      alert('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const { sessionForAccount, ...params } = await prepareEzTransactionParams(false);
      if (!sessionForAccount) throw new Error('Missing sessionForAccount');

      const { transaction } = await prepareWithdrawAsync({
        args: [sessionForAccount, amount, sessionForAccount],
        value: 0n,
        ...params,
      });

      signAndSend(transaction as unknown as TransactionReturn<() => GenericTransactionReturn<null>>, {
        onSuccess: () => {
          setLoading(false);
          fetchUserInfo(sessionForAccount);
          onSuccessCallback?.();
        },
        onError: () => setLoading(false),
      });
    } catch (err) {
      setLoading(false);
    }
  };

  const actions: { [key: string]: () => Promise<void> } = {
    Deposit: handleSendDeposit,
    Withdraw: handleSendWithdraw,
  };

  const handleClick = async () => {
    const action = actions[label];
    if (action) await action();
  };

  const voucherEnabled = gasless.voucherStatus?.enabled;

  const disabled =
    loading ||
    !signless.isActive ||
    !amount ||
    isNaN(Number(amount)) ||
    Number(amount) > balance ||
    Number(amount) <= 0;

  return (
    <>
      <RelayerInfo />
      <Box borderRadius="5px" bg="linear-gradient(90deg, #13ff9c 0%, #21d4fd 100%)">
        <EzTransactionsSwitch allowedActions={ALLOWED_SIGNLESS_ACTIONS} />
      </Box>
      {signless.isActive ? (
        ''
      ) : (
        <ButtonGradFillBorrow amount={amount} label={label} balance={balance} onSuccessCallback={onSuccessCallback} />
      )}
      {signless.isActive ? (
        <button
          className={`btn-grad-fill ${loading ? 'btn-grad-fill--loading' : ''}`}
          onClick={handleClick}
          disabled={disabled}
          style={{
            width: '100%',
            marginTop: '2rem',
            opacity: disabled ? 0.6 : 1,
            fontWeight: 'bold',
            fontSize: '1.1rem',
            borderRadius: '1rem',
            padding: '1rem',
            border: 'none',
            background: 'linear-gradient(90deg, #13ff9c 0%, #21d4fd 100%)',
            color: '#18181b',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}>
          {loading ? 'Sending…' : label}
        </button>
      ) : (
        ''
      )}
    </>
  );
};

export default ButtonGradFillBorrowSignless;
