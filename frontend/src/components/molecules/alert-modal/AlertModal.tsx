import { useState, useEffect, useContext } from "react";
import { AlertModalContext } from "contexts/alertContext";

type AlertModalProps = {
  type: "success" | "warning" | "error" | "info";
};

function AlertModal({ type }: AlertModalProps) {
  const alertContext = useContext(AlertModalContext);
  const [isVisible, setIsVisible] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | undefined>();
  const [alertType, setAlertType] = useState<string | undefined>();
  let modalText = "";
  let modalClass = "";

  useEffect(() => {
    if (alertContext?.isAlertModalVisible) {
      setIsVisible(true);
      setAlertType(alertContext?.alertType);
      setAlertMsg(alertContext?.alertModalMessage);
    } else {
      setIsVisible(false);
    }
  }, [
    alertContext?.isAlertModalVisible,
    alertContext?.alertModalMessage,
    alertContext?.alertType,
  ]);

  switch (alertType) {
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
    case "info":
      modalText = `${alertMsg}`;
      modalClass = "Alert-Modal-Success";
      break;
  }
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`Alert-Modal`}>
      <div className={`Alert-Modal-Box ${modalClass}`}>
        <h1>{type.charAt(0).toUpperCase() + type.slice(1)}!</h1>
        <p>{modalText}</p>
        <div className="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export { AlertModal };
