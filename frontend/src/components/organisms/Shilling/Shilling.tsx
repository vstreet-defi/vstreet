import {
  Box,
  Image,
  Button,
  Stack,
  Text,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";

import LogoVaraWhite from "../../../assets/images/VaraStreetShilling.svg";
import shillingBg from "../../../assets/images/backgrounds/3. Vara shilling.svg";
import { link } from "fs";

function Shilling() {
  const navigate = useNavigate();
  return (
    <Box minW="100%" bgImage={shillingBg}>
      <Stack
        pl={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "15rem" }}
        pr={{ base: "1rem" }}
        align="center"
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
        direction={{ base: "column", md: "row" }}
      >
        <Stack flex={1} spacing={{ base: 5, md: 10 }}>
          <Image w="30rem" src={LogoVaraWhite} />
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: "column", sm: "row" }}
          >
            {/* <Button
              size="lg"
              fontWeight="normal"
              px={6}
              color="white"
              bgColor="transparent"
              border="1px"
              borderColor="#00FFC4"
              _hover={{ bg: "#00FFC4" }}
              onClick={() => navigate("/https://vara-network.io/")}
              borderRadius="0"
              ml={{ base: 0, md: "8rem" }}
            >
              Go to VARA
            </Button> */}
            <Box ml={{ base: "0", md: "12rem" }} alignSelf="center">
              <a
                href="https://vara-network.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ButtonGradientBorder text="Go to Vara" />
              </a>
            </Box>
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify="center"
          align="center"
          position="relative"
          w="full"
          pr={{ sm: "0", md: "8rem" }}
          textAlign={{ base: "center", md: "right" }}
        >
          <Box
            fontFamily={"'Roboto Mono', monospace"}
            mt={{ base: "4rem", md: "0" }}
          >
            <Box color="white" mb="2rem">
              <Heading
                fontFamily={"'Roboto Mono', monospace"}
                fontWeight="medium"
                fontSize="1.5rem"
                color="#4FFF4B"
              >
                High-Speed Transactions and Scalability
              </Heading>
              <Text fontWeight="100">
                Vara Network enhances DeFi with high transaction throughput and
                scalability. Its Gear Protocol&apos;s Actor model ensures rapid
                transactions at lower fees, addressing issues like network
                congestion effectively
              </Text>
            </Box>

            <Box color="white" mb="2rem">
              <Heading
                fontFamily={"'Roboto Mono', monospace"}
                fontWeight="medium"
                fontSize="1.5rem"
                color="#00FFC4"
              >
                Enhanced Security and Decentralization in DeFi
              </Heading>
              <Text fontWeight="100">
                Security and decentralization are key in Vara Network. The Actor
                model supports secure, independent operation of smart contracts,
                minimizing centralization risks and promoting complex
                decentralized applications
              </Text>
            </Box>

            <Box color="white" mb="2rem">
              <Heading color="#4FFF4B" fontWeight="medium" fontSize="1.5rem">
                Innovative Technology for Optimized Performance
              </Heading>
              <Text fontWeight="100">
                Vara Network&apos;s use of Persistent Memory and the WASM
                Virtual Machine optimizes performance, offering faster
                computations and efficient memory management, crucial for
                advanced financial services on the blockchain
              </Text>
            </Box>
          </Box>
        </Flex>
      </Stack>
    </Box>
  );
}

export { Shilling };
