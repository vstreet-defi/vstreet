import {
  Box,
  Text,
  Center,
  Heading,
  Container,
  Stack,
  Flex,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";

import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { useAccount, useAlert } from "@gear-js/react-hooks";

import { DepositFunds } from "components/gear/DepositFunds";
import { CollateralBalanceToken } from "components/gear/CollateralBalance";
import { ReadState } from "components/gear/ReadState";
import { Blocknumber } from "components/gear/blockNumber";
import { CardDeposit } from "components/layout/cards/CardDeposit";

import { DepositSynthetic } from "components/gear/DepositSynthetic";
import { UserLockedBalances } from "components/gear/UserLockedBalances";

import { Footer } from "pages/home/sections/Footer";
import { WithdrawFunds } from "components/gear/WithdrawFunds";
import Shilling from "../../assets/images/backgrounds/Vara shillingBG.svg";
import BgFooter from "../../assets/images/Liquid Footer.svg";

function Dapp() {
  return (
    <Container p="0" maxW="100vw" bgGradient="linear(to-l, #121215 ,#284736)">
      <Box w="100vw" bgRepeat="no-repeat" bgPos="center">
        <Flex
          border="1px"
          borderBottomColor="#4FFF4B"
          p="1rem"
          justify="space-evenly"
          // bgImage={BgFooter}
        >
          <Blocknumber />
          <ReadState />
        </Flex>
        <Box bgImage={Shilling} bgSize="cover" bgRepeat="no-repeat">
          <Stack
            pl={{ base: "1rem", md: "3rem", xl: "8rem", "2xl": "15rem" }}
            pr={{ base: "1rem" }}
            align="center"
            spacing={{ base: 8, md: 10 }}
            py={{ base: 20, md: 28 }}
            direction={{ base: "column", md: "row" }}
          >
            <Stack flex={1} spacing={{ base: 5, md: 10 }}>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: "column", sm: "row" }}
              >
                <Box>
                  <DepositFunds />
                  <Box mt="1rem">
                    <WithdrawFunds />
                  </Box>
                </Box>
                <Box>
                  <DepositSynthetic />
                </Box>
              </Stack>
            </Stack>
            <Flex
              flex={1}
              justify="center"
              align="center"
              position="relative"
              w="full"
              h="100%"
              p="2rem"
              // bgImage={BgFooter}
              // bgRepeat="no-repeat"
              // bgSize="cover"
            >
              <UserLockedBalances />
            </Flex>
          </Stack>
        </Box>
      </Box>
      <Footer />
    </Container>
  );
}

export { Dapp };
