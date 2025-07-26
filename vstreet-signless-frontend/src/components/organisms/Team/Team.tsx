import { Container, Flex, Heading, Image, Link, Text } from "@chakra-ui/react";
import teamBg from "../../../assets/images/backgrounds/5. Team.png";
import { BoxTranslucidGradient } from "../../atoms/Box-Translucid-Gradient/Box-Translucid-Gradient";

import ivan from "../../../assets/images/team img/Ivan 1.png";
import luchex from "../../../assets/images/team img/Luchex 1.png";
import robin from "../../../assets/images/team img/Robin 1.png";
import x from "../../../assets/images/socials/icon _x_.png";
import linkedin from "../../../assets/images/socials/icon _linkedin_.png";
import github from "../../../assets/images/socials/icon _github_.png";

function Team() {
  return (
    <Container
      bgImage={teamBg}
      bgRepeat="no-repeat"
      bgSize="cover"
      minW="100%"
      p="0"
      id="team"
    >
      <BoxTranslucidGradient />
      <Flex
        marginTop={{ base: "0", md: "2rem" }}
        mb="4rem"
        justify="center"
        flexDir="column"
      >
        <Heading
          alignSelf="center"
          sx={{
            textAlign: "center",
            color: "#4fff4b",
            fontFamily: "Inter",
            fontSize: "40px",
            fontStyle: "italic",
            fontWeight: "700",
            lineHeight: "77px",
            paddingBottom: "17px",
            backgroundImage:
              "linear-gradient(90deg, #00ffc4 -17.32%, #4fff4b 107.82%)",
            backgroundSize: "100% 11px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom",
            "@media screen and (max-width: 480px)": {
              width: "fit-content",
              marginTop: "3rem",
            },
          }}
        >
          Our Team
        </Heading>
      </Flex>
      <Flex
        justify="center"
        flexDirection={{ base: "column", sm: "column", md: "row" }}
        align={"center"}
      >
        <Flex
          flexDir="column"
          justify="center"
          m={{ base: "2rem", lg: "4rem" }}
        >
          <Flex
            mb="1rem"
            boxSize="10rem"
            bgImage={luchex}
            borderRadius={"100%"}
          ></Flex>
          <Heading color="white" textAlign="center" fontFamily="Montserrat">
            Luchex
          </Heading>
          <Text
            bgGradient="linear(to-b, #00FFC4, #4FFF4B)"
            bgClip="text"
            textAlign="center"
            fontFamily={"'Roboto Mono', monospace"}
          >
            Tech Lead
          </Text>
          <Flex mt="1rem" justify="space-between">
            <Link href="https://x.com/_luchex" isExternal>
              <Image boxSize="1.8rem" src={x} alt="link"></Image>
            </Link>
            <Link
              href="https://www.linkedin.com/in/luciano-garcia-btc"
              isExternal
            >
              <Image boxSize="1.8rem" src={linkedin} alt="link"></Image>
            </Link>
            <Link href="https://github.com/lucianog2000" isExternal>
              <Image boxSize="1.8rem" src={github} alt="link"></Image>
            </Link>
          </Flex>
        </Flex>

        <Flex
          flexDir="column"
          justify="center"
          m={{ base: "2rem", lg: "4rem" }}
        >
          <Flex
            mb="1rem"
            boxSize="10rem"
            bgImage={robin}
            borderRadius={"100%"}
          ></Flex>
          <Heading fontFamily="Montserrat" color="white" textAlign="center">
            Robin
          </Heading>
          <Text
            bgGradient="linear(to-b, #00FFC4, #4FFF4B)"
            bgClip="text"
            textAlign="center"
            fontFamily={"'Roboto Mono', monospace"}
          >
            Product Owner
          </Text>
          <Flex mt="1rem" justify="space-between">
            <Link href="https://twitter.com/robinhodl69" isExternal>
              <Image boxSize="1.8rem" src={x} alt="link"></Image>
            </Link>
            <Link
              href="https://www.linkedin.com/in/jaramillojesuslini/"
              isExternal
            >
              <Image boxSize="1.8rem" src={linkedin} alt="link"></Image>
            </Link>
            <Link href="https://github.com/robinhodl69" isExternal>
              <Image boxSize="1.8rem" src={github} alt="link"></Image>
            </Link>
          </Flex>
        </Flex>

        <Flex
          flexDir="column"
          justify="center"
          m={{ base: "2rem", lg: "4rem" }}
        >
          <Flex
            mb="1rem"
            boxSize="10rem"
            bgImage={ivan}
            borderRadius={"100%"}
            alignSelf="center"
          ></Flex>
          <Heading fontFamily="Montserrat" color="white" textAlign="center">
            Terratek
          </Heading>
          <Text
            bgGradient="linear(to-b, #00FFC4, #4FFF4B)"
            bgClip="text"
            textAlign="center"
            fontFamily={"'Roboto Mono', monospace"}
          >
            UI/UX & Developer
          </Text>
          <Flex mt="1rem" justify="space-between">
            <Link href="https://twitter.com/IvanTerratek" isExternal>
              <Image boxSize="1.8rem" src={x} alt="link"></Image>
            </Link>
            <Link
              href="https://www.linkedin.com/in/ivan-avila-4b5689202/"
              isExternal
            >
              <Image boxSize="1.8rem" src={linkedin} alt="link"></Image>
            </Link>
            <Link href="https://github.com/TerratekMusic" isExternal>
              <Image boxSize="1.8rem" src={github} alt="link"></Image>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}

export { Team };
