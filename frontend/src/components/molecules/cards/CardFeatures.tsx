/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import { Box, Heading } from "@chakra-ui/react";
import styles from "./Card.module.scss";

function CardFeatures(props: { title: string }) {
  return (
    <Box
      m={{ base: ".5rem", sm: "1rem", md: "2rem" }}
      borderWidth="1px"
      pt="1rem"
      pb="1rem"
      pl={"2rem"}
      pr={"2rem"}
      className={styles.CardFeature}
      w="8rem"
      style={{
        boxShadow: "0px 14px 25.4px -3px rgba(59, 255, 106, 0.52)",
        backdropFilter: "blur(5.449999809265137px)",
      }}
    >
      <Heading fontSize="12px" color="white">
        {props.title}
      </Heading>
    </Box>
  );
}

export { CardFeatures };
