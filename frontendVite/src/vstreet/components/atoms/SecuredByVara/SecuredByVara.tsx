import { Flex, Text, Image } from "@chakra-ui/react";
import logoVara from "../../../assets/images/vara-logo-teal.png";

export default function SecuredByVara() {
  return (
    <>
      <Flex
        justify="flex-end"
        w="100%"
        position="fixed"
        bottom="1rem"
        right="1rem"
        zIndex={3}
        cursor={"pointer"}
        onClick={() => window.open("https://vara.network/", "_blank")}
      >
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
        >
          <Text fontSize="12px" color="white">
            Secured by
          </Text>
          <Image ml=".2rem" w="1.5rem" src={logoVara}></Image>
        </Flex>
      </Flex>
    </>
  );
}
