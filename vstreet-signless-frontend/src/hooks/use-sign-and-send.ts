import { useAlert } from '@gear-js/react-hooks';
import { GenericTransactionReturn, TransactionReturn } from '@gear-js/react-hooks/dist/hooks/sails/types';
import { useEzTransactions } from 'gear-ez-transactions';
import { useCheckBalance } from './use-check-balance';

export type Options = {
  onSuccess?: () => void;
  onError?: () => void;
};

type Voucher = {
  id?: string;
};

type SignlessType = {
  voucher?: Voucher;
};

type GaslessType = {
  voucherId?: string;
};

type EzTransactions = {
  signless: SignlessType;
  gasless: GaslessType;
};

export const useSignAndSend = () => {
  const { signless, gasless } = useEzTransactions() as EzTransactions;

  const { checkBalance } = useCheckBalance({
    signlessPairVoucherId: signless.voucher?.id,
    gaslessVoucherId: gasless.voucherId?.startsWith('0x') ? (gasless.voucherId as `0x${string}`) : undefined,
  });

  const alert = useAlert();

  const signAndSend = (
    transaction: TransactionReturn<() => GenericTransactionReturn<null>>,
    options?: Options,
  ): void => {
    const { onSuccess, onError } = options || {};
    const calculatedGas = Number(transaction.extrinsic.args[2].toString());

    checkBalance(
      calculatedGas,
      () => {
        // No async here to satisfy ESLint's @typescript-eslint/no-misused-promises
        void transaction
          .signAndSend()
          .then(({ response }) =>
            response().then(() => {
              onSuccess?.();
            }),
          )
          .catch((error) => {
            onError?.();
            console.error(error);
            alert.error('Error');
          });
      },
      onError,
    );
  };

  return { signAndSend };
};
