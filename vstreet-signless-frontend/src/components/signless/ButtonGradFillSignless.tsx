import React, { useState, useRef, useEffect } from 'react';
import {
  useSignlessTransactions,
  useGaslessTransactions,
  usePrepareEzTransactionParams,
  EzTransactionsSwitch,
} from 'gear-ez-transactions';
import type { TransactionReturn, GenericTransactionReturn } from '@gear-js/react-hooks/dist/hooks/sails/types';
import { usePrepareProgramTransaction, useAccount, useProgram } from '@gear-js/react-hooks';
import { useSignAndSend } from '@/hooks/use-sign-and-send';
import { useUserInfo } from '@/contexts/userInfoContext';
import { Program } from '@/hocs/lib';
import { useToast } from '@chakra-ui/react';
import { Toast } from './Toast';
import { encodeAddress } from '@polkadot/util-crypto';
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp';
import { GearApi, HexString } from '@gear-js/api';
import { Program as VFTProgram, Service as VFTService } from '@/hocs/vft';
import { fungibleTokenProgramID, vstreetProgramID } from '../../utils/smartPrograms';
import ButtonGradFill from '../atoms/Button-Gradient-Fill/ButtonGradFill';
import { SignlessPanel } from './SignlessPanel';

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
  onSuccessCallback?: () => void;
}

const ALLOWED_SIGNLESS_ACTIONS = ['DepositLiquidity', 'WithdrawLiquidity'];

export const ButtonGradFillSignless: React.FC<ButtonProps> = ({ label, amount, balance, onSuccessCallback }) => {
  const { account } = useAccount();
  const toast = useToast();
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
    functionName: 'depositLiquidity',
  });
  const { prepareTransactionAsync: prepareWithdrawAsync } = usePrepareProgramTransaction({
    program,
    serviceName: 'service',
    functionName: 'withdrawLiquidity',
  });

  const { prepareEzTransactionParams } = usePrepareEzTransactionParams();
  const { signAndSend } = useSignAndSend();

  const [loading, setLoading] = useState(false);
  const [voucherPending, setVoucherPending] = useState(false);
  const hasRequestedOnceRef = useRef(false);

  // Solicitar voucher
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

  const DECIMALS = 18;

  const createApprovalTransaction = async () => {
    if (!account) throw new Error('No account data found');
    await web3Enable('vStreet');
    const gearApi = await GearApi.create({ providerAddress: 'wss://testnet.vara.network' });
    const program = new VFTProgram(gearApi, fungibleTokenProgramID as HexString);
    const service = new VFTService(program);

    console.log('Cantidad', amount);
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
        throw error;
      }
    };
  };

  // ----------- DEPOSIT -----------
  const handleSendDeposit = async () => {
    if (!signless.isActive) {
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message="Signless session is not active." />,
      });
      return;
    }
    if (!amount || isNaN(Number(amount)) || BigInt(amount) <= 0n) {
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message="Enter a valid amount." />,
      });
      return;
    }
    setLoading(true);
    try {
      const approvalTx = await createApprovalTransaction();
      await approvalTx();
      toast({
        position: 'bottom',
        duration: 2000,
        render: () => <Toast type="info" message="Tokens approved, sending deposit..." />,
      });

      const { sessionForAccount, ...params } = await prepareEzTransactionParams(false);
      if (!sessionForAccount) throw new Error('Missing sessionForAccount');
      const amountToSend = BigInt(Math.floor(Number(amount)));

      const { transaction } = await prepareDepositAsync({
        args: [amountToSend, sessionForAccount, sessionForAccount],
        value: 0n,
        ...params,
      });
      const executableTransaction = transaction;
      signAndSend(executableTransaction as unknown as TransactionReturn<() => GenericTransactionReturn<null>>, {
        onSuccess: () => {
          toast({
            position: 'bottom',
            duration: 3000,
            render: () => <Toast type="success" message="Deposit successful!" />,
          });
          setLoading(false);
          fetchUserInfo(sessionForAccount);
          onSuccessCallback?.();
        },
        onError: () => setLoading(false),
      });
    } catch (err: any) {
      setLoading(false);
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message={err?.message || 'Transaction failed.'} />,
      });
    }
  };

  // ----------- WITHDRAW -----------
  const handleSendWithdraw = async () => {
    if (!signless.isActive) {
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message="Signless session is not active." />,
      });
      return;
    }
    if (!amount || isNaN(Number(amount)) || BigInt(amount) <= 0n) {
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message="Enter a valid amount." />,
      });
      return;
    }
    setLoading(true);
    try {
      const { sessionForAccount, ...params } = await prepareEzTransactionParams(false);
      if (!sessionForAccount) throw new Error('Missing sessionForAccount');
      const { transaction } = await prepareWithdrawAsync({
        args: [BigInt(amount), sessionForAccount, sessionForAccount],
        value: 0n,
        ...params,
      });
      const executableTransaction = transaction;

      signAndSend(executableTransaction as unknown as TransactionReturn<() => GenericTransactionReturn<null>>, {
        onSuccess: () => {
          toast({
            position: 'bottom',
            duration: 3000,
            render: () => <Toast type="success" message="Withdrawal successful!" />,
          });
          setLoading(false);
          fetchUserInfo(sessionForAccount);
          onSuccessCallback?.();
        },
        onError: () => setLoading(false),
      });
    } catch (err: any) {
      setLoading(false);
      toast({
        position: 'bottom',
        duration: 3000,
        render: () => <Toast type="error" message={err?.message || 'Transaction failed.'} />,
      });
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

  const disabled =
    loading ||
    !signless.isActive ||
    !amount ||
    isNaN(Number(amount)) ||
    Number(amount) > balance ||
    Number(amount) <= 0;

  return (
    <>
      {signless.isActive ? (
        ''
      ) : (
        <>
          <ButtonGradFill amount={amount} label={label} balance={balance} onSuccessCallback={onSuccessCallback} />
        </>
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

export default ButtonGradFillSignless;
