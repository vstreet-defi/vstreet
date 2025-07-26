import { createContext, useState, FC, ReactNode } from "react";

export enum AlertType {
  Success = "success",
  Warning = "warning",
  Error = "error",
  Info = "info",
}

interface AlertModalContextType {
  isAlertModalVisible: boolean;
  alertType: AlertType;
  alertMessage: string;
  showSuccessModal: () => void;
  showWarningModal: (message: string) => void;
  showErrorModal: (message: string) => void;
  showInfoModal: (message: string) => void;
  hideAlertModal: () => void;
}

// Create the context with initial value
export const AlertModalContext = createContext<AlertModalContextType | null>(
  null
);

export const AlertModalProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>(AlertType.Info);
  const [alertMessage, setAlertMessage] = useState("");

  const showModal = (type: AlertType, message: string = "") => {
    setAlertType(type);
    setAlertMessage(message);
    setIsAlertModalVisible(true);
  };

  const hideAlertModal = () => {
    setIsAlertModalVisible(false);
  };

  const showSuccessModal = () => showModal(AlertType.Success);
  const showWarningModal = (message: string) =>
    showModal(AlertType.Warning, message);
  const showErrorModal = (message: string) =>
    showModal(AlertType.Error, message);
  const showInfoModal = (message: string) => showModal(AlertType.Info, message);

  return (
    <AlertModalContext.Provider
      value={{
        isAlertModalVisible,
        alertType,
        alertMessage,
        showSuccessModal,
        showWarningModal,
        showErrorModal,
        showInfoModal,
        hideAlertModal,
      }}
    >
      {children}
    </AlertModalContext.Provider>
  );
};
