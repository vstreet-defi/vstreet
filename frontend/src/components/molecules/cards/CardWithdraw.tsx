import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";

function CardWithdraw() {
  return (
    // <div className={styles.OutsideContainer}>
    <div className={styles.Container}>
      {/* <div className={styles.SelectWithdraw}>Withdraw</div> */}
      <div className={styles.BasicCard}>
        <TokenSelector />
        <BasicInput />
        <PercentageSelector />
        <ButtonGradFill text="Withdraw" />
      </div>
    </div>
    // </div>
  );
}

export { CardWithdraw };
