import React, { useContext, useEffect, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";

import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import {
  programIDVST,
  metadataVST,
  programIDFTUSDC,
  metadataFTUSDC,
  programIDSPBond,
  metadataSPBond,
} from "../../../utils/smartPrograms";
import { MessageSendOptions } from "@gear-js/api";

interface ButtonProps {
  label: string;
  amount: string;
}

const ButtonGradFill: React.FC<ButtonProps> = ({ amount, label }) => {
  const alert = useAlert();
  const { accounts, account } = useAccount();
  const { api } = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const alertModalContext = useContext(AlertModalContext);

  const [userAccount, setUserAccount] = useState("");
  const [messageApprove, setMessageApprove] = useState<MessageSendOptions>({
    destination: programIDFTUSDC, // programId
    payload: {
      Approve: {
        to: programIDSPBond,
        amount: Number(amount),
      },
    },
    gasLimit: 89981924500,
    value: 0,
  });

  console.log(account?.decodedAddress);
  const [message, setMessage] = useState<MessageSendOptions>({
    destination: programIDSPBond, // programId
    payload: { BuyBond: Number(amount) },
    gasLimit: 89981924500,
    value: 0,
  });
  useEffect(() => {
    setMessageApprove({
      destination: programIDFTUSDC, // programId
      payload: {
        Approve: {
          to: programIDSPBond,
          amount: Number(amount),
        },
      },
      gasLimit: 89981924500,
      value: 0,
    });
    setMessage({
      destination: programIDSPBond, // programId
      payload: { BuyBond: Number(amount) },
      gasLimit: 89981924500,
      value: 0,
    });
    console.log(messageApprove);
    console.log(message);
  }, [amount]);

  const signerApprove = async () => {
    const localaccount = account?.address;
    const isVisibleAccount = accounts.some(
      (visibleAccount) => visibleAccount.address === localaccount
    );

    if (isVisibleAccount) {
      // Create a message extrinsic for transfer
      const transferExtrinsic = await api.message.send(
        messageApprove,
        metadataFTUSDC
      );

      const injector = await web3FromSource(accounts[0].meta.source);

      await transferExtrinsic
        .signAndSend(
          account?.address ?? alert.error("No account"),
          { signer: injector.signer },
          ({ status }) => {
            if (status.isInBlock) {
              alert.success(status.asInBlock.toString());
            } else {
              console.log("in process");
              if (status.type === "Finalized") {
                alert.success(status.type);
                console.log("Approve Finalized");
                signer();
              }
            }
          }
        )
        .catch((error: any) => {
          console.log(":( transaction failed", error);
        });
    } else {
      alert.error("Account not available to sign");
    }
  };

  const signer = async () => {
    const localaccount = account?.address;
    const isVisibleAccount = accounts.some(
      (visibleAccount) => visibleAccount.address === localaccount
    );

    if (isVisibleAccount) {
      // Create a message extrinsic for transfer
      const transferExtrinsic = await api.message.send(message, metadataSPBond);

      const injector = await web3FromSource(accounts[0].meta.source);

      transferExtrinsic
        .signAndSend(
          account?.address ?? alert.error("No account"),
          { signer: injector.signer },
          ({ status }) => {
            if (status.isInBlock) {
              alert.success(status.asInBlock.toString());
            } else {
              console.log("in process");
              if (status.type === "Finalized") {
                alert.success(status.type);
                console.log("Transfer Finalized");
                setIsLoading(false);
                alertModalContext?.hideAlertModal();
              }
            }
          }
        )
        .catch((error: any) => {
          console.log(":( transaction failed", error);
        });
    } else {
      alert.error("Account not available to sign");
    }
  };

  useEffect(() => {
    if (account) {
      setUserAccount(account?.decodedAddress);
    }
  }, [account]);

  const handleClick = async () => {
    alertModalContext?.showAlertModal(
      "Deposit in progress, first approve the smart contract and then sign the transaction.",
      "info"
    );
    if (alertModalContext) {
      setIsLoading(true);
      if (label === "Deposit") {
        try {
          //approve
          console.log("approve init");
          const aprrove = await signerApprove();
          console.log("approve done", aprrove);
        } catch (error) {
          console.log(error);
        }

        console.log("Deposit action performed");
      }
      if (label === "Withdraw") console.log("Withdraw action performed");
      console.log(
        "Alert modal context: ",
        alertModalContext.isAlertModalVisible
      );
    }
  };

  console.log("Alert msg;", alertModalContext?.alertModalMessage);

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
