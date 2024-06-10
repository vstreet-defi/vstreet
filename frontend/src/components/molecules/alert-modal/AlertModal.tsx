import { useState, useEffect, useContext } from "react";
import { AlertModalContext } from "contexts/alertContext";

type AlertModalProps = {
  type: "success" | "warning" | "error";
  // onTrigger: boolean | undefined;
};

function AlertModal({ type }: AlertModalProps) {
  const alertContext = useContext(AlertModalContext);
  const [isVisible, setIsVisible] = useState(false);
  let modalText = "";
  let modalClass = "";

  useEffect(() => {
    if (alertContext?.isAlertModalVisible) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    console.log("Alert modal triggered");
  }, [alertContext?.isAlertModalVisible]);

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
    <div
      onClick={() => alertContext?.hideAlertModal()}
      className={`Alert-Modal`}
    >
      <div className={`Alert-Modal-Box ${modalClass}`}>
        <h1>{type.charAt(0).toUpperCase() + type.slice(1)}!</h1>
        <p>{modalText}</p>
      </div>
    </div>
  );
}

export { AlertModal };
