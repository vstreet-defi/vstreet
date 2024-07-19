import React, { useContext, useEffect, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";

import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ProgramMetadata } from "@gear-js/api";

interface ButtonProps {
  label: string;
  valueAmount: string;
}

const ButtonGradFill: React.FC<ButtonProps> = ({ valueAmount, label }) => {
  const alert = useAlert();
  const { accounts, account } = useAccount();
  const { api } = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const alertModalContext = useContext(AlertModalContext);

  const [userAccount, setUserAccount] = useState("");
  console.log(account?.decodedAddress);

  useEffect(() => {
    if (account) {
      setUserAccount(account?.decodedAddress);
    }
  }, [account]);

  console.log("buton input value=", valueAmount);
  const handleClick = () => {
    alertModalContext?.showAlertModal("Button clicked");
    if (alertModalContext) {
      setIsLoading(true);
      if (label === "Deposit") {
        // VSTREET Ivan deploy test
        // Add your programID
        const programIDVST =
          "0x89942cb2ca7f7f7102359d7a3aec9cd830f0b921ee944a22905b589e025ad3c7";
        // Add your metadata.txt
        const meta =
          "0002000100000000000104000000010600000000000000000107000000250a30000808696f34496e69744c69717569646974790000040148737461626c65636f696e5f6164647265737304011c4163746f72496400000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100808696f3c4c6971756964697479416374696f6e00010c1c4465706f7369740400140110753132380000004457697468647261774c69717569646974790400140110753132380001003c57697468647261775265776172647300020000140000050700180808696f384c69717569646974794576656e740001102c496e697469616c697a6564000000244465706f7369746564040014011075313238000100484c697175696469747957697468647261776e040014011075313238000200405265776172647357697468647261776e040014011075313238000300001c0808696f34496f476c6f62616c537461746500001401146f776e657204011c4163746f724964000148737461626c65636f696e5f6164647265737304011c4163746f72496400010c6170721401107531323800013c746f74616c5f6465706f736974656414011075313238000114757365727320016c42547265654d61703c4163746f7249642c2055736572496e666f3e000020042042547265654d617008044b01040456012400040028000000240808696f2055736572496e666f000014011c62616c616e63651401107531323800011c72657761726473140110753132380001306c6173745f757064617465641401107531323800013062616c616e63655f7573646314011075313238000130726577617264735f75736463140110753132380000280000022c002c00000408042400";

        const metadata = ProgramMetadata.from(meta);

        //transfer deposit message
        const message: any = {
          destination: programIDVST, // programId
          payload: { Deposit: Number(valueAmount) },
          gasLimit: 8998192450,
          value: 0,
        };

        //USDC ID & Metadata
        const programIDFT =
          "0xd8d0206ab4a4d0f26f80a28594e767d62bf1d5ff436c8c79e819a97399b7eaa7";

        // Add your metadata.txt
        const metaFT =
          "00010001000000000001030000000107000000000000000108000000a90b3400081466745f696f28496e6974436f6e66696700000c01106e616d65040118537472696e6700011873796d626f6c040118537472696e67000120646563696d616c73080108753800000400000502000800000503000c081466745f696f204654416374696f6e000118104d696e74040010011075313238000000104275726e040010011075313238000100205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380002001c417070726f7665080108746f14011c4163746f724964000118616d6f756e74100110753132380003002c546f74616c537570706c790004002442616c616e63654f66040014011c4163746f724964000500001000000507001410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001801205b75383b2033325d0000180000032000000008001c081466745f696f1c46544576656e74000110205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380000001c417070726f76650c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380001002c546f74616c537570706c790400100110753132380002001c42616c616e63650400100110753132380003000020081466745f696f3c496f46756e6769626c65546f6b656e00001801106e616d65040118537472696e6700011873796d626f6c040118537472696e67000130746f74616c5f737570706c791001107531323800012062616c616e6365732401505665633c284163746f7249642c2075313238293e000128616c6c6f77616e6365732c01905665633c284163746f7249642c205665633c284163746f7249642c2075313238293e293e000120646563696d616c730801087538000024000002280028000004081410002c00000230003000000408142400";
        const metadataFT = ProgramMetadata.from(metaFT);

        //transfer approve message
        const messageApprove: any = {
          destination: programIDFT, // programId
          payload: {
            Approve: {
              to: userAccount,
              amount: valueAmount,
            },
          },
          gasLimit: 8998192450,
          value: 0,
        };
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
            const transferExtrinsic = await api.message.send(message, metadata);

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
