import * as ynab from "ynab";

import { useAsyncStorageChange } from "./storage";
import { useMemo } from "react";

export const useYnab = () => {
  const { data: ynabAccessToken, storeValue } =
    useAsyncStorageChange<string>("@ynabAccessToken");

  const client = useMemo(() => {
    if (ynabAccessToken) {
      return new ynab.API(ynabAccessToken);
    } else {
      return null;
    }
  }, [ynabAccessToken]);

  return { client, setAccessToken: storeValue };
};
