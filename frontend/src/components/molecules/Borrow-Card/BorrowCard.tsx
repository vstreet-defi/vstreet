import BasicInput from "components/molecules/Basic-Input/BasicInput";
import React, { useContext, useState, useEffect, useCallback } from "react";
import styles from "components/molecules/cards/Card.module.scss";
import TokenSelectorBorrowUnder from "components/atoms/Token-Selector-Borrow/TokenSelectorBorrowUnder";
import { ButtonGradientBorderBorrow } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border-Borrow";

import { useAccount, useApi } from "@gear-js/react-hooks";
import { GearApi } from "@gear-js/api";
import { FullState, FullStateVST } from "smart-contracts-tools";
import { hexToBn } from "@polkadot/util";
import { Codec, CodecClass } from "@polkadot/types/types";
import { Signer } from "@polkadot/types/types";
import { web3FromSource } from "@polkadot/extension-dapp";

import { useWallet } from "contexts/accountContext";
import { getVFTBalance } from "smart-contracts-tools";
import {
  idlVSTREET,
  idlVFT,
  vstreetProgramID,
  fungibleTokenProgramID,
} from "utils/smartPrograms";
import { AlertModalContext } from "contexts/alertContext";
import { useUserInfo } from "contexts/userInfoContext";

import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

type props = {
  buttonLabel: string;
};

type TransactionFunction = () => Promise<void>;

function BorrowCard() {
  const [inputValue, setInputValue] = useState("");
  const alertModalContext = useContext(AlertModalContext);
  const [balanceVFT, setBalanceVFT] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, fetchUserInfo, balance } = useUserInfo();
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const { account } = useAccount();
  const { selectedAccount, hexAddress, allAccounts, accountData } = useWallet();

  const handleInputChange = useCallback((value: string): void => {
    setInputValue(value);
  }, []);

  const convertHexToDecimal = useCallback((hexValue: string) => {
    return hexToBn(hexValue).toString();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchUserInfo(hexAddress);
      const balanceConverted = convertHexToDecimal(balance.toString());
      setBalanceVFT(Number(balanceConverted));
    }
  }, [selectedAccount, hexAddress, balance]);

  useEffect(() => {
    if (userInfo) {
      const mla = Number(userInfo.mla);
      setMaxLoanAmount(mla ?? 0);
      const la = Number(userInfo.loan_amount);
      setLoanAmount(la ?? 0);
    }
  }, [userInfo]);

  const handleTransaction = useCallback(
    async (
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
        // Fetch user info again to refresh values
        fetchUserInfo(hexAddress);
      }, 3000);
    },
    [alertModalContext, fetchUserInfo, hexAddress]
  );

  const createApprovalTransaction = useCallback(async () => {
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

    if (allAccounts.length === 0) {
      throw new Error("No account found");
    }

    const transaction = await sails.services.Vft.functions.Approve(
      vstreetProgramID,
      Number(inputValue)
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
  }, [accountData, allAccounts, inputValue]);

  const createPayLoanTransaction = useCallback(async () => {
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

    if (allAccounts.length === 0) {
      throw new Error("No account found");
    }

    const transaction =
      await sails.services.LiquidityInjectionService.functions.PayLoan(
        Number(inputValue)
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
  }, [accountData, allAccounts, inputValue]);

  const createTakeLoanTransaction = useCallback(async () => {
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

    if (allAccounts.length === 0) {
      throw new Error("No account found");
    }

    const transaction =
      await sails.services.LiquidityInjectionService.functions.TakeLoan(
        Number(inputValue)
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
  }, [accountData, allAccounts, inputValue]);

  const handleApproveAndPayLoan = useCallback(async () => {
    const approvalTransaction = await createApprovalTransaction();
    const payLoanTransaction = await createPayLoanTransaction();
    await handleTransaction([
      {
        transaction: approvalTransaction,
        infoText:
          "Approval in progress. Please check your wallet to approve the transaction.",
      },
      {
        transaction: payLoanTransaction,
        infoText:
          "Loan pay in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  }, [createApprovalTransaction, createPayLoanTransaction, handleTransaction]);

  const handleTakeLoan = useCallback(async () => {
    const takeLoanTransaction = await createTakeLoanTransaction();
    await handleTransaction([
      {
        transaction: takeLoanTransaction,
        infoText:
          "Loan taking in progress. Please check your wallet to sign the transaction.",
      },
    ]);
  }, [createTakeLoanTransaction, handleTransaction]);

  const handleClickTakeLoan = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleTakeLoan();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alertModalContext?.showErrorModal(errorMessage);
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  }, [handleTakeLoan, alertModalContext]);

  const handleClickApproveAndPayLoan = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleApproveAndPayLoan();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alertModalContext?.showErrorModal(errorMessage);
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
    }
    setIsLoading(false);
  }, [handleApproveAndPayLoan, alertModalContext]);

  return (
    <div className={styles.ContainerBorrow}>
      <div className={styles.BasicCardBorrow}>
        <TokenSelectorBorrowUnder />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={balanceVFT}
        />
        <div style={{ display: "flex", gap: "6rem", marginTop: "20px" }}>
          <ButtonGradientBorderBorrow
            text="Borrow"
            isDisabled={
              Number(inputValue) * 1000000 > maxLoanAmount ||
              Number(inputValue) === 0 ||
              isLoading
            }
            onClick={handleClickTakeLoan}
            isLoading={isLoading}
          />

          <ButtonGradientBorderBorrow
            text="Pay Loan"
            isDisabled={
              Number(inputValue) * 1000000 > loanAmount ||
              Number(inputValue) === 0 ||
              isLoading
            }
            onClick={handleClickApproveAndPayLoan}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export { BorrowCard };
