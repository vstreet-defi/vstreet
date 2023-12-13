import { useState } from 'react';
import { useAccount } from '@gear-js/react-hooks';
import { AccountsModal } from './accounts-modal';
import { Wallet } from './wallet';
import styles from './wallet/Wallet.module.scss';

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
        <Wallet balance={account.balance} address={account.address} name={account.meta.name} onClick={openModal} />
      ) : (
        <button className={styles.connectWallet} type="button" onClick={openModal}> Connect Your Wallet</button>
      )}
      {isModalOpen && <AccountsModal accounts={accounts} close={closeModal} />}
    </>
  );
}

export { Account };
