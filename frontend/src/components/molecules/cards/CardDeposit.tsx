/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import { Box, Heading, Text } from "@chakra-ui/react";
import { DepositFunds } from "components/gear/DepositFunds";
import styles from "./Card.module.scss";

function CardDeposit() {
  return (
    <Box className={styles.Moduleborderwrap}>
      <Box className={styles.module}>
        <DepositFunds />
      </Box>
    </Box>
  );
}

export { CardDeposit };
