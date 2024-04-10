import { Button } from "@chakra-ui/react";
import styles from "./Button-Gradient-Border.module.scss";

function ButtonGradientBorder(props: { text: string }) {
  return (
    <Button w="10rem" className={styles.ButtonGradientBorder}>
      {props.text}
    </Button>
  );
}

export { ButtonGradientBorder };
