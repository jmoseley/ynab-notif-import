import * as ynab from "ynab";

import { getData, useAsyncStorageChange } from "./storage";
import { useMemo } from "react";

export const Currencies = ["$", "€", "£"] as const;
export type Currency = (typeof Currencies)[number];

export const useYnab = () => {
  const { data: ynabAccessToken, storeValue: setAccessToken } =
    useAsyncStorageChange<string>("@ynabAccessToken");
  const { data: budgetId, storeValue: storeBudgetId } =
    useAsyncStorageChange<string>("@ynabBudgetId");
  const { data: configuredAccounts, storeValue: storeConfiguredAccounts } =
    useAsyncStorageChange<{ [key in Currency]?: string } | null>(
      "@ynabConfiguredAccounts"
    );

  const client = useMemo(() => {
    if (ynabAccessToken) {
      return new ynab.API(ynabAccessToken);
    } else {
      return null;
    }
  }, [ynabAccessToken]);

  return {
    client,
    setAccessToken,
    setBudgetId: storeBudgetId,
    configuredAccounts: configuredAccounts ?? {},
    setConfiguredAccounts: storeConfiguredAccounts,
  };
};

export interface Transaction {
  date: string;
  currency: Currency;
  amount: number;
}

export const createTransaction = async (transaction: Transaction) => {
  const accessToken = await getData("@ynabAccessToken");

  if (!accessToken) {
    console.error("No YNAB access token found");
    return;
  }

  const budgetId = await getData("@ynabBudgetId");
  if (!budgetId) {
    console.error("No YNAB budget ID found");
    return;
  }
  const configuredAccounts = await getData("@ynabConfiguredAccounts");
  if (!configuredAccounts) {
    console.error("No YNAB configured accounts found");
    return;
  }
  const accountId = configuredAccounts[transaction.currency];
  if (!accountId) {
    console.error(
      "No YNAB account ID found for currency",
      transaction.currency
    );
    return;
  }

  const client = new ynab.API(accessToken);
  await client.transactions.createTransaction(budgetId, {
    transaction: {
      account_id: accountId,
      date: transaction.date,
      amount: transaction.amount,
    },
  });
};
