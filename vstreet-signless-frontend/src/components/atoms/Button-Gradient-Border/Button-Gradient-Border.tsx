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
      onClick={props.onClick} 
    >
      {props.text}
    </Button>
  );
}

export { ButtonGradientBorder };
