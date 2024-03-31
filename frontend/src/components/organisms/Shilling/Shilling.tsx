import {
  Box,
  Image,
  Button,
  Stack,
  Text,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import bgShilling from "../../../assets/images/backgrounds/Vara shillingBG.svg";
import LogoVaraWhite from "../../../assets/images/VaraStreetShilling.svg";

function Shilling() {
  const navigate = useNavigate();
  return (
    <Box minW="100vw" bgImage={bgShilling}>
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
          {/* <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}>
  
  
            <Text
              as='span'
              position='relative'
              _after={{
                content: "''",
                width: 'full',
                height: '30%',
                position: 'absolute',
                bottom: 1,
                left: 0,
                bg: 'red.400',
                zIndex: -1,
              }}>
              Write once,
            </Text>
            <br />
            <Text as='span' color='red.400'>
              use everywhere!
            </Text>
          </Heading> */}
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
              color="white"
              bgColor="transparent"
              border="1px"
              borderColor="#00FFC4"
              _hover={{ bg: "#00FFC4" }}
              onClick={() => navigate("/https://vara-network.io/")}
            >
              Go to VARA
            </Button>
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify="center"
          align="center"
          position="relative"
          w="full"
        >
          <Box>
            <Box color="white" mb="2rem">
              <Heading fontWeight="medium" fontSize="1.5rem">
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
              <Heading fontWeight="medium" fontSize="1.5rem">
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
              <Heading fontWeight="medium" fontSize="1.5rem">
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
