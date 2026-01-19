import { Flex, Text, Image, Box } from "@chakra-ui/react";
import logoVara from "../../../assets/images/vara-logo-teal.png";

export default function SecuredByVara() {
  return (
    <Box
      position="fixed"
      bottom="2rem"
      left="2rem"
      zIndex={10}
      cursor={"pointer"}
      onClick={() => window.open("https://vara.network/", "_blank")}
      transition="all 0.3s ease"
      _hover={{ transform: "scale(1.05)" }}
    >
      <Flex
        align="center"
        bg="rgba(18, 18, 21, 0.6)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(0, 255, 196, 0.3)"
        borderRadius="4px"
        p="10px 16px"
        gap={3}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: "-1px",
          left: "-1px",
          width: "8px",
          height: "8px",
          borderTop: "2px solid var(--color-primary)",
          borderLeft: "2px solid var(--color-primary)",
        }}
      >
        <Text
          fontSize="10px"
          color="var(--color-text-tertiary)"
          fontFamily="'Roboto Mono', monospace"
          textTransform="uppercase"
          letterSpacing="1px"
          fontWeight="bold"
        >
          Secured by
        </Text>
        <Image w="20px" src={logoVara} alt="Vara" filter="drop-shadow(0 0 5px rgba(0, 255, 196, 0.4))" />
      </Flex>
    </Box>
  );
}
