import { createContext, useState, FC, ReactNode } from "react";

// Define the type of the context
interface AlertModalContextType {
  isAlertModalVisible: boolean;
  alertModalMessage: string;
  showAlertModal: (message: string) => void;
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

  const showAlertModal = (message: string) => {
    setAlertModalMessage(message);
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
        showAlertModal,
        hideAlertModal,
      }}
    >
      {children}
    </AlertModalContext.Provider>
  );
};
