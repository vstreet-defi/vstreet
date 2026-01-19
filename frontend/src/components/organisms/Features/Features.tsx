import { Container, Box, Heading, Text, SimpleGrid, Stack } from "@chakra-ui/react";
import { CardFeatures } from "components/molecules/cards/CardFeatures";

type Props = {
  isMobile: boolean;
};

function Features({ isMobile }: Props) {
  return (
    <Container
      p="0"
      maxW="100vw"
      bg="var(--color-bg-main)"
      minH="100vh"
      display="flex"
      alignItems="center"
    >
      <Box
        w="100%"
        position="relative"
        py={{ base: 10, md: 20 }}
        px={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "12rem" }}
      >
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 12, xl: 20 }} alignItems="center">
          <Stack spacing={8}>
            <Heading
              bgGradient="var(--gradient-primary)"
              bgClip="text"
              fontSize={{ base: "2.5rem", sm: "4rem", lg: "56px" }}
              lineHeight="1.2"
              fontWeight="900"
              fontFamily={"'Roboto Mono', monospace"}
              textTransform="uppercase"
              letterSpacing="-1px"
            >
              Make your staked <br /> $VARA liquid
            </Heading>
            <Text
              fontSize={{ base: "1rem", lg: "20px" }}
              fontFamily={"'Inter', sans-serif"}
              fontWeight="400"
              color="var(--color-text-secondary)"
              lineHeight="1.6"
              maxW="700px"
            >
              Leverage your staked $VARA as collateral for stablecoin borrowing.
              Our streamlined platform offers secure, transparent lending,
              giving you the flexibility to enhance your investment strategies
              effectively.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <CardFeatures title="Stake Vara" />
            <CardFeatures title="LST $Vara as Collateral" />
            <CardFeatures title="Borrow Stable Coins" />
            <CardFeatures title="DeFi Strategy Legos" />
          </SimpleGrid>
        </SimpleGrid>
      </Box>
    </Container>
  );
}

export { Features };
