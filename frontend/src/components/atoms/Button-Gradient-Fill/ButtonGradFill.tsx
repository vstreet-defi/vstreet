interface ButtonProps {
  label: string;
}

function ButtonGradFill({ label }: ButtonProps) {
  const handleClick = () => {
    if (label === "Deposit") console.log("Deposit action performed");
    if (label === "Withdraw") console.log("Withdraw action performed");
  };

  return (
    <button className="btn-grad-fill" onClick={handleClick}>
      {label}
    </button>
  );
}

export default ButtonGradFill;
