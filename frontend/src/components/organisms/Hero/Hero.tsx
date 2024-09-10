import {
  Container,
  Stack,
  Flex,
  Box,
  Text,
  Button,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
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
              Unlock the derivative tokens liquidity to optimize your DeFi
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
        </Stack>
      </Box>
    </Container>
  );
}

export { Hero };
