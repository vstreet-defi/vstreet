import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { web3Accounts, web3FromSource } from "@polkadot/extension-dapp";

//Sails-js Imports
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

//Import useWallet from contexts
import { useWallet } from "contexts/accountContext";

import {
  fungibleTokenProgramID,
  idlVFT,
  idlVSTREET,
  vstreetProgramID,
} from "../../../utils/smartPrograms";

import {
  createApproveMessage,
  createDepositMessage,
  createWithdrawMessage,
} from "smart-contracts-tools";
import { Loader } from "components/molecules/alert-modal/AlertModal";
import { GearApi } from "@gear-js/api";
import { MessageSendOptions } from "@gear-js/api/types";
import { Signer } from "@polkadot/types/types";
import { Codec, CodecClass, IKeyringPair } from "@polkadot/types/types";

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
}

type TransactionFunction = () => Promise<void>;

const ButtonGradFillBorrow: React.FC<ButtonProps> = ({
  amount,
  label,
  balance,
}) => {
  const { accounts } = useAccount();

  const alertModalContext = useContext(AlertModalContext);

  //Polkadot Extension Wallet-Hook by PSYLABS
  const { accountData } = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const handleTransaction = async (
    transactions: { transaction: TransactionFunction; infoText: string }[]
  ) => {
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
      window.location.reload();
    }, 2000);
  };

  const createDepositTransaction = async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVSTREET);
    sails.setProgramId(vstreetProgramID);

    const accountWEB = accountData;
    if (!accountWEB) {
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });

    sails.setApi(gearApi);

    if (accounts.length === 0) {
      throw new Error("No account found");
    }

    const transaction =
      await sails.services.LiquidityInjectionService.functions.DepositCollateral();
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    transaction.withValue(BigInt(Number(amount) * 1e12));
    await transaction.calculateGas(true, 15);

    return async () => {
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
        console.error("Error executing message:", error);
      }
    };
  };

  const createWithdrawTransaction = async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVSTREET);
    sails.setProgramId(vstreetProgramID);

    const accountWEB = accountData;
    if (!accountWEB) {
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });

    sails.setApi(gearApi);

    if (accounts.length === 0) {
      throw new Error("No account found");
    }

    const transaction =
      await sails.services.LiquidityInjectionService.functions.WithdrawCollateral(
        Number(amount)
      );
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    return async () => {
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
        console.error("Error executing message:", error);
      }
    };
  };

  const handleDeposit = async () => {
    const transaction = await createDepositTransaction();
    await handleTransaction([
      {
        transaction,
        infoText:
          "Deposit in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  };

  const handleWithdraw = async () => {
    const transaction = await createWithdrawTransaction();
    await handleTransaction([
      {
        transaction,
        infoText:
          "Withdrawal in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  };

  const actions: { [key: string]: () => Promise<void> } = {
    Deposit: handleDeposit,
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

export default ButtonGradFillBorrow;
