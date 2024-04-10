import { Flex, Box } from "@chakra-ui/react";

function Arrow() {
  return (
    <Flex flexDir="column">
      <Box
        alignSelf="center"
        h="2rem"
        borderWidth="0.5px"
        w="0px"
        borderColor="#00FFC4"
      ></Box>
      <Box fontSize="24px" alignSelf="center" color="#00FFC4">
        ↓
      </Box>
    </Flex>
  );
}

export { Arrow };
