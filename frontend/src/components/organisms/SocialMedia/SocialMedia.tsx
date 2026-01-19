import React from "react";
import { Box, Container, Flex, Heading, Image, Stack, Text } from "@chakra-ui/react";
import xIcon from "../../../assets/images/icons/x-social-media-white-icon.png";
import discordIcon from "../../../assets/images/icons/discord-icon.png";
import linkedinIcon from "../../../assets/images/icons/linkedin-icon.png";
import githubIcon from "../../../assets/images/icons/github-icon.png";
import "./SocialMedia.scss";

const socialMediaLinks = [
  {
    icon: xIcon,
    alt: "x-icon",
    url: "https://twitter.com/vstreet_io",
  },
  {
    icon: discordIcon,
    alt: "discord-icon",
    url: "https://discord.gg/jBMqWd8kET",
  },
  {
    icon: linkedinIcon,
    alt: "linkedin-icon",
    url: "https://www.linkedin.com/in/vstreet-de-fi-615449304/",
  },
  {
    icon: githubIcon,
    alt: "github-icon",
    url: "https://github.com/vstreet-defi/vstreet",
  },
];

/**
 * Social Media Section Component
 * Provides links to the protocol's official community channels.
 */
function SocialMedia() {
  return (
    <Container
      maxW="100%"
      minH="100vh"
      bg="var(--color-bg-main)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      id="social"
      py={{ base: 20, md: 0 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background Decorations */}
      <div className="technical-grid" />
      <div className="aura-glow aura-glow-secondary top-right" />
      <div className="aura-glow aura-glow-primary bottom-left" />
      <Stack
        spacing={12}
        align="center"
        textAlign="center"
        maxW="800px"
        px={4}
      >
        <Stack spacing={4} align="center">
          <Text
            fontFamily="'Roboto Mono', monospace"
            color="var(--color-primary)"
            fontSize="14px"
            fontWeight="bold"
            letterSpacing="4px"
            textTransform="uppercase"
          >
            Stay Connected
          </Text>
          <Heading
            color="white"
            fontSize={{ base: "32px", md: "48px" }}
            fontWeight="900"
            fontFamily="Montserrat"
            textTransform="uppercase"
            letterSpacing="-1px"
          >
            Follow Us
          </Heading>
          <Box w="60px" h="4px" bg="var(--gradient-primary)" borderRadius="full" />
        </Stack>

        <Text
          color="var(--color-text-secondary)"
          fontSize={{ base: "16px", md: "20px" }}
          fontFamily="'Inter', sans-serif"
          lineHeight="1.6"
          maxW="600px"
        >
          Engage with a community of sophisticated web3 investors and create smart
          DeFi strategies on top of the fastest blockchain.
        </Text>

        <Flex
          gap={{ base: 8, md: 12 }}
          flexWrap="wrap"
          justify="center"
          align="center"
        >
          {socialMediaLinks.map(({ icon, alt, url }) => (
            <Box
              key={alt}
              as="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                filter: "drop-shadow(0 0 10px var(--color-primary))",
              }}
              cursor="pointer"
            >
              <Image
                src={icon}
                alt={alt}
                boxSize={{ base: "60px", md: "80px" }}
                objectFit="contain"
              />
            </Box>
          ))}
        </Flex>
      </Stack>
    </Container>
  );
}

export default SocialMedia;
