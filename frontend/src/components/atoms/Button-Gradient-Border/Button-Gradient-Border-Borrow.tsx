import { Button } from "@chakra-ui/react";
import styles from "./Button-Gradient-Border.module.scss";
import { GreenLoader } from "components/molecules/alert-modal/AlertModal";

function ButtonGradientBorderBorrow(props: {
  text: string;
  isDisabled?: boolean;
  onClick?: () => void;
  isLoading?: boolean; // Add isLoading prop
}) {
  return (
    <Button
      w="10rem"
      className={styles.ButtonGradientBorder}
      isDisabled={props.isDisabled || props.isLoading} // Disable button when loading
      onClick={props.onClick}
    >
      {props.isLoading ? <GreenLoader /> : props.text}{" "}
      {/* Show loader when loading */}
    </Button>
  );
}

export { ButtonGradientBorderBorrow };
