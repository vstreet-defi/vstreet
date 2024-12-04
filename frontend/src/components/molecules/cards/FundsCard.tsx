import BasicInput from "components/molecules/Basic-Input/BasicInput";
import styles from "./Card.module.scss";
import TokenSelector from "components/atoms/Token-Selector/TokenSelector";
import PercentageSelector from "../Percentage-Selector/PercentageSelector";
import ButtonGradFill from "components/atoms/Button-Gradient-Fill/ButtonGradFill";
import { useEffect, useState } from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { GearApi } from "@gear-js/api";
import {
  FullState,
  FullStateVST,
  getVFTBalance,
  getStakingInfo,
} from "smart-contracts-tools";

//Import useWallet from contexts
import { useWallet } from "contexts/accountContext";

//Sails-js Impotrts
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";

type props = {
  buttonLabel: string;
};

function FundsCard({ buttonLabel }: props) {
  const [inputValue, setInputValue] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [depositedBalance, setDepositedBalance] = useState<number>(0);
  const [fullState, setFullState] = useState<FullStateVST | FullState>();
  const { api } = useApi();
  const { account } = useAccount();

  //Polkadot Extension Wallet-Hook by PSYLABS
  const { selectedAccount, hexAddress } = useWallet();

  const isDepositCard = () => {
    return buttonLabel === "Deposit";
  };
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (selectedAccount && account) {
      // getBalanceVUSD(api, account.address, setBalance, setFullState);

      //call sails get balance
      getVFTBalance(api, hexAddress, setBalance);

      // getStakingInfo(
      //   api,
      //   account.decodedAddress,
      //   setDepositedBalance,
      //   setFullState
      // );

      console.log("gear decoded address", account.decodedAddress);
      console.log("hex address", hexAddress);
      console.log("polkadot extension address", selectedAccount);
    }
  }, [selectedAccount, account, api]);
  return (
    <div className={styles.Container}>
      <div className={styles.BasicCard}>
        <TokenSelector />
        <BasicInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? balance : depositedBalance}
        />
        <PercentageSelector
          inputValue={inputValue}
          onInputChange={handleInputChange}
          balance={isDepositCard() ? balance : depositedBalance}
        />
        <ButtonGradFill
          amount={inputValue}
          label={buttonLabel}
          balance={isDepositCard() ? balance : depositedBalance}
        />
      </div>
    </div>
  );
}

export { FundsCard };
