import * as ynab from "ynab";

import { getData, storeData, useAsyncStorage } from "./storage";
import { useMemo } from "react";
import { NotificationPayload } from "./notificationHandler";

export const Currencies = ["$", "€", "£"] as const;
export type Currency = (typeof Currencies)[number];
export type ConfiguredAccounts = {
  [key in Currency]?: string;
};

const CURRENCY_REGEX = /(-)?(£|€|\$)(\d+(\.\d+)?)/;

export const useYnab = () => {
  const { data: ynabAccessToken, storeValue: setAccessToken } =
    useAsyncStorage("@ynabAccessToken");
  const { data: budgetId, storeValue: storeBudgetId } =
    useAsyncStorage("@ynabBudgetId");
  // const { data: configuredAccounts, storeValue: storeConfiguredAccounts } =
  //   useAsyncStorage("@ynabConfiguredAccounts");
  const { data: defaultAccount, storeValue: storeDefaultAccount } =
    useAsyncStorage("@default-account");

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
    // configuredAccounts: configuredAccounts ?? {},
    defaultAccount,
    storeDefaultAccount,
    // setConfiguredAccounts: storeConfiguredAccounts,
  };
};

export interface Transaction {
  date: string;
  currency: Currency;
  amount: number;
  payee: string;
}

export const handleNotification = async (notification: NotificationPayload) => {
  const transaction = parseRevolut(notification) || parseTest(notification);
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

  const amountPaid = notification.text.match(CURRENCY_REGEX);

  const isCashback = notification.title.includes("cashback");
  const isRefund = notification.title.includes("refund");

  const isNegative = amountPaid?.[1] === "-" || isCashback || isRefund;
  const currency = amountPaid?.[2] || null;
  const amountStr = amountPaid?.[3] || null;
  if (!currency || !amountStr) {
    return null;
  }
  const amount = parseFloat(amountStr) * (isNegative ? -1 : 1);

  return {
    date: new Date(parseInt(notification.time)).toISOString(),
    currency: currency as Currency,
    amount,
    payee: isCashback ? "Cashback" : notification.title,
  };
};

const parseTest = (notification: NotificationPayload): Transaction | null => {
  if (notification.app !== "com.test.test") {
    return null;
  }

  const amountPaid = notification.text.match(CURRENCY_REGEX);

  const isNegative = amountPaid?.[1] === "-";
  const currency = amountPaid?.[2] || null;
  const amountStr = amountPaid?.[3] || null;
  if (!currency || !amountStr || !Currencies.some((c) => c === currency)) {
    return null;
  }
  const amount = parseFloat(amountStr) * (isNegative ? -1 : 1);

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
  const accountId = await getData("@default-account");
  if (!accountId) {
    console.error("No YNAB account ID found");
    return;
  }

  console.info("creating transaction", transaction, accountId);

  const existingTransactions = (await getData("@created-transactions")) || [];
  existingTransactions.push(transaction);
  await storeData("@created-transactions", existingTransactions);

  // YNAB uses milliunits, so multiply by 1000: https://api.ynab.com/#formats
  const amount = -Math.floor(transaction.amount * 1000);

  const client = new ynab.API(accessToken);
  await client.transactions.createTransaction(budgetId, {
    transaction: {
      account_id: accountId,
      date: transaction.date,
      amount,
      payee_name: transaction.payee,
    },
  });
};
