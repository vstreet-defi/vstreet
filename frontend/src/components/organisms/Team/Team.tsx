import { Container, Flex } from "@chakra-ui/react";
import teamBg from "../../../assets/images/backgrounds/5. Team.png";

function Team() {
  return (
    <Container bgImage={teamBg} minW="100%" p={"2rem"}>
      <Flex
        justify="center"
        flexDirection={{ base: "column", sm: "column", md: "row" }}
        align={"center"}
      >
        <Flex
          m={{ base: "2rem", lg: "4rem" }}
          boxSize="10rem"
          bgColor="white"
          borderRadius={"100%"}
        ></Flex>
        <Flex
          m={{ base: "2rem", lg: "4rem" }}
          boxSize="10rem"
          bgColor="white"
          borderRadius={"100%"}
        ></Flex>
        <Flex
          m={{ base: "2rem", lg: "4rem" }}
          boxSize="10rem"
          bgColor="white"
          borderRadius={"100%"}
        ></Flex>
      </Flex>
    </Container>
  );
}

export { Team };
