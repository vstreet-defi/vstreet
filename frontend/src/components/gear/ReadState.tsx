import { decodeAddress, GearApi } from "@gear-js/api";
import { useState, useEffect } from "react";
import { useAccount } from "@gear-js/react-hooks";
import { Heading, Button, Flex } from "@chakra-ui/react";
import { vstreetProgramID, decodedVstreetMeta } from "utils/smartPrograms";

function ReadState() {
  const [fullState, setFullState] = useState<any | undefined>({});
  const totalLiquidity = fullState.totalDeposited || [];
  const totalSynthLocked = fullState.totalSynteticDeposited || [];

  const [walletDecoded, setWalletDecoded] = useState("");
  const { account } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (account && account.address) {
      setWalletAddress(account.address);
      setWalletDecoded(decodeAddress(account.address));
    }
  }, [account]);

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
            .read(
              {
                programId: vstreetProgramID,
                payload: undefined,
              },
              decodedVstreetMeta
            )
            .then((result) => {
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
