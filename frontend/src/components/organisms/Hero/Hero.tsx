import {
  Container,
  Stack,
  Flex,
  Box,
  Text,
  Button,
  Heading,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logoVara from "../../../assets/images/vara-logo-teal.png";
import Flag from "components/atoms/Flag";
import Home1VideoBgSmall from "../../../assets/images/backgrounds/Home-Gif-WebComp1280x741-12fps.gif";

type Props = {
  isMobile: boolean;
};

function Hero({ isMobile }: Props) {
  const navigate = useNavigate();

  return (
    <Container p="0" minW="100%">
      <Box
        w="100%"
        h={"100%"}
        bgRepeat="no-repeat"
        bgPos="bottom"
        bgSize={{ base: "cover", md: "fill" }}
        // bgImage={{ base: Home1VideoBgSmall, md: Home1VideoBg }}
        bgImage={Home1VideoBgSmall}
      >
        <Stack
          pl={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "12rem" }}
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
              fontSize={{
                base: "4rem",
                sm: "5rem",
                lg: "78px",
                xl: "100px",
                "2xl": "128px",
              }}
              fontWeight="extrabold"
              fontFamily={"'Roboto Mono', monospace"}
            >
              VARA <br></br> DeFi-Hub
            </Heading>

            <Text
              fontWeight="400px"
              color="#FFF"
              fontSize={{ base: "1rem", sm: "1rem", lg: "24px" }}
              fontFamily={"'Roboto Mono', monospace"}
              mr={{ base: "0", md: "0rem", lg: "2rem", xl: "6rem" }}
            >
              Unlock the synthetic assets liquidity to optimize your DeFi
              strategies
            </Text>
            {!isMobile && (
              <>
                <Stack
                  display={"flex"}
                  flexDirection={{ sm: "row", base: "column" }}
                  gap={"172px"}
                  paddingLeft={"36px"}
                  marginBottom={"-30px"}
                  marginTop={"36px"}
                >
                  <Flag text="Coming Soon" />
                  <Flag text="Coming Soon" />
                </Stack>
                <Stack
                  spacing={{ base: 4, sm: 6 }}
                  direction={{ base: "column", sm: "row" }}
                >
                  <Button
                    borderRadius="0"
                    size="lg"
                    fontWeight="bold"
                    px={6}
                    color="#111111"
                    bgGradient="linear(to-r, #00FFC4 ,#4FFF4B)"
                    _hover={{ bg: "gray.200" }}
                    onClick={() => navigate("/dapp")}
                    isDisabled={true}
                  >
                    Launch App
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="white"
                    color="white"
                    borderRadius="0"
                    size="lg"
                    fontWeight="bold"
                    px={6}
                    isDisabled={true}
                  >
                    Whitepaper
                  </Button>
                </Stack>
                <Flex justify="flex-end" w="100%">
                  <Flex
                    style={{
                      borderColor: "rgb(0, 255, 196), 0.5",
                      borderWidth: ".05px",
                      borderRadius: "1rem",
                    }}
                    p="1rem"
                    pr=".5rem"
                    w="7.2rem"
                    bgColor="black"
                    mr="4rem"
                  >
                    <Text fontSize="12px" color="white">
                      Secured by
                    </Text>
                    <Image ml=".2rem" w="1.5rem" src={logoVara}></Image>
                  </Flex>
                  {/* Color Version */}
                  {/* <Flex
                    style={{
                      borderColor: "black",
                      borderWidth: ".05px",
                      borderRadius: "1rem",
                    }}
                    p="1rem"
                    pr=".5rem"
                    w="7.2rem"
                    bgColor="#00FFC4"
                    mr="4rem"
                  >
                    <Text fontWeight="600" fontSize="12px" color="black">
                      Secured by
                    </Text>
                    <Image ml=".2rem" w="1.5rem" src={logoVara}></Image>
                  </Flex> */}
                </Flex>
              </>
            )}
            {isMobile && (
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: "column", sm: "row" }}
                marginTop={"20px"}
              >
                <Flex justifyContent={"center"}>
                  <Flag text="Coming Soon" />
                </Flex>
                <Button
                  borderRadius="0"
                  size="lg"
                  fontWeight="bold"
                  px={6}
                  color="#111111"
                  bgGradient="linear(to-r, #00FFC4 ,#4FFF4B)"
                  _hover={{ bg: "gray.200" }}
                  onClick={() => navigate("/dapp")}
                  isDisabled={true}
                  marginBottom={"10px"}
                >
                  Launch App
                </Button>
                <Flex justifyContent={"center"}>
                  <Flag text="Coming Soon" />
                </Flex>
                <Button
                  variant="outline"
                  colorScheme="white"
                  color="white"
                  borderRadius="0"
                  size="lg"
                  fontWeight="bold"
                  px={6}
                  isDisabled={true}
                  marginBottom={"10px"}
                >
                  Whitepaper
                </Button>
              </Stack>
            )}
          </Stack>

          <Flex
            style={{
              borderColor: "rgb(0, 255, 196), 0.5",
              borderWidth: ".05px",
              borderRadius: "1rem",
            }}
            p="1rem"
            pr=".5rem"
            w="7.2rem"
            bgColor="black"
            mr="1rem"
            alignSelf="flex-end"
          >
            <Text fontSize="12px" color="white">
              Secured by
            </Text>
            <Image ml=".2rem" w="1.5rem" src={logoVara}></Image>
          </Flex>
        </Stack>
      </Box>
    </Container>
  );
}

export { Hero };
