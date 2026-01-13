import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";

import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

import { useWallet } from "contexts/accountContext";
import { useUserInfo } from "contexts/userInfoContext";

import {
  fungibleTokenProgramID,
  idlVFT,
  idlVSTREET,
  vstreetProgramID,
} from "../../../utils/smartPrograms";

import { Loader } from "components/molecules/alert-modal/AlertModal";
import { GearApi } from "@gear-js/api";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";

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
  const { fetchUserInfo } = useUserInfo();

  const { accountData, hexAddress, fetchBalance } = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const handleTransaction = async (
    transactions: { transaction: TransactionFunction; infoText: string }[]
  ) => {
    for (const { transaction, infoText } of transactions) {
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
      fetchUserInfo(hexAddress);
      fetchBalance();
    }, 3000);
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
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
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
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createTakeLoanTransaction = async () => {
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

    const amountConverted = Number(amount) * 1000000;

    const transaction =
      await sails.services.LiquidityInjectionService.functions.TakeLoan(
        amountConverted
      );
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createPayLoanTransaction = async () => {
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

    const amountConverted = Number(amount) * 1000000;

    const transaction =
      await sails.services.LiquidityInjectionService.functions.PayLoan(
        amountConverted
      );
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    return async () => {
      const { isFinalized } = await transaction.signAndSend();
      await isFinalized;
    };
  };

  const createApprovalTransaction = async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVFT);
    sails.setProgramId(fungibleTokenProgramID);

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

    const amountConverted = Number(amount) * 1000000;

    const transaction = await sails.services.Vft.functions.Approve(
      vstreetProgramID,
      amountConverted
    );
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

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
        infoText: "Deposit in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  };

  const handleWithdraw = async () => {
    const transaction = await createWithdrawTransaction();
    await handleTransaction([
      {
        transaction,
        infoText: "Withdrawal in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  };

  const handleBorrow = async () => {
    const transaction = await createTakeLoanTransaction();
    await handleTransaction([
      {
        transaction,
        infoText: "Loan taking in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  };

  const handlePay = async () => {
    const approvalTransaction = await createApprovalTransaction();
    const payLoanTransaction = await createPayLoanTransaction();
    await handleTransaction([
      {
        transaction: approvalTransaction,
        infoText: "Approval in progress. Please check your wallet to approve the transaction.",
      },
      {
        transaction: payLoanTransaction,
        infoText: "Loan pay in progress. Please check your wallet to sign the transaction.",
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
