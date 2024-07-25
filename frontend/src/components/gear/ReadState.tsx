import { decodeAddress, GearApi } from "@gear-js/api";
// import { Button } from "@gear-js/ui";
import { useState, useEffect } from "react";
import { useAccount } from "@gear-js/react-hooks";

import { Heading, Button, Flex } from "@chakra-ui/react";

import { programIDVST, metadataVST } from "utils/smartPrograms";

function ReadState() {
  // const { api } = useApi();

  const [fullState, setFullState] = useState<any | undefined>({});
  const totalLiquidity = fullState.totalDeposited || [];
  const totalSynthLocked = fullState.totalSynteticDeposited || [];

  const [walletDecoded, setWalletDecoded] = useState("");
  const lenders = fullState.users || [];
  const borrowers = fullState.borrowers || [];
  const { account } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [collateralLocked, setCollateralLocked] = useState();
  const [syntheticLocked, setSyntheticLocked] = useState();

  useEffect(() => {
    if (account?.address) {
      setWalletAddress(account.address);
      setWalletDecoded(decodeAddress(account.address));
    }
  }, [account]);

  // const getState = async () => {
  //   const api = await GearApi.create({
  //     providerAddress: "wss://testnet.vara.network",
  //   });
  //   api.programState
  //     .read({ programId: programIDVST }, metadataVST)
  //     .then((result) => {
  //       setFullState(result.toJSON());
  //       console.log(fullState);
  //       // alert.success("Successful state");
  //     })
  //     .catch(({ message }: Error) => console.log(message));
  // };

  //  const getState = () => {
  //     const api = await GearApi.create({
  //       providerAddress: "wss://testnet.vara.network",
  //     });
  //     await api.programState
  //       .read({ programId:  programIDFT }, metadata)
  //       .then((result) => {
  //         setFullState(result.toJSON());
  //         console.log(result.toJSON());
  //         // alert.success("Successful state");
  //       })
  //       .catch(({ message }: Error) => console.log(message));
  //   }}

  // const getBalance = () => {
  //   const findAccount = (address: string) =>
  //     lenders.find((array: string | any[]) => array.includes(address));

  //   const userData = findAccount(walletDecoded);
  //   // setUserStatus(userData[1].liquidity);
  // };
  // const getCollateralLocked = () => {
  //   // Find Data of account in state
  //   const findAccount = (address: string) =>
  //     lenders.find((array: string | any[]) => array.includes(address));

  //   const userData = findAccount(walletDecoded);

  //   // Check if userData is defined and has the expected structure
  //   if (
  //     userData &&
  //     userData.length > 1 &&
  //     userData[1] &&
  //     userData[1].liquidity !== undefined
  //   ) {
  //     setCollateralLocked(userData[1].liquidity);
  //   } else {
  //     // Handle the case where userData is not as expected
  //     setCollateralLocked(undefined); // or any other default value or error handling you prefer
  //   }
  // };

  // const getSyntheticlLocked = () => {
  //   const findAccount = (address: string) =>
  //     borrowers.find((array: string | any[]) => array.includes(address));

  //   const userData = findAccount(walletDecoded);

  //   // Check if userData is defined and has the expected structure
  //   if (
  //     userData &&
  //     userData.length > 1 &&
  //     userData[1] &&
  //     userData[1].loanamount !== undefined
  //   ) {
  //     setSyntheticLocked(userData[1].loanamount);
  //   } else {
  //     // Handle the case where userData is not as expected
  //     setSyntheticLocked(undefined); // or any other default value or error handling you prefer
  //   }
  // };

  // useEffect(() => {
  //   getState();
  //   // getCollateralLocked();
  //   // getSyntheticlLocked();
  //   console.log(fullState);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // console.log(userStatus);

  console.log(fullState.totalDeposited);

  return (
    <Flex>
      <Heading fontSize="1rem" color="white">
        {" "}
        Vara Street TVL:
      </Heading>
      <Heading ml=".5rem" fontSize="1rem" color="#00FFC4">
        {totalLiquidity}
      </Heading>
      <Heading fontSize="1rem" color="white" ml="1rem">
        Total $gVARA Deposited:
      </Heading>

      <Heading ml=".5rem" fontSize="1rem" color="#00FFC4">
        {totalSynthLocked}
      </Heading>
      <Button
        onClick={async () => {
          const api = await GearApi.create({
            providerAddress: "wss://testnet.vara.network",
          });
          await api.programState
            .read({ programId: programIDVST }, metadataVST)
            .then((result) => {
              setFullState(result.toJSON());
              console.log(result.toJSON());
              // alert.success("Successful state");
              setFullState(result.toJSON());
            })
            .catch(({ message }: Error) => console.log(message));
        }}
      >
        STATE
      </Button>
    </Flex>
  );
}

export { ReadState };

// {async () => {
//   const api = await GearApi.create({
//     providerAddress: "wss://testnet.vara.network",
//   });
//   await api.programState
//     .read({ programId: programIDFT }, metadata)
//     .then((result) => {
//       setFullState(result.toJSON());
//       console.log(result.toJSON());
//       // alert.success("Successful state");
//     })
//     .catch(({ message }: Error) => console.log(message));
// }}
