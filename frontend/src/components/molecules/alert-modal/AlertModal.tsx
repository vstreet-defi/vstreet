import { useState, useEffect } from "react";

type AlertModalProps = {
  type: "success" | "warning" | "error";
  onTrigger: boolean;
};

function AlertModal({ type, onTrigger }: AlertModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  let modalText = "";
  let modalClass = "";

  useEffect(() => {
    if (onTrigger) {
      setIsVisible(true);
    }
  }, [onTrigger]);

  switch (type) {
    case "success":
      modalText = "Your funds have been deposited.";
      modalClass = "Alert-Modal-Success";
      break;
    case "warning":
      modalText = "Please check your input.";
      modalClass = "Alert-Modal-Warning";
      break;
    case "error":
      modalText = "An error occurred.";
      modalClass = "Alert-Modal-Error";
      break;
  }
  if (!isVisible) {
    return null;
  }

  return (
    <div onClick={() => setIsVisible(false)} className={`Alert-Modal`}>
      <div className={`Alert-Modal-Box ${modalClass}`}>
        <h1>{type.charAt(0).toUpperCase() + type.slice(1)}!</h1>
        <p>{modalText}</p>
      </div>
    </div>
  );
}

export { AlertModal };
