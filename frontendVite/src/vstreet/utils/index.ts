import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { LOCAL_STORAGE } from 'consts';

export const RAW_DECIMALS_FACTOR_VUSD = 1_000_000;
export const RAW_DECIMALS_FACTOR_VARA = 1_000_000_000_000;

export const isLoggedIn = ({ address }: InjectedAccountWithMeta) => localStorage[LOCAL_STORAGE.ACCOUNT] === address;

export function formatNumber(num: number): number {
  return parseFloat(num.toFixed(2));
}

export const toRawUnits = (amount: string | number, decimalsFactor: number = RAW_DECIMALS_FACTOR_VUSD): number => {
  const numericAmount = typeof amount === 'string' ? Number(amount) : amount;

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 0;
  }

  return Math.round(numericAmount * decimalsFactor);
};

export const fromRawUnits = (amount: number, decimalsFactor: number = RAW_DECIMALS_FACTOR_VUSD): number => {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount / decimalsFactor;
};

export const formatWithCommasVARA = (number: number) => {
  const formattedNumber = fromRawUnits(number, RAW_DECIMALS_FACTOR_VARA);
  return formattedNumber.toLocaleString();
};

export const formatWithDecimalsVARA = (number: number) => {
  const formattedNumber = fromRawUnits(number, RAW_DECIMALS_FACTOR_VARA);
  return parseFloat(formattedNumber.toFixed(2));
};

export const formatWithCommasVUSD = (number: number) => {
  const formattedNumber = fromRawUnits(number, RAW_DECIMALS_FACTOR_VUSD);
  return formattedNumber.toLocaleString();
};

export const formatHumanVUSD = (number: number) => {
  if (!Number.isFinite(number)) {
    return '0';
  }

  const formattedNumber = number;
  return formattedNumber.toLocaleString();
};
