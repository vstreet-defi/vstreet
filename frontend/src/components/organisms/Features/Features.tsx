import { Container, Flex, Box, Heading, Text } from "@chakra-ui/react";
import { CardFeatures } from "components/molecules/cards/CardFeatures";
import bg from "../../../assets/images/backgrounds/FeaturesBG.svg";

function Features() {
  return (
    <Container
      minW="100vw"
      bgImage={bg}
      bgRepeat="no-repeat"
      bgSize="cover"
      pt="10rem"
      pb="10rem"
    >
      <Box ml="2rem" textAlign="center" position="relative">
        <Text
          left={{ lg: "34rem", xl: "38rem", "2xl": "42rem" }}
          position="absolute"
          top="-5.5rem"
          color="white"
          fontWeight="200"
          fontSize="5rem"
        >
          DEFI
        </Text>
        <Heading
          left={{ lg: "41rem", xl: "45rem", "2xl": "49rem" }}
          position="absolute"
          top="0rem"
          color="white"
          fontWeight="700"
        >
          Services
        </Heading>
      </Box>
      <Flex
        mt="4rem"
        justify="center"
        flexDirection={{ base: "column", sm: "column", md: "row" }}
      >
        <CardFeatures
          title="Lending"
          description="Leverage your synthetic assets as collateral for stablecoin borrowing. Our streamlined platform offers secure, transparent lending, giving you the flexibility to enhance your investment strategies effectively."
        />
        <CardFeatures
          title="Options Trading"
          description="Limit Orders, Puts, and Calls Navigate the complexities of DeFi options trading with ease. Our platform simplifies limit orders, puts, and calls, making advanced trading strategies accessible to all levels of traders."
        />
        <CardFeatures
          title="Copy Trading"
          description="Replicate the strategies of top DeFi traders in real-time. Our on-chain copy trading service allows you to mirror successful trades, offering a straightforward way to potentially boost your portfolio's performance."
        />
      </Flex>
    </Container>
  );
}

export { Features };
