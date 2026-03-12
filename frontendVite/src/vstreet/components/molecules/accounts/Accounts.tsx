import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { useAccount } from "@gear-js/react-hooks";
import { isLoggedIn } from "utils";
import { LOCAL_STORAGE } from "consts";
import { AccountButton } from "../../atoms/account-button";
import styles from "./Accounts.module.scss";

type Props = {
  list: InjectedAccountWithMeta[];
  onChange: () => void;
};

function Accounts({ list, onChange }: Props) {
  return <></>;
}

export { Accounts };
