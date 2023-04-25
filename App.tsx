import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  AppRegistry,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RNAndroidNotificationListener, {
  RNAndroidNotificationListenerHeadlessJsName,
} from "react-native-android-notification-listener";

import {
  notificationHandler,
  NotificationPayload,
} from "./src/notificationHandler";
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

  const { refetch, clear, data } =
    useAsyncStorageChange<NotificationPayload[]>("@notifications");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonWrapper}>
        <View style={styles.button}>
          <Button title="Reload" onPress={refetch} />
        </View>
        <View style={styles.button}>
          <Button title="Clear" onPress={clear} />
        </View>
      </View>
      <ScrollView>
        {data?.map((notification) => (
          <View key={notification.time} style={styles.row}>
            {notification.app && <Text>{notification.app}</Text>}
            {notification.title && (
              <Text>{`Title: ${notification.title}`}</Text>
            )}
            {notification.text && <Text>{`Text: ${notification.text}`}</Text>}
            {notification.subText && (
              <Text>{`SubText: ${notification.subText}`}</Text>
            )}
            {notification.groupedMessages.length > 0 &&
              notification.groupedMessages.map((message, idx) => (
                <View style={styles.row} key={idx}>
                  <Text>{idx}</Text>
                  {message.title && <Text>{message.title}</Text>}
                  {message.text && <Text>{message.text}</Text>}
                </View>
              ))}
          </View>
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
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    // justifyContent: "center",
  },
  row: {
    paddingBottom: 10,
  },
  button: {
    margin: 30,
    flex: 1,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
