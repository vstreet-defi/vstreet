/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */

import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";

function CardDeposit() {
  return (
    <div className={styles.Container}>
      <div className={styles.SelectDeposit}>Deposit</div>
      <div
        //   style={{ backgroundColor: "rgba(18, 18, 18, 0.79)" }}
        className={styles.BasicCard}
      >
        <TokenSelector />
        <BasicInput />
        <PercentageSelector />
        <ButtonGradFill />
      </div>
    </div>
  );
}

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
