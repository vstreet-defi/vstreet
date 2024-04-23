import { Flex } from "@chakra-ui/react";

function BoxTranslucidGradient() {
  return (
    <Flex
      w="100%"
      flexDirection="row"
      border="1px"
      h="4rem"
      p="1rem"
      justify="space-around"
      bgColor="rgba(18, 18, 18, 0.74)"
      style={{
        backdropFilter: "blur(5.4px)",
        borderImage: "linear-gradient(141deg, rgb(0, 255, 196), #4fff4b) 1",
      }}
    ></Flex>
  );
}

export { BoxTranslucidGradient };
