import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  AppRegistry,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RNAndroidNotificationListener, {
  RNAndroidNotificationListenerHeadlessJsName,
} from "react-native-android-notification-listener";

import { notificationHandler, Notification } from "./src/notificationHandler";
import { useAsyncStorageChange } from "./src/storage";

export default function App() {
  useEffect(() => {
    (async () => {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      console.log(status); // Result can be 'authorized', 'denied' or 'unknown'

      if (status !== "authorized") {
        // To open the Android settings so the user can enable it
        RNAndroidNotificationListener.requestPermission();
      }
    })();
  }, []);

  const { refetch, data } =
    useAsyncStorageChange<Notification[]>("@notifications");

  return (
    <SafeAreaView style={styles.container}>
      <Text>Notifications: {data?.length}</Text>
      <Text onPress={refetch}>Reload</Text>
      <ScrollView>
        {data?.map((notification) => (
          <Text key={notification.time}>
            {notification.title} - {notification.text}
          </Text>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => {
    console.log("getting handler");
    return notificationHandler;
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
