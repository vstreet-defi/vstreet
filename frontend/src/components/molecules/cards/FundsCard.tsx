import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";
import { useState } from "react";
type props = {
  buttonLabel: string;
};

function FundsCard({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };
  console.log("funds card input=", inputValue);
  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelector />
        <BasicInput inputValue={inputValue} onInputChange={handleInputChange} />
        <PercentageSelector />
        <ButtonGradFill valueAmount={inputValue} label={buttonLabel} />
      </div>
    </div>
  );
}

export { FundsCard };
