import React from "react";
import "./ButtonGradFill.scss";

interface Props {
    label: string;
    onClick?: () => void;
    isDisabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
}

const ButtonGradFillBase: React.FC<Props> = ({
    label,
    onClick,
    isDisabled,
    className = "",
    type = "button",
}) => {
    return (
        <button
            type={type}
            className={`btn-grad-fill ${className}`}
            onClick={onClick}
            disabled={isDisabled}
        >
            {label}
        </button>
    );
};

export default ButtonGradFillBase;
