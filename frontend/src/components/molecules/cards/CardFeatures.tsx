import { Box, Flex, Text } from "@chakra-ui/react";
import styles from "./Card.module.scss";

function CardFeatures(props: { title: string }) {
  return (
    <Box
      w="100%"
      py="1.5rem"
      px={"2rem"}
      className={styles.CardFeature}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="120px"
    >
      <Text
        fontSize={{ base: "18px", lg: "20px" }}
        fontWeight="700"
        color="var(--color-primary)"
        fontFamily={"'Roboto Mono', monospace"}
        textAlign="center"
        textTransform="uppercase"
        letterSpacing="1px"
      >
        {props.title}
      </Text>
    </Box>
  );
}

export { CardFeatures };
