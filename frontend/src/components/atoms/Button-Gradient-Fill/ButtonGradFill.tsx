import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount, useApi } from "@gear-js/react-hooks";
import {
  createApproveMessage,
  createDepositMessage,
  createWithdrawMessage,
  approveTransaction,
  depositTransaction,
  withdrawTransaction,
} from "smart-contracts-tools";
import { Loader } from "components/molecules/alert-modal/AlertModal";
import { GearApi } from "@gear-js/api";
import { MessageSendOptions } from "@gear-js/api/types";

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
}

type TransactionFunction = (
  api: GearApi,
  message: MessageSendOptions,
  account: any,
  accounts: any[],
  setLoading?: ((loading: boolean) => void) | undefined
) => Promise<void>;

const ButtonGradFill: React.FC<ButtonProps> = ({ amount, label, balance }) => {
  const { accounts, account } = useAccount();
  const { api } = useApi();
  const alertModalContext = useContext(AlertModalContext);

  const [isLoading, setIsLoading] = useState(false);

  const handleTransaction = async (
    messages: { message: MessageSendOptions; infoText: string }[],
    transactions: TransactionFunction[]
  ) => {
    for (let i = 0; i < messages.length; i++) {
      const { message, infoText } = messages[i];
      const transaction = transactions[i];

      alertModalContext?.showInfoModal(infoText);

      try {
        await transaction(
          api as GearApi,
          message,
          account,
          accounts,
          i === messages.length - 1 ? setIsLoading : undefined
        );
      } catch (error) {
        throw error;
      }
    }

    alertModalContext?.showSuccessModal();
    setTimeout(() => {
      alertModalContext?.hideAlertModal();
    }, 2000);
  };

  const handleApproveAndDeposit = async () => {
    const approveMessage = createApproveMessage(amount);
    const depositMessage = createDepositMessage(amount);

    await handleTransaction(
      [
        {
          message: approveMessage,
          infoText: "Approval requested. Please check your wallet.",
        },
        {
          message: depositMessage,
          infoText:
            "Deposit in progress. Please check your wallet to sign the transaction.",
        },
      ],
      [approveTransaction, depositTransaction]
    );
  };

  const handleWithdraw = async () => {
    const withdrawMessage = createWithdrawMessage(amount);

    await handleTransaction(
      [
        {
          message: withdrawMessage,
          infoText:
            "Withdrawal in progress. Please check your wallet to sign the transaction.",
        },
      ],
      [withdrawTransaction as TransactionFunction]
    );
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
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        alertModalContext?.showErrorModal(errorMessage);
        setTimeout(() => {
          alertModalContext?.hideAlertModal();
        }, 5000);
      }
    } else {
      alertModalContext?.showErrorModal("Invalid action");
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 5000);
    }
    setIsLoading(false);
  };

  return (
    <button
      className={`btn-grad-fill ${isLoading ? "btn-grad-fill--loading" : ""}`}
      onClick={handleClick}
      disabled={Number(amount) > balance || Number(amount) === 0 || isLoading}
    >
      {isLoading ? <Loader /> : label}
    </button>
  );
};

export default ButtonGradFill;
