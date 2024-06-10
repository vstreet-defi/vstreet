import React, { useContext } from "react";
import { AlertModalContext } from "contexts/alertContext";

interface ButtonProps {
  label: string;
}

const ButtonGradFill: React.FC<ButtonProps> = ({ label }) => {
  const alertModalContext = useContext(AlertModalContext);
  const handleClick = () => {
    alertModalContext?.showAlertModal("Button clicked");
    if (alertModalContext) {
      if (label === "Deposit") console.log("Deposit action performed");
      if (label === "Withdraw") console.log("Withdraw action performed");
      console.log(
        "Alert modal context: ",
        alertModalContext.isAlertModalVisible
      );
    }
  };

  return (
    <button className="btn-grad-fill" onClick={handleClick}>
      {label}
    </button>
  );
};

export default ButtonGradFill;
