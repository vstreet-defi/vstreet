import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { WalletProvider } from "../src/contexts/accountContext";
import { UserInfoProvider } from "contexts/userInfoContext";
import { App } from "./App";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
  <ChakraProvider>
    <WalletProvider>
      <UserInfoProvider>
        <App />
      </UserInfoProvider>
    </WalletProvider>
  </ChakraProvider>
);
