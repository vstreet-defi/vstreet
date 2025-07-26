import { Flex, Image } from "@chakra-ui/react";
import varaLogo from "../../../assets/images/Vara-Network-Logo.png";
import guardiansLogo from "../../../assets/images/Guardianlogo-blanco.png";
function Partners() {
  return (
    <Flex
      flexDirection="row"
      border="1px"
      p="1rem"
      justify="space-around"
      bgColor="rgba(18, 18, 18, 0.74)"
      style={{
        backdropFilter: "blur(5.4px)",
        borderImage: "linear-gradient(141deg, rgb(0, 255, 196), #4fff4b) 1",
      }}
    >
      <Image opacity="50%" h="3.5rem" src={varaLogo}></Image>
      <Image opacity="50%" h="3.5rem" src={guardiansLogo}></Image>
      <Image opacity="50%" h="3.5rem" src={varaLogo}></Image>
      <Image opacity="50%" h="3.5rem" src={guardiansLogo}></Image>
      <Image opacity="50%" h="3.5rem" src={varaLogo}></Image>
      <Image opacity="50%" h="3.5rem" src={guardiansLogo}></Image>
    </Flex>
  );
}

export { Partners };
