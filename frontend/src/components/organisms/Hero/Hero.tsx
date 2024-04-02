import {
  Container,
  Stack,
  Flex,
  Box,
  Text,
  Button,
  Image,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import LogoWhite from "../../../assets/images/vara street logoHOMEWhite.svg";
import Home1VideoBg from "../../../assets/images/backgrounds/Home-Gif-128colorsWebComp1728-12fps.gif";
import Home1VideoBgSmall from "../../../assets/images/backgrounds/Home-Gif-WebComp1280x741-12fps.gif";
function Hero() {
  const navigate = useNavigate();

  return (
    <Container p="0" maxW="100vw">
      <Box
        w="100vw"
        h={{ base: "100vh", md: "100vh" }}
        bgRepeat="no-repeat"
        bgPos="bottom"
        bgSize={{ base: "cover", md: "fill" }}
        bgImage={{ base: Home1VideoBgSmall, md: Home1VideoBg }}
      >
        <Stack
          pl={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "15rem" }}
          pr={{ base: "1rem" }}
          align="center"
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              bgGradient="linear(to-b, #00FFC4, #4FFF4B)"
              bgClip="text"
              fontSize={{ base: "4rem", sm: "5rem", lg: "128px" }}
              fontWeight="extrabold"
              fontFamily={"'Roboto Mono', monospace"}
            >
              VARA <br></br> DEFI-HUB
            </Heading>

            <Text
              color="gray.100"
              fontWeight="light"
              fontSize={{ base: "1rem", sm: "1rem", lg: "24px" }}
              fontFamily={"'Roboto Mono', monospace"}
            >
              Unlock the synthetic assets liquidity to optimize your DeFi
              strategies
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
            >
              <Button
                size="lg"
                fontWeight="normal"
                px={6}
                color="black"
                bgGradient="linear(to-l, #00FFC4 ,#4FFF4B)"
                _hover={{ bg: "gray.200" }}
                onClick={() => navigate("/Dapp")}
              >
                Go to Dapp
              </Button>
              <Button size="lg" fontWeight="normal" px={6}>
                How It Works
              </Button>
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify="center"
            align="center"
            position="relative"
            w="full"
          ></Flex>
        </Stack>
      </Box>
    </Container>
  );
}

export { Hero };
