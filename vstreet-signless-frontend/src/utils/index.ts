import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

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

const copyToClipboard = (value: string) => navigator.clipboard.writeText(value).then(() => console.log('Copied!'));

export { copyToClipboard };
