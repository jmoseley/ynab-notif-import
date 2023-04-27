import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Transaction } from "./ynab";
import { NotificationPayload } from "./notificationHandler";

const listeners: { key: string; listener: (value: any) => void }[] = [];

const STORAGE_KEYS = [
  "@ynabAccessToken",
  "@ynabBudgetId",
  // "@ynabConfiguredAccounts",
  "@notifications-handled",
  "@notifications-ignored",
  "@created-transactions",
  "@default-account",
] as const;
type StorageKey = (typeof STORAGE_KEYS)[number];
type StorageValueMap = {
  "@ynabAccessToken": string | null;
  "@ynabBudgetId": string | null;
  // "@ynabConfiguredAccounts": ConfiguredAccounts | null;
  "@notifications-handled": NotificationPayload[] | null;
  "@notifications-ignored": NotificationPayload[] | null;
  "@created-transactions": Transaction[] | null;
  "@default-account": string | null;
};

export const storeData = async <K extends StorageKey>(
  key: K,
  object: StorageValueMap[K]
) => {
  try {
    const value = JSON.stringify(object);
    await AsyncStorage.setItem(key, value);
    listeners.forEach((listener) => {
      if (listener.key === key) {
        listener.listener(object);
      }
    });
  } catch (e) {
    console.error("Error saving value", e);
  }
};

export const getData = async <K extends StorageKey>(key: K) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as StorageValueMap[K];
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error reading value", e);
    return null;
  }
};

export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing value", e);
  }
};

export const useAsyncStorage = <K extends StorageKey>(key: K) => {
  const [data, setData] = useState<StorageValueMap[K] | null>(null);

  listeners.push({ key, listener: setData });

  const refetch = useCallback(async () => {
    const value = await getData(key);
    setData(value || null);
  }, [key, setData]);

  const clear = useCallback(() => {
    removeData(key);
    setData(null);
  }, [setData, key]);

  const storeValue = useCallback(
    async (value: StorageValueMap[K]) => {
      await storeData(key, value);
    },
    [key]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { refetch, clear, data, storeValue };
};
