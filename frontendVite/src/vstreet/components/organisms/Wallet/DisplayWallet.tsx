import { useWallet } from "../../../contexts/accountContext";
import "./DisplayWallet.scss";
import { Button, Menu, MenuButton, MenuList, MenuItem, Icon } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";

export const DisplayWallet = () => {
  const {
    allAccounts,
    selectedAccount,
    isWalletConnected,
    handleConnectWallet,
    handleSelectAccount,
    formatAccount,
  } = useWallet();

  return (
    <>
      {isWalletConnected && allAccounts.length ? (
        <Menu>
          <MenuButton
            as={Button}
            className="ButtonGradientBorder"
            rightIcon={<Icon as={FiChevronDown as any} />}
            textAlign="center"
          >
            Connected
          </MenuButton>
          <MenuList className="menuListCustom">
            {allAccounts.map((account, index) => (
              <MenuItem
                key={index}
                onClick={() => handleSelectAccount({ target: { value: account.address } } as any)}
                className={selectedAccount === account.address ? "selected" : ""}
              >
                {formatAccount(account.address)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      ) : (
        <Button
          className="ButtonGradientBorder"
          onClick={handleConnectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </>
  );
};
