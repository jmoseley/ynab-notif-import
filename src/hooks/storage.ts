import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const listeners: { key: string; listener: (value: any) => void }[] = [];

export const storeData = async <T>(key: string, object: T) => {
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

export const getData = async <T>(key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as T;
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

export const useAsyncStorageChange = <T>(key: string) => {
  const [data, setData] = useState<T | null>(null);

  listeners.push({ key, listener: setData });

  const refetch = useCallback(async () => {
    console.log("refetching", key);
    const value = await getData<T>(key);
    setData(value || null);
  }, [key, setData]);

  const clear = useCallback(() => {
    removeData(key);
    setData(null);
  }, [setData, key]);

  const storeValue = useCallback(
    async (value: T) => {
      await storeData(key, value);
    },
    [key]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { refetch, clear, data, storeValue };
};
