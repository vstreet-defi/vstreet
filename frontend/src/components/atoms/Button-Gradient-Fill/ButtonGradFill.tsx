import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";

//Sails-js Impotrts
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

import { Loader } from "components/molecules/alert-modal/AlertModal";
import { GearApi } from "@gear-js/api";

interface ButtonProps {
  label: string;
  amount: string;
  balance: number;
}

const ButtonGradFill: React.FC<ButtonProps> = ({ amount, label, balance }) => {
  const { accounts } = useAccount();
  const alertModalContext = useContext(AlertModalContext);

  const { accountData, hexAddress, selectedAccount } = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const handleSailsFunction = async () => {
    const parser = await SailsIdlParser.new();
    const sails = new Sails(parser);

    sails.parseIdl(idlVSTREET);

    sails.setProgramId(vstreetProgramID);

    const accountWEB3 = accountData;
    console.log("accountWEB3", accountWEB3);

    // Check if accountWEB is null
    if (!accountWEB3) {
      alertModalContext?.showErrorModal("No account data found");
      setTimeout(() => {
        alertModalContext?.hideAlertModal();
      }, 3000);
      return;
    }

    const injector = await web3FromSource(accountWEB3.meta.source);

    const gearApi = await GearApi.create({
      providerAddress: "wss://testnet.vara.network",
    });

    sails.setApi(gearApi);

    // Create the transaction type
    const transaction =
      await sails.services.LiquidityInjectionService.functions.DepositCollateral();

    const { signer } = await web3FromSource(accountWEB3.meta.source);
    //set the account signer
    transaction.withAccount(accountWEB3.address, {
      signer: signer,
    });

    // Set the value of the transaction
    transaction.withValue(BigInt(10 * 1e12));

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

export default ButtonGradFill;
