import React from "react";
import { Box, Flex, Heading, Text, Icon } from "@chakra-ui/react";
import styles from "./HubCard.module.scss";
import CornerAccent from "components/atoms/CornerAccent/CornerAccent";
import ButtonGradFillBase from "components/atoms/Button-Gradient-Fill/ButtonGradFillBase";
import { IconType } from "react-icons";

interface HubCardProps {
    title: string;
    description: string;
    icon: IconType;
    status: "ONLINE" | "ACTIVE" | "COMING SOON" | "TESTNET";
    statusType: "online" | "active" | "pending";
    buttonLabel: string;
    onAction?: () => void;
    isDisabled?: boolean;
}

const HubCard: React.FC<HubCardProps> = ({
    title,
    description,
    icon,
    status,
    statusType,
    buttonLabel,
    onAction,
    isDisabled = false,
}) => {
    const IconComponent = icon as any;
    return (
        <Box className={styles.hubCard}>
            <div className={styles.glow} />
            <CornerAccent position="top-left" length={20} />
            <CornerAccent position="bottom-right" length={20} />

            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Icon as={IconComponent} />
                    </div>
                    <div className={styles.status}>
                        <div className={`${styles.statusDot} ${styles[statusType]}`} />
                        <span className={styles.statusText}>{status}</span>
                    </div>
                </div>

                <Text
                    fontSize="12px"
                    fontWeight="800"
                    textTransform="uppercase"
                    fontFamily="Montserrat"
                    letterSpacing="-0.5px"
                    color="white"
                    mb={3}
                >
                    {title}
                </Text>
                <Text className={styles.description}>{description}</Text>

                <Box mt="auto">
                    <ButtonGradFillBase
                        label={buttonLabel}
                        onClick={onAction}
                        isDisabled={isDisabled}
                    />
                </Box>
            </div>
        </Box>
    );
};

export default HubCard;
