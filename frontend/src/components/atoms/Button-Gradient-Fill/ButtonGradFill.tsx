import React, { useContext, useState } from "react";
import { AlertModalContext } from "contexts/alertContext";

interface ButtonProps {
  label: string;
}

const ButtonGradFill: React.FC<ButtonProps> = ({ label }) => {
  const [isLoading, setIsLoading] = useState(false);
  const alertModalContext = useContext(AlertModalContext);
  const handleClick = () => {
    alertModalContext?.showAlertModal("Button clicked");
    if (alertModalContext) {
      setIsLoading(true);
      if (label === "Deposit") console.log("Deposit action performed");
      if (label === "Withdraw") console.log("Withdraw action performed");
      console.log(
        "Alert modal context: ",
        alertModalContext.isAlertModalVisible
      );
    }
  };

  return (
    <button
      className={`btn-grad-fill ${isLoading ? "btn-grad-fill--loading" : ""}`}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        label
      )}
    </button>
  );
};

export default ButtonGradFill;
