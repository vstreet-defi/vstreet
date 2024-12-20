import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ProgramMetadata } from "@gear-js/api";
import { useState } from "react";
// import { Button } from "@gear-js/ui";
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { CollateralBalanceToken } from "./CollateralBalance";
import styles from "../layout/cards/Card.module.scss";

function DepositFunds() {
  const alert = useAlert();
  const { accounts, account } = useAccount();
  const { api } = useApi();
  const [valueAmount, setValueAmount] = useState("");
  // const [valueAmount, setValueAmount] = useState("");

  // setValueAmount("");

  // const AmountInputChange = (event: any) => {
  //   setValueAmount(event.target.value);
  // };

  // Add your programID Collateral
  //USDCV
  // Add your programID
  const programIDFT =
    "0xd8d0206ab4a4d0f26f80a28594e767d62bf1d5ff436c8c79e819a97399b7eaa7";

  // Add your metadata.txt
  const meta =
    "00010001000000000001030000000107000000000000000108000000a90b3400081466745f696f28496e6974436f6e66696700000c01106e616d65040118537472696e6700011873796d626f6c040118537472696e67000120646563696d616c73080108753800000400000502000800000503000c081466745f696f204654416374696f6e000118104d696e74040010011075313238000000104275726e040010011075313238000100205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380002001c417070726f7665080108746f14011c4163746f724964000118616d6f756e74100110753132380003002c546f74616c537570706c790004002442616c616e63654f66040014011c4163746f724964000500001000000507001410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001801205b75383b2033325d0000180000032000000008001c081466745f696f1c46544576656e74000110205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380000001c417070726f76650c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380001002c546f74616c537570706c790400100110753132380002001c42616c616e63650400100110753132380003000020081466745f696f3c496f46756e6769626c65546f6b656e00001801106e616d65040118537472696e6700011873796d626f6c040118537472696e67000130746f74616c5f737570706c791001107531323800012062616c616e6365732401505665633c284163746f7249642c2075313238293e000128616c6c6f77616e6365732c01905665633c284163746f7249642c205665633c284163746f7249642c2075313238293e293e000120646563696d616c730801087538000024000002280028000004081410002c00000230003000000408142400";

  const metadata = ProgramMetadata.from(meta);

  const message: any = {
    destination: programIDFT, // programId
    payload: { Deposit: Number(valueAmount) },
    gasLimit: 8998192450,
    value: 0,
  };

  const signer = async () => {
    const localaccount = account?.address;
    const isVisibleAccount = accounts.some(
      (visibleAccount) => visibleAccount.address === localaccount
    );

    if (isVisibleAccount) {
      // Create a message extrinsic
      const transferExtrinsic = await api.message.send(message, metadata);

      const injector = await web3FromSource(accounts[0].meta.source);

      // transferExtrinsic
      //   .signAndSend(
      //     account?.address ?? alert.error("No account"),
      //     { signer: injector.signer },
      //     ({ status }) => {
      //       if (status.isInBlock) {
      //         alert.success(status.asInBlock.toString());
      //       } else {
      //         console.log("in process");
      //         if (status.type === "Finalized") {
      //           alert.success(status.type);
      //         }
      //       }
      //     }
      //   )
      //   .catch((error: any) => {
      //     console.log(":( transaction failed", error);
      //   });
    } else {
      alert.error("Account not available to sign");
    }
  };
  const AmountInputChange = (event: any) => {
    setValueAmount(event.target.value);
  };

  return (
    <Box className={styles.Moduleborderwrap}>
      <Box className={styles.module}>
        <Heading color="#00FFC4">Deposit Liquidity</Heading>
        <Text fontWeight="light">Deposit your USDT to earn 10% APY</Text>
        <Flex mt="1rem">
          <Input
            color="white"
            value={valueAmount}
            onChange={AmountInputChange}
          />
          <Button bgGradient="linear(to-l, #00FFC4 ,#4FFF4B)" onClick={signer}>
            Deposit
          </Button>
        </Flex>
        <Flex mt="1rem" justify="flex-end">
          <CollateralBalanceToken />
        </Flex>
      </Box>
    </Box>
  );
}

export { DepositFunds };
