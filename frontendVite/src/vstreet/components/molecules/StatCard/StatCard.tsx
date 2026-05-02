import React from "react";
import styles from "./StatCard.module.scss";
import { CornerAccent } from "../../atoms/CornerAccent/CornerAccent";

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    variant?: "primary" | "secondary" | "neutral";
    icon?: React.ReactNode;
    decoration?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subtext,
    variant = "neutral",
    icon,
    decoration
}) => {
    return (
        <div className={`${styles.statCard} ${styles[variant]}`}>
            {/* Corner Accents */}
            <CornerAccent
                position="top-left"
                color={variant === "primary" ? "#00ffc4" : variant === "secondary" ? "#4fff4b" : "#00ffc4"}
                length={15}
                thickness={2}
            />
            <CornerAccent
                position="bottom-right"
                color={variant === "primary" ? "#4fff4b" : variant === "secondary" ? "#00ffc4" : "#4fff4b"}
                length={15}
                thickness={2}
            />

            {/* Content */}
            <div className={styles.content}>
                <p className={styles.label}>{label}</p>
                <p className={styles.value}>{value}</p>
                {subtext && <p className={styles.subtext}>{subtext}</p>}
            </div>

            {/* Decorations */}
            {(icon || decoration) && (
                <div className={styles.decoration}>
                    {icon || decoration}
                </div>
            )}
        </div>
    );
};

export default StatCard;
