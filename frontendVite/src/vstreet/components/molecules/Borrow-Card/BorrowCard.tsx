<<<<<<< HEAD
import BasicInput from 'components/molecules/Basic-Input/BasicInput';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import styles from 'components/molecules/cards/Card.module.scss';
import TokenSelectorBorrowUnder from 'components/atoms/Token-Selector-Borrow/TokenSelectorBorrowUnder';
import { ButtonGradientBorderBorrow } from 'components/atoms/Button-Gradient-Border/Button-Gradient-Border-Borrow';

import { useAccount, useApi } from '@gear-js/react-hooks';
import { GearApi } from '@gear-js/api';
import { FullState, FullStateVST } from 'smart-contracts-tools/index';
import { hexToBn } from '@polkadot/util';
import { Codec, CodecClass } from '@polkadot/types/types';
import { Signer } from '@polkadot/types/types';
import { web3FromSource } from '@polkadot/extension-dapp';

import { useWallet } from 'contexts/accountContext';
import { getVFTBalance } from 'smart-contracts-tools/index';
import { idlVSTREET, idlVFT, vstreetProgramID, fungibleTokenProgramID } from 'utils/smartPrograms';
import { AlertModalContext } from 'contexts/alertContext';
import { useUserInfo } from 'contexts/userInfoContext';

import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
=======
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
>>>>>>> VST-182-FE-MIGRATION-VITE

type props = {
  buttonLabel: string;
};

type TransactionFunction = () => Promise<void>;

function BorrowCard() {
<<<<<<< HEAD
  const [inputValue, setInputValue] = useState('');
=======
  const [inputValue, setInputValue] = useState("");
>>>>>>> VST-182-FE-MIGRATION-VITE
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
      setBalanceVFT(Number(balanceConverted) / 1000000);
    }
  }, [selectedAccount, hexAddress, balance]);

  useEffect(() => {
    if (userInfo) {
<<<<<<< HEAD
      console.log('User Info in BorrowCard:', userInfo);
      const mla = Number(userInfo.mla);
      setMaxLoanAmount(mla ?? 0);
      const la = Number(userInfo.loan_amount_usdc);
=======
      console.log("User Info in BorrowCard:", userInfo);
      const mla = Number(userInfo.mla);
      setMaxLoanAmount(mla ?? 0);
      const la = Number(userInfo.loan_amount_usdc) ;
>>>>>>> VST-182-FE-MIGRATION-VITE
      setLoanAmount(la ?? 0);
    }
  }, [userInfo]);

  const handleTransaction = useCallback(
<<<<<<< HEAD
    async (transactions: { transaction: TransactionFunction; infoText: string }[]) => {
=======
    async (
      transactions: { transaction: TransactionFunction; infoText: string }[]
    ) => {
>>>>>>> VST-182-FE-MIGRATION-VITE
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
<<<<<<< HEAD
    [alertModalContext, fetchUserInfo, hexAddress],
=======
    [alertModalContext, fetchUserInfo, hexAddress]
>>>>>>> VST-182-FE-MIGRATION-VITE
  );

  const createApprovalTransaction = useCallback(async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVFT);
    sails.setProgramId(fungibleTokenProgramID);

    const accountWEB = accountData;
    if (!accountWEB) {
<<<<<<< HEAD
      throw new Error('No account data found');
    }

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
=======
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
>>>>>>> VST-182-FE-MIGRATION-VITE
    });

    sails.setApi(gearApi);

    if (allAccounts.length === 0) {
<<<<<<< HEAD
      throw new Error('No account found');
=======
      throw new Error("No account found");
>>>>>>> VST-182-FE-MIGRATION-VITE
    }

    const amountConverted = Number(inputValue) * 1000000;

<<<<<<< HEAD
    const transaction = await sails.services.Vft.functions.Approve(vstreetProgramID, amountConverted);
=======
    const transaction = await sails.services.Vft.functions.Approve(
      vstreetProgramID,
      amountConverted
    );
>>>>>>> VST-182-FE-MIGRATION-VITE
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });
    await transaction.calculateGas(true, 15);

    return async () => {
<<<<<<< HEAD
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
=======
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();
>>>>>>> VST-182-FE-MIGRATION-VITE

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
<<<<<<< HEAD
        console.error('Error executing message:', error);
=======
        console.error("Error executing message:", error);
>>>>>>> VST-182-FE-MIGRATION-VITE
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
<<<<<<< HEAD
      throw new Error('No account data found');
    }

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
=======
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
>>>>>>> VST-182-FE-MIGRATION-VITE
    });

    sails.setApi(gearApi);

    if (allAccounts.length === 0) {
<<<<<<< HEAD
      throw new Error('No account found');
    }

    const amountConverted = Number(inputValue) * 1000000;

    const transaction = await sails.services.LiquidityInjectionService.functions.PayLoan(amountConverted);
    console.log('PayLoan amount:', amountConverted);
=======
      throw new Error("No account found");
    }

  const amountConverted = Number(inputValue) * 1000000;

    const transaction =
      await sails.services.LiquidityInjectionService.functions.PayLoan(
        amountConverted
      );
      console.log("PayLoan amount:", amountConverted);
>>>>>>> VST-182-FE-MIGRATION-VITE
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
<<<<<<< HEAD
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
=======
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();
>>>>>>> VST-182-FE-MIGRATION-VITE

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
<<<<<<< HEAD
        console.error('Error executing message:', error);
=======
        console.error("Error executing message:", error);
>>>>>>> VST-182-FE-MIGRATION-VITE
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
<<<<<<< HEAD
      throw new Error('No account data found');
    }

    const gearApi = await GearApi.create({
      providerAddress: 'wss://testnet.vara.network',
=======
      throw new Error("No account data found");
    }

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
>>>>>>> VST-182-FE-MIGRATION-VITE
    });

    sails.setApi(gearApi);

    if (allAccounts.length === 0) {
<<<<<<< HEAD
      throw new Error('No account found');
    }
    const amountConverted = Number(inputValue) * 1000000;

    const transaction = await sails.services.LiquidityInjectionService.functions.TakeLoan(amountConverted);
    console.log('TakeLoan amount:', amountConverted);
=======
      throw new Error("No account found");
    }
    const amountConverted = Number(inputValue) * 1000000;

    const transaction =
      await sails.services.LiquidityInjectionService.functions.TakeLoan(
        amountConverted
      );
      console.log("TakeLoan amount:", amountConverted);
>>>>>>> VST-182-FE-MIGRATION-VITE
    const { signer } = await web3FromSource(accountWEB.meta.source);
    transaction.withAccount(accountWEB.address, {
      signer: signer as string | CodecClass<Codec, any[]> as Signer,
    });

    await transaction.calculateGas(true, 15);

    return async () => {
<<<<<<< HEAD
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();
=======
      const { msgId, blockHash, txHash, response, isFinalized } =
        await transaction.signAndSend();
>>>>>>> VST-182-FE-MIGRATION-VITE

      const finalized = await isFinalized;

      try {
        const result = await response();
      } catch (error) {
<<<<<<< HEAD
        console.error('Error executing message:', error);
=======
        console.error("Error executing message:", error);
>>>>>>> VST-182-FE-MIGRATION-VITE
      }
    };
  }, [accountData, allAccounts, inputValue]);

  const handleApproveAndPayLoan = useCallback(async () => {
    const approvalTransaction = await createApprovalTransaction();
    const payLoanTransaction = await createPayLoanTransaction();
    await handleTransaction([
      {
        transaction: approvalTransaction,
<<<<<<< HEAD
        infoText: 'Approval in progress. Please check your wallet to approve the transaction.',
      },
      {
        transaction: payLoanTransaction,
        infoText: 'Loan pay in progress. Please check your wallet to sign the transaction.',
=======
        infoText:
          "Approval in progress. Please check your wallet to approve the transaction.",
      },
      {
        transaction: payLoanTransaction,
        infoText:
          "Loan pay in progress. Please check your wallet to sign the transaction.",
>>>>>>> VST-182-FE-MIGRATION-VITE
      },
    ]);
  }, [createApprovalTransaction, createPayLoanTransaction, handleTransaction]);

  const handleTakeLoan = useCallback(async () => {
    const takeLoanTransaction = await createTakeLoanTransaction();
    await handleTransaction([
      {
        transaction: takeLoanTransaction,
<<<<<<< HEAD
        infoText: 'Loan taking in progress. Please check your wallet to sign the transaction.',
=======
        infoText:
          "Loan taking in progress. Please check your wallet to sign the transaction.",
>>>>>>> VST-182-FE-MIGRATION-VITE
      },
    ]);
  }, [createTakeLoanTransaction, handleTransaction]);

  const handleClickTakeLoan = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleTakeLoan();
    } catch (error) {
<<<<<<< HEAD
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
=======
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
>>>>>>> VST-182-FE-MIGRATION-VITE
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
<<<<<<< HEAD
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
=======
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
>>>>>>> VST-182-FE-MIGRATION-VITE
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
<<<<<<< HEAD
        <BasicInput inputValue={inputValue} onInputChange={handleInputChange} balance={balanceVFT} />
        <div style={{ display: 'flex', gap: '6rem', marginTop: '20px' }}>
          <ButtonGradientBorderBorrow
            text="Borrow"
            isDisabled={Number(inputValue) * 1000000 > maxLoanAmount || Number(inputValue) === 0 || isLoading}
=======
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
>>>>>>> VST-182-FE-MIGRATION-VITE
            onClick={handleClickTakeLoan}
            isLoading={isLoading}
          />

          <ButtonGradientBorderBorrow
            text="Pay Loan"
<<<<<<< HEAD
            isDisabled={Number(inputValue) > loanAmount || Number(inputValue) === 0 || isLoading}
=======
            isDisabled={
              Number(inputValue)  > loanAmount ||
              Number(inputValue) === 0 ||
              isLoading
            }
>>>>>>> VST-182-FE-MIGRATION-VITE
            onClick={handleClickApproveAndPayLoan}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export { BorrowCard };
