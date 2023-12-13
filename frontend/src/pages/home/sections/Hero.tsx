import {
  Container,
  Stack,
  Flex,
  Box,
  Text,
  Button,
  Image,
} from "@chakra-ui/react";
import { Blocknumber } from "components/gear/blockNumber";
import { useNavigate } from "react-router-dom";

import Gusano from "../../../assets/images/3d Swirl Shape.svg";
import LogoWhite from "../../../assets/images/vara street logoHOMEWhite.svg";

function Hero() {
  const navigate = useNavigate();

  return (
    <Container p="0" maxW="100vw" bgGradient="linear(to-l, #121215 ,#284736)">
      <Box w="100vw" bgImg={Gusano} bgRepeat="no-repeat" bgPos="center">
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
                color="black"
                bgGradient="linear(to-l, #00FFC4 ,#4FFF4B)"
                _hover={{ bg: "gray.200" }}
                onClick={() => navigate("/Dapp")}
              >
                Go to Dapp
              </Button>
              <Button
                size="lg"
                fontWeight="normal"
                px={6}
                // leftIcon={<PlayIcon h={4} w={4} color='gray.300'/>}
              >
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
          >
            {/* <Blob
            w='150%'
            h='150%'
            position='absolute'
            top='-20%'
            left={0}
            zIndex={-1}
            color={useColorModeValue('red.50', 'red.400')}
          /> */}
            {/* <Box
            position='relative'
            height='300px'
            rounded='2xl'
            boxShadow='2xl'
            width='full'
            overflow='hidden'>
            <IconButton
              aria-label='Play Button'
              variant='ghost'
              _hover={{ bg: 'transparent' }}
              // icon={<PlayIcon w={12} h={12} />}
              size='lg'
              color='white'
              position='absolute'
              left='50%'
              top='50%'
              transform='translateX(-50%) translateY(-50%)'
            />
            <Image
              alt='Hero Image'
              fit='cover'
              align='center'
              w='100%'
              h='100%'
              src={Gusano}
              
            />
          </Box> */}
          </Flex>
        </Stack>
      </Box>
    </Container>
  );
}

export { Hero };
