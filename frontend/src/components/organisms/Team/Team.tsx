import { Container, Flex, Heading, Img, Link, Text, Box, Stack, SimpleGrid } from "@chakra-ui/react";
import hubStyles from "../../molecules/cards/HubCard.module.scss";
import CornerAccent from "components/atoms/CornerAccent/CornerAccent";

import ivan from "../../../assets/images/team img/Ivan 1.png";
import luchex from "../../../assets/images/team img/Luchex 1.png";
import robin from "../../../assets/images/team img/Robin 1.png";
import rafael from "../../../assets/images/team img/Rafael 1.png";
import x from "../../../assets/images/socials/icon _x_.png";
import linkedin from "../../../assets/images/socials/icon _linkedin_.png";
import github from "../../../assets/images/socials/icon _github_.png";

const TeamMember = ({ name, role, img, socials }: { name: string, role: string, img: string, socials: any }) => (
  <Box
    className={hubStyles.hubCard}
    style={{ minHeight: "auto", padding: "32px" }}
  >
    <div className={hubStyles.glow} />
    <CornerAccent position="top-left" length={15} />
    <CornerAccent position="bottom-right" length={15} />

    <div className={hubStyles.content}>
      <Flex flexDir="column" align="center">
        <Box
          mb={6}
          boxSize="160px"
          bgImage={img}
          bgSize="cover"
          bgPos="center"
          border="2px solid rgba(0, 255, 196, 0.3)"
          borderRadius="4px" // Technical angular feel
          position="relative"
        />

        <Heading
          color="white"
          fontSize="24px"
          mb={1}
          fontFamily="Montserrat"
          fontWeight="bold"
        >
          {name}
        </Heading>

        <Text
          bgGradient="var(--gradient-primary)"
          bgClip="text"
          fontFamily={"'Roboto Mono', monospace"}
          fontWeight="700"
          fontSize="14px"
          textTransform="uppercase"
          letterSpacing="2px"
          mb={6}
        >
          {role}
        </Text>

        <Flex gap={6}>
          {socials.x && (
            <Link href={socials.x} isExternal _hover={{ opacity: 0.8 }}>
              <Img boxSize="1.5rem" src={x} alt="X" filter="brightness(0) invert(1)" />
            </Link>
          )}
          {socials.linkedin && (
            <Link href={socials.linkedin} isExternal _hover={{ opacity: 0.8 }}>
              <Img boxSize="1.5rem" src={linkedin} alt="LinkedIn" filter="brightness(0) invert(1)" />
            </Link>
          )}
          {socials.github && (
            <Link href={socials.github} isExternal _hover={{ opacity: 0.8 }}>
              <Img boxSize="1.5rem" src={github} alt="GitHub" filter="brightness(0) invert(1)" />
            </Link>
          )}
        </Flex>
      </Flex>
    </div>
  </Box>
);

/**
 * Team Section Component
 * Introduces the core contributors behind vStreet with social links and roles.
 */
function Team() {
  const team = [
    {
      name: "Luchex",
      role: "Tech Lead",
      img: luchex,
      socials: {
        x: "https://x.com/_luchex",
        linkedin: "https://www.linkedin.com/in/luciano-garcia-btc",
        github: "https://github.com/lucianog2000"
      }
    },
    {
      name: "Rafael Acuña",
      role: "Backend Lead",
      img: rafael,
      socials: {
        x: "https://x.com/Rafael_Acuna",
        linkedin: "https://www.linkedin.com/in/rafael-acuna/",
        github: "https://github.com/RafaelAcuna"
      }
    },
    {
      name: "Robin",
      role: "Frontend & PO",
      img: robin,
      socials: {
        x: "https://twitter.com/robinhodl69",
        linkedin: "https://www.linkedin.com/in/jaramillojesuslini/",
        github: "https://github.com/robinhodl69"
      }
    },
    {
      name: "Terratek",
      role: "Fullstack Dev",
      img: ivan,
      socials: {
        x: "https://twitter.com/IvanTerratek",
        linkedin: "https://www.linkedin.com/in/ivan-avila-4b5689202/",
        github: "https://github.com/TerratekMusic"
      }
    }
  ];

  return (
    <Container
      minW="100%"
      p="0"
      bg="var(--color-bg-main)"
      minH="100vh"
      display="flex"
      alignItems="center"
      id="team"
      position="relative"
      overflow="hidden"
    >
      {/* Background Decorations */}
      <div className="aura-glow aura-glow-primary top-right" />
      <div className="aura-glow aura-glow-secondary bottom-left" />
      <Stack spacing={16} position="relative" zIndex={1} px={{ base: 4, md: 8, xl: 24 }} w="100%" py={10}>
        <Flex flexDir="column" align="center">
          <Text
            fontFamily="'Roboto Mono', monospace"
            color="var(--color-primary)"
            fontSize="14px"
            fontWeight="bold"
            letterSpacing="4px"
            textTransform="uppercase"
            mb={2}
          >
            Behind the hub
          </Text>
          <Heading
            color="white"
            fontSize={{ base: "32px", md: "48px" }}
            fontWeight="900"
            fontFamily="Montserrat"
            textTransform="uppercase"
            letterSpacing="-1px"
          >
            Our Team
          </Heading>
          <Box w="60px" h="4px" bg="var(--gradient-primary)" mt={4} borderRadius="full" />
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} maxW="1400px" mx="auto">
          {team.map((member) => (
            <TeamMember key={member.name} {...member} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export { Team };
