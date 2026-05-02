import { Box, Flex, Text } from "@chakra-ui/react";
import { GearApi } from "@gear-js/api";
import { useEffect, useState } from "react";

function Blocknumber() {
  const [blocknumber, setBlocknumber] = useState();

  const blocknumbers = async () => {
    const gearApi = await GearApi.create({
      providerAddress: process.env.REACT_APP_NODE_ADDRESS,
    });

    const unsub = await gearApi.gearEvents.subscribeToNewBlocks(
      (header: any) => {
        setBlocknumber(header.number.toNumber());
      }
    );
  };

  useEffect(() => {
    blocknumbers();
  }, []);
  return (
    <Flex flexDir="row">
      <Text mr=".5rem" color="white" fontWeight="semibold">
        Vara Block Number:
      </Text>
      <Text bgGradient="linear(to-l, #00FFC4 ,#4FFF4B)" bgClip="text">
        {blocknumber}
      </Text>
    </Flex>
  );
}

export { Blocknumber };
