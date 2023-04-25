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

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error reading value", e);
  }
};

export const useAsyncStorageChange = <T>(key: string) => {
  const [data, setData] = useState<T | null>(null);

  listeners.push({ key, listener: setData });

  const refetch = useCallback(async () => {
    console.log("refetching", key);
    const value = await getData(key);
    setData(value);
  }, [key, setData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { refetch, data };
};
