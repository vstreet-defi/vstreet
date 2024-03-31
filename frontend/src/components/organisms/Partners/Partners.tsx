import { Flex, Heading } from "@chakra-ui/react";

function Partners() {
  return (
    <Flex
      flexDirection="row"
      border="1px"
      borderColor="#00FFC4"
      p="1rem"
      bgColor="#1B1B1F"
      h="4rem"
      justify="space-around"
    >
      <Heading
        color="gray.500"
        fontSize={{ base: ".8rem", sm: "1rem", md: "1.5rem" }}
      >
        Vara Network
      </Heading>
      <Heading
        color="gray.500"
        fontSize={{ base: ".8rem", sm: "1rem", md: "1.5rem" }}
      >
        Vara Network
      </Heading>
      <Heading
        color="gray.500"
        fontSize={{ base: ".8rem", sm: "1rem", md: "1.5rem" }}
      >
        Vara Network
      </Heading>
    </Flex>
  );
}

export { Partners };
