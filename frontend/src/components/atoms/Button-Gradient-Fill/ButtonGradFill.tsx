import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";
import { useAccount } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";

//Sails-js Impotrts
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

//Import useWallet from contexts
import { useWallet } from "contexts/accountContext";

import { fungibleTokenProgramID, idlVFT } from "../../../utils/smartPrograms";

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

  const { accountData } = useWallet();

  const [isLoading, setIsLoading] = useState(false);

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

export default ButtonGradFill;
