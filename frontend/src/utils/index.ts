import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { LOCAL_STORAGE } from "consts";

export const isLoggedIn = ({ address }: InjectedAccountWithMeta) =>
  localStorage[LOCAL_STORAGE.ACCOUNT] === address;

export function formatNumber(num: number): number {
  return parseFloat(num.toFixed(2));
}
