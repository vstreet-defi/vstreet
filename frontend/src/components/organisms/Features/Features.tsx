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
            <Text
              color="gray.100"
              fontWeight="light"
              fontSize={{ base: "1xl", sm: "3xl", lg: "4xl" }}
            >
              Unlock the synthetic assets liquidity to optimize your DeFi
              strategies
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
            >
              <Text>Hola Mundo</Text>
              Go to Dapp
              <Text>Hola Mundo</Text>
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify="center"
            align="center"
            position="relative"
            w="full"
          >
            <Heading
            
            >Make your staked $VARA liquid</Heading>
            <Text>
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
