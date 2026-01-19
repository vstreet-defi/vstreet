import React from "react";
import {
  Box,
  Image,
  Stack,
  Text,
  Flex,
  Container,
  Button,
} from "@chakra-ui/react";
import LogoVaraWhite from "../../../assets/images/Powered-by-vara.png";
import hubStyles from "../../molecules/cards/HubCard.module.scss";
import CornerAccent from "components/atoms/CornerAccent/CornerAccent";
import { RiFlashlightLine, RiShieldCheckLine, RiCpuLine } from "react-icons/ri";

/**
 * Shilling Section Component
 * Highlights the partnership with Vara Network and key technical advantages
 * of the underlying infrastructure.
 */
function Shilling() {
  const specs = [
    {
      title: "High-Speed Transactions",
      content:
        "Vara's Gear Protocol ensures rapid transactions at lower fees, eliminating network congestion.",
      icon: RiFlashlightLine,
      accent: "var(--color-secondary)",
    },
    {
      title: "Enhanced Security",
      content:
        "The Actor model enables secure, independent smart contract operation with minimal centralization risks.",
      icon: RiShieldCheckLine,
      accent: "var(--color-primary)",
    },
    {
      title: "Innovative Technology",
      content:
        "Persistent Memory and WASM VM optimize performance for advanced financial services.",
      icon: RiCpuLine,
      accent: "var(--color-secondary)",
    },
  ];

  return (
    <Box
      minH="100vh"
      minW="100%"
      bg="var(--color-bg-main)"
      position="relative"
      display="flex"
      alignItems="center"
      py={{ base: 10, md: 20 }}
      overflow="hidden"
    >
      {/* Background Aesthetic Layers */}
      <div className="technical-grid" />
      <div className="aura-glow aura-glow-secondary top-right" />
      <div className="aura-glow aura-glow-primary bottom-left" />

      <Container
        maxW="100vw"
        px={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "12rem" }}
        position="relative"
        zIndex={1}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 12, lg: 20 }}
          align="center"
        >
          {/* Main Branding Information */}
          <Stack
            flex={1}
            spacing={8}
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
          >
            <Image
              src={LogoVaraWhite}
              alt="Powered by Vara"
              maxW={{ base: "200px", md: "300px" }}
              filter="drop-shadow(0 0 15px rgba(0, 255, 196, 0.2))"
            />

            <Text
              fontFamily="'Inter', sans-serif"
              color="var(--color-text-secondary)"
              fontSize="18px"
              lineHeight="1.7"
              maxW="500px"
            >
              vStreet is built on Vara Network, leveraging next-generation
              blockchain technology for unparalleled DeFi performance.
            </Text>

            <Button
              bg="transparent"
              border="1px solid var(--color-primary)"
              color="var(--color-primary)"
              _hover={{
                bg: "rgba(0, 255, 196, 0.1)",
                transform: "translateY(-2px)",
              }}
              borderRadius="8px"
              height="48px"
              px={8}
              fontSize="0.9rem"
              fontWeight="700"
              fontFamily="'Montserrat', sans-serif"
              textTransform="uppercase"
              letterSpacing="1px"
              onClick={() => window.open("https://vara.network/", "_blank")}
            >
              Explore Vara
            </Button>
          </Stack>

          {/* Right Column: Specs (HubCard Style) */}
          <Stack flex={1} spacing={6} w="100%">
            {specs.map((spec, index) => {
              return (
                <Box
                  key={index}
                  className={hubStyles.hubCard}
                  style={{ minHeight: "auto", padding: "24px" }}
                >
                  <div className={hubStyles.glow} />
                  <CornerAccent position="top-left" length={15} />
                  <CornerAccent position="bottom-right" length={15} />

                  <div className={hubStyles.content}>
                    <Flex align="center" gap={4} mb={3}>
                      <Box
                        className={hubStyles.iconWrapper}
                        style={{ fontSize: "24px", color: spec.accent }}
                      >
                        {React.createElement(spec.icon as any)}
                      </Box>
                      <Text
                        fontFamily="'Montserrat', sans-serif"
                        fontSize="12px"
                        fontWeight="800"
                        color="#fff"
                        textTransform="uppercase"
                        letterSpacing="-0.5px"
                      >
                        {spec.title}
                      </Text>
                    </Flex>
                    <Text
                      fontFamily="'Inter', sans-serif"
                      fontSize="14px"
                      color="var(--color-text-secondary)"
                      lineHeight="1.6"
                    >
                      {spec.content}
                    </Text>
                  </div>
                </Box>
              );
            })}
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}

export { Shilling };
