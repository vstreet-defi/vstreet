import { Flex, Heading, Img } from "@chakra-ui/react";
import varaLogo from "../../../assets/images/Vara Network Grey.png";
import guardiansLogo from "../../../assets/images/Guardian-logo white-Grey.png";

function Partners() {
  return (
    <Flex
      flexDirection="row"
      border="1px"
      borderColor="#00FFC4"
      p="1rem"
      justify="space-around"
      bgColor="rgba(18, 18, 18, 0.74)"
      style={{
        backdropFilter: "blur(5.4px);",
        // background:
        //   "linear-gradient(27deg,rgba(18, 18, 18, 0.74) 0%,rgba(18, 18, 18, 0.742734593837535) 100%)",
      }}
    >
      <Img src={varaLogo}></Img>
      <Img src={guardiansLogo}></Img>
      <Img src={varaLogo}></Img>
      <Img src={guardiansLogo}></Img>
      <Img src={varaLogo}></Img>
      <Img src={guardiansLogo}></Img>
    </Flex>
  );
}

export { Partners };
