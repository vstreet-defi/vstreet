import { Button } from "@chakra-ui/react";
import styles from "./Button-Gradient-Border.module.scss";

function ButtonGradientBorder(props: { text: string; isDisabled?: boolean }) {
  return (
    <Button
      w="10rem"
      className={styles.ButtonGradientBorder}
      isDisabled={props.isDisabled}
    >
      {props.text}
    </Button>
  );
}

export { ButtonGradientBorder };
