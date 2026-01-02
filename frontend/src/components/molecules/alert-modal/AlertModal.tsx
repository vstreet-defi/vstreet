import { useState, useEffect, useContext } from "react";
import { AlertModalContext, AlertType } from "contexts/alertContext";
import CornerAccent from "../../atoms/CornerAccent/CornerAccent";

export function Loader() {
  return (
    <div className="lds-facebook">
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export function GreenLoader() {
  return <Loader />;
}

function AlertModal() {
  const alertContext = useContext(AlertModalContext);
  const [isVisible, setIsVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>(AlertType.Info);
  const [alertMessage, setAlertMessage] = useState<string>("");

  useEffect(() => {
    if (alertContext?.isAlertModalVisible) {
      setIsVisible(true);
      setAlertType(alertContext?.alertType ?? AlertType.Info);
      setAlertMessage(alertContext?.alertMessage ?? "");
    } else {
      setIsVisible(false);
    }
  }, [
    alertContext?.isAlertModalVisible,
    alertContext?.alertType,
    alertContext?.alertMessage,
  ]);

  if (!isVisible) {
    return null;
  }

  const getModalText = () => {
    switch (alertType) {
      case AlertType.Success:
        return "Transaction completed successfully!";
      case AlertType.Warning:
        return alertMessage || "Please check the information provided.";
      case AlertType.Error:
        return alertMessage || "An error occurred during the transaction.";
      case AlertType.Info:
        return (
          alertMessage || "Please check your wallet to sign the transaction."
        );
      default:
        return "";
    }
  };

  const getModalClass = () => {
    switch (alertType) {
      case AlertType.Success:
        return "Alert-Modal-Success";
      case AlertType.Warning:
        return "Alert-Modal-Warning";
      case AlertType.Error:
        return "Alert-Modal-Error";
      case AlertType.Info:
        return "Alert-Modal-Info";
      default:
        return "";
    }
  };

  const getAccentColor = () => {
    switch (alertType) {
      case AlertType.Success: return "#4fff4b";
      case AlertType.Warning: return "#fff500";
      case AlertType.Error: return "#ff0f00";
      case AlertType.Info: return "#00ffc4";
      default: return "#00ffc4";
    }
  };

  return (
    <div className="Alert-Modal">
      <div className={`Alert-Modal-Box ${getModalClass()}`}>
        <CornerAccent position="top-left" color={getAccentColor()} length={30} />
        <CornerAccent position="bottom-right" color={getAccentColor()} length={30} />

        <h1>{alertType.charAt(0).toUpperCase() + alertType.slice(1)}!</h1>
        <p>{getModalText()}</p>
        {(alertType === AlertType.Info || alertType === AlertType.Success) && <Loader />}
      </div>
    </div>
  );
}

export { AlertModal };
