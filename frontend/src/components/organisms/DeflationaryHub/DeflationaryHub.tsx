import React, { ElementType } from "react";
import {
    Box,
    Container,
    Heading,
    Stack,
    Text,
    SimpleGrid,
    Flex,
    Icon,
} from "@chakra-ui/react";
import {
    RiGovernmentLine,
    RiFireLine,
    RiRobotLine,
    RiArrowRightSLine
} from "react-icons/ri";
import CornerAccent from "components/atoms/CornerAccent/CornerAccent";
import styles from "./DeflationaryHub.module.scss";

const modules = [
    {
        title: "Supply Planning",
        icon: RiGovernmentLine,
        description: "Adaptive issuance and controlled growth through strategic emission caps.",
        features: [
            "Quarterly emissions with predefined caps",
            "Adaptive issuance based on protocol metrics",
            "Hard-capped total supply logic (1M $VST)",
        ]
    },
    {
        title: "Token Distribution",
        icon: RiArrowRightSLine,
        description: "Strategic allocation to drive liquidity, growth, and community governance.",
        features: [
            "Lending & Borrowing liquidity incentives",
            "Governance rewards for active participation",
            "Strategic Bond Market & Treasury funding",
        ]
    },
    {
        title: "Burning Mechanisms",
        icon: RiFireLine,
        description: "Value Capture through multi-layered deflationary pressure and AI synergy.",
        features: [
            "Fee-driven buybacks from all products",
            "Yield Vault allocation for automated burns",
            "vNEO interaction and AI-profit burns",
        ]
    }
];

/**
 * Deflationary Hub Component
 * Illustrates the supply mechanics and value capture strategies 
 * that drive the $VST ecosystem.
 */
function DeflationaryHub() {
    return (
        <Box className={styles.deflationaryHub} py={24}>
            {/* Background Decorations */}
            <div className="aura-glow aura-glow-secondary top-right" />
            <div className="aura-glow aura-glow-primary bottom-left" />

            <Container maxW="100vw" px={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "12rem" }} position="relative" zIndex={1}>
                <Stack spacing={4} mb={16} align="center" textAlign="center">
                    <Text
                        fontFamily="'Roboto Mono', monospace"
                        color="var(--color-primary)"
                        fontSize="14px"
                        fontWeight="bold"
                        letterSpacing="4px"
                        textTransform="uppercase"
                    >
                        Value Flywheel
                    </Text>
                    <Heading
                        color="white"
                        fontSize={{ base: "32px", md: "48px" }}
                        fontWeight="900"
                        fontFamily="Montserrat"
                        textTransform="uppercase"
                        letterSpacing="-1px"
                    >
                        The Deflationary Engine
                    </Heading>
                    <Box w="60px" h="4px" bg="var(--gradient-primary)" borderRadius="full" />
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                    {modules.map((module, index) => (
                        <Box key={index} className={styles.engineModule}>
                            <div className={styles.glow} />
                            <CornerAccent position="top-left" length={20} />
                            <CornerAccent position="bottom-right" length={20} />

                            <div className={styles.content}>
                                <Box className={styles.header}>
                                    <Box className={styles.iconWrapper}>
                                        <Icon as={module.icon as ElementType} />
                                    </Box>
                                </Box>

                                <Text className={styles.moduleTitle}>{module.title}</Text>
                                <Text className={styles.moduleDescription}>{module.description}</Text>

                                <ul className={styles.featureList}>
                                    {module.features.map((feature, idx) => (
                                        <li key={idx} className={styles.featureItem}>
                                            <span><Icon as={RiArrowRightSLine as ElementType} /></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}

export default DeflationaryHub;
