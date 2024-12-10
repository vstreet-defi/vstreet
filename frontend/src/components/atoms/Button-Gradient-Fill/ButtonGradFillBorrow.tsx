import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { web3Accounts, web3FromSource } from "@polkadot/extension-dapp";

//Sails-js Impotrts
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

//Import useWallet from contexts
import { useWallet } from "contexts/accountContext";

import { fungibleTokenProgramID, idlVFT } from "../../../utils/smartPrograms";

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

const ButtonGradFillBorrow: React.FC<ButtonProps> = ({
  amount,
  label,
  balance,
}) => {
  const { accounts, account } = useAccount();
  const { api } = useApi();
  const alertModalContext = useContext(AlertModalContext);

  //Polkadot Extension Wallet-Hook by PSYLABS
  const { selectedAccount, hexAddress, allAccounts, accountData } = useWallet();
  console.log("accountData", accountData);

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
        }, 3000);
      }
    } else {
      alertModalContext?.showErrorModal("Invalid action");
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  };

  const handleSailsFunction = async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVFT);

    sails.setProgramId(fungibleTokenProgramID);

    // Retrieve selected account data
    const accountWEB = accountData;

    // Check if accountWEB is null
    if (!accountWEB) {
      alertModalContext?.showErrorModal("No account data found");
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
      return;
    }

    const injector = await web3FromSource(accountWEB.meta.source);

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });

    sails.setApi(gearApi);

    //make an erorr modal if no account is found
    if (accounts.length === 0) {
      alertModalContext?.showErrorModal("No account found");
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
      return;
    } else {
      // Create the transaction type
      const transaction = await sails.services.Vft.functions.Approve(
        "0xae51577b0f30f25023da63d3ee254940f60930ad7ae2390eb31bbeab59a44bac",
        amount
      );
      //set the account signer
      transaction.withAccount(accountWEB.address, {
        signer: injector.signer,
      });

      // Calculate gas limit with default options
      await transaction.calculateGas();

      // Sign and send the transaction
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();

      console.log("Message ID:", msgId);
      console.log("Transaction hash:", txHash);
      console.log("Block hash:", blockHash);

      // Check if the transaction is finalized
      const finalized = await isFinalized;
      console.log("Is finalized:", finalized);

      // Get the response from the program
      try {
        const result = await response();
        console.log("Program response:", result);
      } catch (error) {
        console.error("Error executing message:", error);
      }

      console.log(transaction);
    }
  };

  return (
    <button
      className={`btn-grad-fill ${isLoading ? "btn-grad-fill--loading" : ""}`}
      onClick={handleSailsFunction}
      disabled={Number(amount) > balance || Number(amount) === 0 || isLoading}
    >
      {isLoading ? <Loader /> : label}
    </button>
  );
};

export default ButtonGradFillBorrow;
