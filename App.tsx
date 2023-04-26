import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  AppRegistry,
  Button,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import RNAndroidNotificationListener, {
  RNAndroidNotificationListenerHeadlessJsName,
} from "react-native-android-notification-listener";

import {
  notificationHandler,
  NotificationPayload,
} from "./src/hooks/notificationHandler";
import { useAsyncStorageChange } from "./src/hooks/storage";
import { useYnab } from "./src/hooks/ynab";
import YnabAccessTokenModal from "./src/components/ynabAccessTokenModal";

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

  const { client, setAccessToken } = useYnab();
  const [accessTokenModalVisible, setAccessTokenModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <YnabAccessTokenModal
        accessTokenModalVisible={accessTokenModalVisible}
        setAccessTokenModalVisible={setAccessTokenModalVisible}
        setAccessToken={setAccessToken}
      />
      <View style={styles.buttonWrapper}>
        <View style={styles.button}>
          <Button title="Reload Notifications" onPress={refetch} />
        </View>
        <View style={styles.button}>
          <Button title="Clear Notifications" onPress={clear} />
        </View>
        <View style={styles.button}>
          <Button
            title="Set YNAB Access Token"
            onPress={() => setAccessTokenModalVisible(true)}
          />
        </View>
      </View>
      <View style={{ marginVertical: 10 }}>
        {client && <Text>{`YNAB is configured`}</Text>}
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
    marginHorizontal: 10,
    // alignItems: "center",
    // justifyContent: "center",
  },
  row: {
    paddingBottom: 10,
  },
  button: {
    // margin: 10,
    flex: 1,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
});
