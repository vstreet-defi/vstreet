import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { LOCAL_STORAGE } from "consts";

export const isLoggedIn = ({ address }: InjectedAccountWithMeta) =>
  localStorage[LOCAL_STORAGE.ACCOUNT] === address;

export function formatNumber(num: number): number {
  return parseFloat(num.toFixed(2));
}

export const formatWithCommasVARA = (number: number) => {
  const decimalsFactor = 1000000000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
};

export const formatWithDecimalsVARA = (number: number) => {
  const decimalsFactor = 1000000000000;
  const formattedNumber = number / decimalsFactor;
  return parseFloat(formattedNumber.toFixed(2));
};

export const formatWithCommasVUSD = (number: number) => {
  const decimalsFactor = 1000000000000000;
  const formattedNumber = number / decimalsFactor;
  return formattedNumber.toLocaleString();
};
