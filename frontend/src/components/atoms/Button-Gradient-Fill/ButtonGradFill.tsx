import { useState } from "react";

interface ButtonProps {
  label: string;
}

function ButtonGradFill({ label }: ButtonProps) {
  const [isLoading, setLoading] = useState(false);
  const handleClick = () => {
    setLoading(true);
    if (label === "Deposit") console.log("Deposit action performed");
    if (label === "Withdraw") console.log("Withdraw action performed");
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
}

export default ButtonGradFill;
