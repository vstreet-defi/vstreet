import React, { useContext, useEffect, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";

import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { programIDVST, metadataVST } from "../../../utils/smartPrograms";

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

  useEffect(() => {
    if (account) {
      setUserAccount(account?.decodedAddress);
    }
  }, [account]);

  console.log("buton input value=", amount);
  const handleClick = () => {
    alertModalContext?.showAlertModal("Button clicked");
    if (alertModalContext) {
      setIsLoading(true);
      if (label === "Deposit") {
        //transfer deposit message
        const message: any = {
          destination: programIDVST, // programId
          payload: { Deposit: Number(amount) },
          gasLimit: 8998192450,
          value: 0,
        };

        //USDC ID & Metadata

        //transfer approve message
        // const messageApprove: any = {
        //   destination: programIDFT, // programId
        //   payload: {
        //     Approve: {
        //       to: userAccount,
        //       amount: amount,
        //     },
        //   },
        //   gasLimit: 8998192450,
        //   value: 0,
        // };
        // //Aproove message commented until we figure out a way to put it together with the deposit message
        //
        // const signerApprove = async () => {
        //   const localaccount = account?.address;
        //   const isVisibleAccount = accounts.some(
        //     (visibleAccount) => visibleAccount.address === localaccount
        //   );

        //   if (isVisibleAccount) {
        //     // Create a message extrinsic for transfer
        //     const transferExtrinsic = await api.message.send(
        //       messageApprove,
        //       metadataFT
        //     );

        //     const injector = await web3FromSource(accounts[0].meta.source);

        //     transferExtrinsic
        //       .signAndSend(
        //         account?.address ?? alert.error("No account"),
        //         { signer: injector.signer },
        //         ({ status }) => {
        //           if (status.isInBlock) {
        //             alert.success(status.asInBlock.toString());
        //           } else {
        //             console.log("in process");
        //             if (status.type === "Finalized") {
        //               alert.success(status.type);
        //             }
        //           }
        //         }
        //       )
        //       .catch((error: any) => {
        //         console.log(":( transaction failed", error);
        //       });
        //   } else {
        //     alert.error("Account not available to sign");
        //   }
        // };

        // signerApprove();

        //Transfer Approve

        const signer = async () => {
          const localaccount = account?.address;
          const isVisibleAccount = accounts.some(
            (visibleAccount) => visibleAccount.address === localaccount
          );

          if (isVisibleAccount) {
            // Create a message extrinsic for transfer
            const transferExtrinsic = await api.message.send(
              message,
              metadataVST
            );

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
        signer();

        console.log("Deposit action performed");
      }
      if (label === "Withdraw") console.log("Withdraw action performed");
      console.log(
        "Alert modal context: ",
        alertModalContext.isAlertModalVisible
      );
    }
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
