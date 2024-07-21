import { createContext, useState, FC, ReactNode } from "react";

// Define the type of the context
interface AlertModalContextType {
  isAlertModalVisible: boolean;
  alertModalMessage: string;
  alertType: string;
  showAlertModal: (message: string, type: string) => void;
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
  const [alertModalMessage, setAlertModalMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const showAlertModal = (message: string, type: string) => {
    setAlertModalMessage(message);
    setAlertType(type);
    setIsAlertModalVisible(true);
  };

  const hideAlertModal = () => {
    setIsAlertModalVisible(false);
  };

  return (
    <AlertModalContext.Provider
      value={{
        isAlertModalVisible,
        alertModalMessage,
        alertType,
        showAlertModal,
        hideAlertModal,
      }}
    >
      {children}
    </AlertModalContext.Provider>
  );
};
