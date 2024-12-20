import { Button } from "@chakra-ui/react";
import styles from "./Button-Gradient-Border.module.scss";

function ButtonGradientBorder(props: {
  text: string;
  isDisabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      w="10rem"
      className={styles.ButtonGradientBorder}
      isDisabled={props.isDisabled}
      onClick={props.onClick} // Add the onClick handler here
    >
      {props.text}
    </Button>
  );
}

export { ButtonGradientBorder };
