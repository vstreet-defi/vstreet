import { useState, useEffect } from "react";
import { useApi } from "@gear-js/react-hooks";

export function useNativeBalance(address?: string) {
  const { api } = useApi();
  const [balance, setBalance] = useState<bigint>(0n);

  useEffect(() => {
    if (!api || !address) return;
    let unsub: any;
    api.query.system.account(address, ({ data }: any) => {
      setBalance(data.free.toBigInt());
    }).then((u: any) => (unsub = u));
    return () => {
      if (unsub) unsub();
    };
  }, [api, address]);

  return balance;
}
