import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";

type props = {
  buttonLabel: string;
};

function FundsCard({ buttonLabel }: props) {
  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelector />
        <BasicInput />
        <PercentageSelector />
        <ButtonGradFill label={buttonLabel} />
      </div>
    </div>
  );
}

export { FundsCard };
