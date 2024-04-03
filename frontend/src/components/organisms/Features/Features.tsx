import { Container, Flex, Box, Heading, Text, Stack } from "@chakra-ui/react";
import { CardFeatures } from "components/molecules/cards/CardFeatures";
import bg from "../../../assets/images/backgrounds/Services BG 2x.svg";

function Features() {
  return (
    <Container p="0" maxW="100vw" bgGradient="linear(to-l, #121215 ,#284736)">
      <Box w="100vw" bgImg={bg} bgRepeat="no-repeat" bgPos="center">
        <Stack
          pl={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "15rem" }}
          pr={{ base: "1rem" }}
          align="center"
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Stack spacing={{ base: 4, sm: 6 }} direction="column">
              <CardFeatures title="Stake Vara" />
              <CardFeatures title="LST $Vara as Collateral" />
              <CardFeatures title="Borrow Stable Coins" />
              <CardFeatures title="Stake Vara" />
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify="center"
            align="center"
            position="relative"
            w="full"
            flexDir="column"
          >
            <Heading
              bgGradient="linear(to-b, #00FFC4, #4FFF4B)"
              bgClip="text"
              fontSize={{ base: "4rem", sm: "5rem", lg: "48px" }}
              fontWeight="extrabold"
              fontFamily={"'Roboto Mono', monospace"}
            >
              Make your staked $VARA liquid
            </Heading>
            <Text color="#ffffff" mr="2rem" mt="2rem" fontSize="24px">
              Leverage your staked $VARA as collateral for stablecoin borrowing.
              Our streamlined platform offers secure, transparent lending,
              giving you the flexibility to enhance your investment strategies
              effectively.
            </Text>
          </Flex>
        </Stack>
      </Box>
    </Container>
  );
}

export { Features };
