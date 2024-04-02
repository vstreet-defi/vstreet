import {
  Container,
  Stack,
  Flex,
  Box,
  Text,
  Button,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import Gusano from "../../../assets/images/3d Swirl Shape.svg";
import LogoWhite from "../../../assets/images/vara street logoHOMEWhite.svg";
import Home1VideoBg from "../../../assets/images/backgrounds/Hero Home 1.gif";

function Hero() {
  const navigate = useNavigate();

  return (
    // <Box h="35rem">
    <Container p="0" maxW="100vw">
      {/* <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "fill",

            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <source src={Home1VideoBg} type="video/mp4" />
        </video> */}
      {/* bgGradient="linear(to-l, #121215 ,#284736)" */}
      <Box
        w="100vw"
        bgRepeat="no-repeat"
        bgPos="center"
        bgSize={{ base: "cover", md: "fill" }}
        bgImage={Home1VideoBg}
        // style={{
        //   position: "absolute",
        //   top: "10rem",
        // }}
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
            <Image w="30rem" src={LogoWhite} />

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
    // </Box>
  );
}

export { Hero };
