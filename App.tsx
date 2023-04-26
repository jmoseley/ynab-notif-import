import "react-native-url-polyfill/auto";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  AppRegistry,
  Button,
  Image,
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
} from "./src/hooks/notificationHandler";
import { useAsyncStorageChange } from "./src/hooks/storage";
import YnabConfigurationModal from "./src/components/ynabConfigurationModal";

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

  const [configurationModalVisible, setConfigurationModalVisible] =
    useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {configurationModalVisible && (
        <YnabConfigurationModal
          isVisible={configurationModalVisible}
          setIsVisible={setConfigurationModalVisible}
        />
      )}
      <View style={styles.buttonWrapper}>
        <View style={styles.button}>
          <Button title="Reload Notifications" onPress={refetch} />
        </View>
        <View style={styles.button}>
          <Button title="Clear Notifications" onPress={clear} />
        </View>
        <View style={styles.button}>
          <Button
            title="Configure YNAB"
            onPress={() => setConfigurationModalVisible(true)}
          />
        </View>
      </View>
      {/* <View style={{ marginVertical: 10 }}>
        {client && <Text>{`YNAB is configured`}</Text>}
      </View> */}
      <ScrollView>
        {data?.map((notification) => (
          <View key={notification.time} style={styles.row}>
            {(Object.keys(notification) as (keyof NotificationPayload)[]).map(
              (key) => {
                if (key === "groupedMessages") return null;
                if (!notification[key]) return null;

                if (notification[key].startsWith("data:")) {
                  return (
                    <View key={key}>
                      <Text>{`${key}:`}</Text>
                      <Image
                        source={{ uri: notification[key] }}
                        alt={key}
                        style={{
                          width: 100,
                          height: 100,
                          borderColor: "black",
                          borderWidth: 1,
                        }}
                      />
                    </View>
                  );
                }

                return <Text key={key}>{`${key}: ${notification[key]}`}</Text>;
              }
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
