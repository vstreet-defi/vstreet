import { Container, Stack, Box, Button, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CPUCityScene } from "../../visuals/CPUCityScene";
import styles from "./Hero.module.scss";

type Props = {
  isMobile: boolean;
};

/**
 * Hero Section Component
 * Displays the main value proposition, primary CTA (Launch App),
 * and an immersive 3D background scene.
 */
function Hero({ isMobile }: Props) {
  const navigate = useNavigate();

  return (
    <Container
      p="0"
      minW="100%"
      className={styles.hero}
      minH="100vh"
      display="flex"
      alignItems="center"
    >
      {/* Immersive 3D Experience Layer */}
      <Box className={styles.threeBg}>
        <CPUCityScene />
      </Box>

      {/* Aesthetic Design Elements (Glows) */}
      <div className="aura-glow aura-glow-primary top-right" />
      <div className="aura-glow aura-glow-secondary bottom-left" />

      <Box w="100%" h={"100%"} position="relative" zIndex={1}>
        <Stack
          pl={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "12rem" }}
          pr={{ base: "1rem" }}
          align="center"
          spacing={{ base: 8, md: 10 }}
          py={{ base: 10, md: 20 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              className={styles.heading}
              color="white"
              fontSize={{ base: "2rem", md: "2.8rem", lg: "3.2rem" }}
              fontWeight="900"
              fontFamily={"'Montserrat', sans-serif"}
              lineHeight="1"
              letterSpacing="-1px"
              textTransform="uppercase"
            >
              vStreet
            </Heading>

            <Heading
              as="h2"
              fontWeight="400"
              color="var(--color-text-secondary)"
              fontSize={{ base: "1rem", sm: "1.2rem", lg: "22px" }}
              fontFamily={"'Inter', sans-serif"}
              mr={{ base: "0", md: "0rem", lg: "2rem", xl: "6rem" }}
              maxW="850px"
              lineHeight="1.6"
            >
              Scale your assets on the most advanced financial engine in Vara
              the network.
            </Heading>

            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
              align="center"
              justify={{ base: "center", md: "flex-start" }}
            >
              <Button
                bg="var(--color-primary)"
                color="#0D0D10"
                _hover={{
                  bg: "var(--color-secondary)",
                  transform: "translateY(-2px)",
                }}
                borderRadius="8px"
                height="44px"
                px={8}
                fontSize="0.9rem"
                fontWeight="700"
                fontFamily="'Montserrat', sans-serif"
                textTransform="uppercase"
                letterSpacing="1px"
                onClick={() => navigate("/dapp")}
                w={{ base: "100%", sm: "auto" }}
              >
                Launch App
              </Button>

              <Button
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.2)",
                  transform: "translateY(-2px)",
                }}
                borderRadius="8px"
                height="44px"
                px={8}
                fontSize="0.9rem"
                fontWeight="700"
                fontFamily="'Montserrat', sans-serif"
                textTransform="uppercase"
                letterSpacing="1px"
                isDisabled={true}
                w={{ base: "100%", sm: "auto" }}
              >
                Whitepaper
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}

export { Hero };
