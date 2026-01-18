import React from "react";
import { Container, Heading, Text, Stack, SimpleGrid, Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import HubCard from "components/molecules/cards/HubCard";
import {
    RiFundsLine,
    RiHammerFill,
    RiSettings4Line,
    RiGovernmentLine,
    RiCpuLine,
    RiRobotLine
} from "react-icons/ri";

/**
 * Ecosystem Hub Component
 * Showcases the core financial primitives and services provided by vStreet.
 * Each card represents a distinct module with status indicators.
 */
function EcosystemHub() {
    const navigate = useNavigate();

    const hubs = [
        {
            title: "Lending & Borrowing",
            description: "Enables the use of Liquid Staking Tokens (LSTs) and LP tokens as collateral to unlock liquidity. Users obtain synthetic assets for use across external dApps while maintaining their underlying positions.",
            icon: RiFundsLine,
            status: "TESTNET" as const,
            statusType: "active" as const,
            buttonLabel: "VIEW",
            onAction: () => navigate("/dapp?tab=borrow"),
        },
        {
            title: "Yield Vaults",
            description: "Users deposit interest-bearing tokens (IBTs) into automated yield strategies. Protocol yield is allocated to buy and burn $VST tokens to reduce total circulating supply.",
            icon: RiSettings4Line,
            status: "TESTNET" as const,
            statusType: "active" as const,
            buttonLabel: "VIEW",
            onAction: () => navigate("/dapp?tab=vaults"),
        },
        {
            title: "Bond Marketplace",
            description: "A platform for projects to launch native token markets to build protocol-owned liquidity. Users purchase assets at a discount in exchange for a vesting period, supporting the treasury through transaction fees.",
            icon: RiHammerFill,
            status: "COMING SOON" as const,
            statusType: "pending" as const,
            buttonLabel: "VIEW",
            isDisabled: true,
        },
        {
            title: "vNEO: AI Agent",
            description: "An LLM-powered AI agent designed for direct interaction with Vara Network and vStreet functions. Offers a conversational interface for complex DeFi operations via natural language commands.",
            icon: RiRobotLine,
            status: "COMING SOON" as const,
            statusType: "pending" as const,
            buttonLabel: "VIEW",
            isDisabled: true,
        },
        {
            title: "Governance & sToken System",
            description: "Staking $VST for $sVST provides voting power, fee distribution, and boost multipliers. Empowers holders to influence the community-governed treasury's strategic direction.",
            icon: RiGovernmentLine,
            status: "COMING SOON" as const,
            statusType: "pending" as const,
            buttonLabel: "VIEW",
            isDisabled: true,
        },
        {
            title: "Fungible Token Minter",
            description: "A no-code solution for the instant creation of customized community tokens. It integrates directly with the bond marketplace and lending modules.",
            icon: RiCpuLine,
            status: "COMING SOON" as const,
            statusType: "pending" as const,
            buttonLabel: "VIEW",
            isDisabled: true,
        },
    ];

    return (
        <Container
            maxW="100vw"
            bg="var(--color-bg-main)"
            minH="100vh"
            display="flex"
            alignItems="center"
            px={{ base: 4, md: 10, xl: 24 }}
            position="relative"
            overflow="hidden"
        >
            {/* Background Decorations */}
            <div className="aura-glow aura-glow-primary top-right" />
            <div className="aura-glow aura-glow-secondary bottom-left" />

            <Stack spacing={16} w="100%" py={10} position="relative" zIndex={1}>
                <Flex flexDir="column" align="center">
                    <Text
                        fontFamily="'Roboto Mono', monospace"
                        color="var(--color-primary)"
                        fontSize="14px"
                        fontWeight="bold"
                        letterSpacing="4px"
                        textTransform="uppercase"
                        mb={2}
                    >
                        The Ecosystem Engine
                    </Text>
                    <Heading
                        color="white"
                        fontSize={{ base: "32px", md: "48px" }}
                        fontWeight="900"
                        fontFamily="Montserrat"
                        textTransform="uppercase"
                        letterSpacing="-1px"
                        textAlign="center"
                    >
                        vStreet DeFi Hub
                    </Heading>
                    <Box w="60px" h="4px" bg="var(--gradient-primary)" mt={4} borderRadius="full" />

                    <Text
                        mt={8}
                        maxW="800px"
                        textAlign="center"
                        color="var(--color-text-secondary)"
                        fontSize="18px"
                        fontFamily="'Inter', sans-serif"
                    >
                        Explore a comprehensive suite of decentralized financial primitives architected specifically for the Vara Network ecosystem.
                    </Text>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                    {hubs.map((hub, index) => (
                        <HubCard key={index} {...hub} />
                    ))}
                </SimpleGrid>
            </Stack>
        </Container>
    );
}

export default EcosystemHub;
