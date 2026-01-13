import React from "react";
import styles from "./CornerAccent.module.scss";

interface CornerAccentProps {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    color?: string;
    length?: number;
    thickness?: number;
}

export const CornerAccent: React.FC<CornerAccentProps> = ({
    position,
    color = "#00ffc4",
    length = 40,
    thickness = 2
}) => {
    const style = {
        "--accent-color": color,
        "--accent-length": `${length}px`,
        "--accent-thickness": `${thickness}px`
    } as React.CSSProperties;

    return (
        <div
            className={`${styles.cornerAccent} ${styles[position.replace("-", "")]}`}
            style={style}
        />
    );
};

export default CornerAccent;
