import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import {
  createApproveMessage,
  createDepositMessage,
  createWithdrawMessage,
  approveTransaction,
  depositTransaction,
  withdrawTransaction,
} from "smart-contracts-tools";

interface ButtonProps {
  label: string;
  amount: string;
}

const ButtonGradFill: React.FC<ButtonProps> = ({ amount, label }) => {
  const alert = useAlert();
  const { accounts, account } = useAccount();
  const { api } = useApi();
  const alertModalContext = useContext(AlertModalContext);

  const [isLoading, setIsLoading] = useState(false);

  const handleApproveAndDeposit = async () => {
    const approveMessage = createApproveMessage(amount);
    const depositMessage = createDepositMessage(amount);

    try {
      console.log("approve init");
      alertModalContext?.showAlertModal(
        `Approval requested. Please check your wallet.`,
        "info"
      );
      await approveTransaction(api, approveMessage, account, accounts, alert);
      console.log("approve done");

      console.log("deposit init");
      alertModalContext?.showAlertModal(
        `Deposit in progress. Please check your wallet to sign the transaction.`,
        "info"
      );
      await depositTransaction(
        api,
        depositMessage,
        account,
        accounts,
        alert,
        setIsLoading,
        alertModalContext
      );
      alertModalContext?.hideAlertModal?.();
      console.log("deposit done");
    } catch (error) {
      console.log(error);
      alertModalContext?.showAlertModal(`${error}`, "info");
    }
  };

  const handleWithdraw = async () => {
    const withdrawMessage = createWithdrawMessage(amount);

    try {
      console.log("withdraw init");
      alertModalContext?.showAlertModal(
        `Withdrawal in progress. Please check your wallet to sign the transaction.`,
        "info"
      );
      await withdrawTransaction(
        api,
        withdrawMessage,
        account,
        accounts,
        alert,
        setIsLoading,
        alertModalContext
      );
      alertModalContext?.hideAlertModal?.();
      console.log("withdraw done");
    } catch (error) {
      console.log(error);
    }
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
        console.log(error);
      }
    } else {
      alert.error("Invalid action");
    }

    setIsLoading(false);
  };

  return (
    <button
      className={`btn-grad-fill ${isLoading ? "btn-grad-fill--loading" : ""}`}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        label
      )}
    </button>
  );
};

export default ButtonGradFill;
