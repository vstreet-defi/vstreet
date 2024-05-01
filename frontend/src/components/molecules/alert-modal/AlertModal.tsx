import React from "react";

type AlertModalProps = {
  type: "success" | "warning" | "error";
};

function AlertModal({ type }: AlertModalProps) {
  let modalText = "";
  let modalClass = "";

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
  return (
    <div className={`Alert-Modal`}>
      <div className={`Alert-Modal-Box ${modalClass}`}>
        <h1>{type.charAt(0).toUpperCase() + type.slice(1)}!</h1>
        <p>{modalText}</p>
      </div>
    </div>
  );
}

export default AlertModal;
