import { Box, Flex, Heading, Image, Link, Text } from "@chakra-ui/react";
import BgFooter from "../../../assets/images/Liquid Footer.svg";
import socialsImage from "../../../assets/images/social imgNOBG_WHite.svg";
import logo from "../../../assets/images/vara street logoNAVCOLOR.svg";

function Footer() {
  function click() {
    console.log("social media");
  }
  return (
    <Box bgImage={BgFooter} h="10rem" bgSize="cover" bgRepeat="no-repeat">
      <Flex justify="space-between" p="1rem">
        <Box>
          <Image m="1rem" w="5rem" src={logo} />
          <Text m="1rem">Guadalajara, México</Text>
          <Image
            // onClick={click}
            alignSelf="center"
            m="1rem"
            w="10rem"
            src={socialsImage}
          />
        </Box>
        <Flex flexDir="column" m="1rem">
          <Link color="white" href="https://vara.network/">
            Docs
          </Link>
          <Link color="white" href="https://vara.network/">
            Jobs
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}

export { Footer };
