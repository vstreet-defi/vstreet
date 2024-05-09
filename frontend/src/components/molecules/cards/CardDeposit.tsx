import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";

function CardDeposit() {
  return (
    <div className={styles.OutsideContainer}>
      <div className={styles.Container}>
        <div className={styles.SelectDeposit}>Deposit</div>
        <div className={styles.BasicCard}>
          <TokenSelector />
          <BasicInput />
          <PercentageSelector />
          <ButtonGradFill />
        </div>
      </div>
    </div>
  );
}

//Esta la dejo comentada como referencia del demo para implementar logica

// function CardDeposit() {
//   return (
//     <Box className={styles.Moduleborderwrap}>
//       <Box className={styles.module}>
//         <DepositFunds />
//       </Box>
//     </Box>
//   );
// }

export { CardDeposit };
