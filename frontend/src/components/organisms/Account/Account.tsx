import { useState } from "react";
import { useAccount } from "@gear-js/react-hooks";
import { AccountsModal } from "../../molecules/accounts-modal";
import { Wallet } from "../../molecules/wallet";
import styles from "../../molecules/wallet/Wallet.module.scss";

function Account() {
  const { account, accounts } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {account ? (
        <Wallet
          balance={account?.balance}
          address={account?.address}
          name={account?.meta.name}
          onClick={openModal}
        />
      ) : (
        <button
          className={styles.connectWallet}
          type="button"
          onClick={openModal}
        >
          <p>CONNECT WALLET</p>
        </button>
      )}
      {isModalOpen && <AccountsModal accounts={accounts} close={closeModal} />}
    </>
  );
}

export default Account;
