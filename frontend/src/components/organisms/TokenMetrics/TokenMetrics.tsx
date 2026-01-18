import React from "react";
import {
    Box,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    SimpleGrid,
    Progress,
} from "@chakra-ui/react";
import CornerAccent from "components/atoms/CornerAccent/CornerAccent";
import styles from "./TokenMetrics.module.scss";

const metrics = [
    { label: "Max Supply", value: "1,000,000 $VST" },
    { label: "Initial Price", value: "$1.50 USD" },
    { label: "Emission Strategy", value: "Quarterly Caps" },
];

const distribution = [
    { label: "Bond Markets", percentage: 50 },
    { label: "VC Presale", percentage: 25 },
    { label: "Treasury", percentage: 13 },
    { label: "Dev Team", percentage: 10 },
    { label: "Airdrop", percentage: 2 },
];

/**
 * Token Metrics Component
 * Displays the $VST tokenomics, including supply caps and distribution matrix.
 */
function TokenMetrics() {
    return (
        <Box className={styles.tokenMetrics} py={24}>
            {/* Background Decorations */}
            <div className="technical-grid" />
            <div className="aura-glow aura-glow-primary top-right" />
            <div className="aura-glow aura-glow-secondary bottom-left" />

            <Container maxW="100vw" px={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "12rem" }} position="relative" zIndex={1}>
                <Stack spacing={4} mb={16} align={{ base: "center", lg: "flex-start" }}>
                    <Text
                        fontFamily="'Roboto Mono', monospace"
                        color="var(--color-primary)"
                        fontSize="14px"
                        fontWeight="bold"
                        letterSpacing="4px"
                        textTransform="uppercase"
                    >
                        Architecture
                    </Text>
                    <Heading
                        color="white"
                        fontSize={{ base: "32px", md: "48px" }}
                        fontWeight="900"
                        fontFamily="Montserrat"
                        textTransform="uppercase"
                        letterSpacing="-1px"
                    >
                        $VST Tokenomics
                    </Heading>
                    <Box w="60px" h="4px" bg="var(--gradient-primary)" borderRadius="full" />
                </Stack>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
                    {/* Left: Terminal Metrics */}
                    <Box className={styles.terminal}>
                        <CornerAccent position="top-left" length={20} />
                        <CornerAccent position="bottom-right" length={20} />

                        <div className={styles.content}>
                            {metrics.map((metric, index) => (
                                <Box key={index} className={styles.metricItem}>
                                    <Text className={styles.label}>{metric.label}</Text>
                                    <Text className={styles.value}>{metric.value}</Text>
                                </Box>
                            ))}
                        </div>
                    </Box>

                    {/* Right: Distribution Matrix */}
                    <Box>
                        <Text
                            fontFamily="'Roboto Mono', monospace"
                            color="var(--color-text-secondary)"
                            fontSize="14px"
                            fontWeight="bold"
                            letterSpacing="2px"
                            textTransform="uppercase"
                            mb={10}
                        >
                            Distribution Matrix
                        </Text>
                        <Stack spacing={8}>
                            {distribution.map((item, index) => (
                                <Box key={index} className={styles.distItem}>
                                    <div className={styles.distHeader}>
                                        <span className={styles.distLabel}>{item.label}</span>
                                        <span className={styles.distValue}>{item.percentage}%</span>
                                    </div>
                                    <Progress
                                        value={item.percentage}
                                        className={styles.progressBar}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
}

export default TokenMetrics;
