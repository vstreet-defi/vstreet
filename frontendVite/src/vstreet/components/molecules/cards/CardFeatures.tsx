import { Box, Flex, Text } from "@chakra-ui/react";
import styles from "./Card.module.scss";

function CardFeatures(props: { title: string }) {
  return (
    <Flex flexDir="column">
      <Box
        m={{ base: ".5rem", sm: "1rem", md: "2rem" }}
        borderWidth="1px"
        pt="1rem"
        pb="1rem"
        pl={"2rem"}
        pr={"2rem"}
        className={styles.CardFeature}
        style={{
          boxShadow: "0px 14px 25.4px -3px rgba(59, 255, 106, 0.52)",
          backdropFilter: "blur(5.449999809265137px)",
        }}
        justifyItems="center"
      >
        <Text
          fontSize={{ lg: "24px" }}
          fontWeight={"500"}
          color="#00FFC4"
          fontFamily={"'Roboto Mono', monospace"}
          alignSelf="center"
          justifyContent={"center"}
        >
          {props.title}
        </Text>
      </Box>
    </Flex>
  );
}

export { CardFeatures };
