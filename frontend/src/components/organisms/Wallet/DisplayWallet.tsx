import { useState, useEffect } from "react";

import { AccountsModal } from "../../molecules/accounts-modal";
import { useWallet } from "../../../contexts/accountContext";
import "./DisplayWallet.scss";

interface Account {
  address: string;
  // Add other properties if needed
}

export default function DisplayWallet() {
  //Polkadot Extension Wallet-Hook by PSYLABS
  const {
    allAccounts,
    selectedAccount,
    handleConnectWallet,
    handleSelectAccount,
    formatAccount,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Estado de la cuenta conectada */}
      <p
        style={{
          color: "white",
          fontSize: "0.8rem",
          margin: "0",
          padding: "0",
          textAlign: "center",
        }}
      >
        {selectedAccount
          ? formatAccount(selectedAccount)
          : "no account found, select account"}
      </p>

      {allAccounts.length === 0 ? (
        <button className="ButtonGradientBorder" onClick={handleConnectWallet}>
          Connect Wallet
        </button>
      ) : null}

      {allAccounts.length > 0 ? (
        <select
          className="selectCustom"
          onChange={handleSelectAccount}
          placeholder="select Account"
        >
          {allAccounts.map((account: Account) => (
            <option
              style={{ backgroundColor: "Black" }}
              key={account.address}
              value={account.address}
            >
              {formatAccount(account.address)}
            </option>
          ))}
        </select>
      ) : null}
      {isModalOpen && (
        <AccountsModal accounts={allAccounts} close={closeModal} />
      )}
    </>
  );
}
