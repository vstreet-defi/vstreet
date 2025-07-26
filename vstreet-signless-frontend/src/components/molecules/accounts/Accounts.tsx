import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

type Props = {
  list: InjectedAccountWithMeta[];
  onChange: () => void;
};

function Accounts({ list, onChange }: Props) {
  return <></>;
}

export { Accounts };
