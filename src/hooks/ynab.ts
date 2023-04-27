import * as ynab from "ynab";

import { getData, useAsyncStorageChange } from "./storage";
import { useMemo } from "react";
import { NotificationPayload } from "./notificationHandler";

export const Currencies = ["$", "€", "£"] as const;
export type Currency = (typeof Currencies)[number];
export type ConfiguredAccounts = {
  [key in Currency]?: string;
};

export const useYnab = () => {
  const { data: ynabAccessToken, storeValue: setAccessToken } =
    useAsyncStorageChange("@ynabAccessToken");
  const { data: budgetId, storeValue: storeBudgetId } =
    useAsyncStorageChange("@ynabBudgetId");
  const { data: configuredAccounts, storeValue: storeConfiguredAccounts } =
    useAsyncStorageChange("@ynabConfiguredAccounts");

  const client = useMemo(() => {
    if (ynabAccessToken) {
      console.log("creating ynab client", ynabAccessToken);
      return new ynab.API(ynabAccessToken);
    } else {
      return null;
    }
  }, [ynabAccessToken]);

  return {
    client,
    setAccessToken,
    setBudgetId: storeBudgetId,
    budgetId,
    configuredAccounts: configuredAccounts ?? {},
    setConfiguredAccounts: storeConfiguredAccounts,
  };
};

export interface Transaction {
  date: string;
  currency: Currency;
  amount: number;
  payee: string;
}

export const handleNotification = async (notification: NotificationPayload) => {
  const transaction = parseRevolut(notification);
  console.info("transaction", transaction);
  if (!transaction) {
    console.info("Transaction not parsed");
    return false;
  }
  await createTransaction(transaction);
  return true;
};

const parseRevolut = (
  notification: NotificationPayload
): Transaction | null => {
  if (notification.app !== "com.revolut.revolut") {
    return null;
  }

  const amountPaid = notification.text.match(/(£|€|\$)(\d+(\.\d+)?)/);

  const currency = amountPaid?.[1] || null;
  const amountStr = amountPaid?.[2] || null;
  if (!currency || !amountStr || !Currencies.some((c) => c === currency)) {
    return null;
  }
  const amount = parseFloat(amountStr);

  return {
    date: new Date(parseInt(notification.time)).toISOString(),
    currency: currency as Currency,
    amount,
    payee: notification.title,
  };
};

const createTransaction = async (transaction: Transaction) => {
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
  const accountId = configuredAccounts?.[transaction.currency];
  if (!accountId) {
    console.error(
      "No YNAB account ID found for currency",
      transaction.currency
    );
    return;
  }

  console.info("creating transaction", transaction, accountId);

  // YNAB uses milliunits, so multiply by 1000: https://api.ynab.com/#formats
  const amount = Math.floor(transaction.amount * 1000);

  const client = new ynab.API(accessToken);
  await client.transactions.createTransaction(budgetId, {
    transaction: {
      account_id: accountId,
      date: transaction.date,
      amount,
    },
  });
};
