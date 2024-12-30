import { useWallet } from "../../../contexts/accountContext";
import "./DisplayWallet.scss";
import { Button, Select } from "@chakra-ui/react";

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
        <Select
          fontWeight={500}
          background={"linear-gradient(to left, #00ffc4, #4fff4b)"}
          _focusWithin={{
            ring: "2px",
            ringOffset: "1px",
            ringOffsetColor: "transparent",
            borderColor: "transparent",
            backgroundClip: "padding-box",
            backgroundImage: "linear-gradient(141deg, #4fff4b, #00ff96)",
            backgroundOrigin: "border-box",
            borderRadius: "8px",
          }}
          variant="brandPrimary"
          placeholder={
            allAccounts.length > 0 ? "Select Account" : "No accounts"
          }
          size="lg"
          maxWidth="12rem"
          onChange={handleSelectAccount}
          value={selectedAccount || ""}
          isDisabled={allAccounts.length === 0}
        >
          {allAccounts.map((account, index) => (
            <option key={index} value={account.address}>
              {formatAccount(account.address)}
            </option>
          ))}
        </Select>
      ) : (
        <Button
          className="ButtonGradientBorder"
          _hover={{ backgroundColor: "brand.primary", color: "white" }}
          width="12rem"
          onClick={handleConnectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </>
  );
};
