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
import { handleNotification } from "./src/hooks/ynab";

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

  const {
    refetch,
    clear,
    data: notifications,
    storeValue: storeNotifications,
  } = useAsyncStorageChange("@notifications-handled");

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
          <Button title="Reload" onPress={refetch} />
        </View>
        <View style={styles.button}>
          <Button title="Clear All" onPress={clear} />
        </View>
        <View style={styles.button}>
          <Button
            title="Configure YNAB"
            onPress={() => setConfigurationModalVisible(true)}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Reprocess Notifications"
            onPress={async () => {
              const unhandledNotifications: NotificationPayload[] = [];
              await Promise.all(
                notifications?.map(async (notification) => {
                  const result = await handleNotification(notification);
                  if (result) {
                    console.log("notification handled");
                  } else {
                    unhandledNotifications.push(notification);
                  }
                }) || []
              );
              // await storeNotifications(unhandledNotifications);
            }}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Create Test Notification"
            onPress={async () => {
              const notification: NotificationPayload = {
                time: new Date().getTime().toString(),
                app: "com.test.test",
                titleBig: "Test Notification",
                title: "Test Notification",
                text: "Paid $1.00 for a test notification",
                subText: "",
                bigText: "",
                summaryText: "",
                groupedMessages: [],
                icon: "",
                imageBackgroundURI: "",
                audioContentsURI: "",
                extraInfoText: "",
                image: "",
              };
              await storeNotifications([
                ...(notifications || []),
                notification,
              ]);
            }}
          />
        </View>
      </View>
      <ScrollView>
        {notifications?.map((notification) => (
          <View
            key={notification.time}
            style={{ ...styles.row, ...styles.notificationWrapper }}
          >
            <View>
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

                  return (
                    <Text key={key}>{`${key}: ${notification[key]}`}</Text>
                  );
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
            <View style={styles.buttonWrapper}>
              <View style={styles.button}>
                <Button
                  title="Clear"
                  onPress={async () => {
                    const newNotifications = notifications.filter(
                      (n) => n.time !== notification.time
                    );
                    await storeNotifications(newNotifications);
                  }}
                />
              </View>
              <View style={styles.button}>
                <Button
                  title="Reprocess"
                  onPress={async () => {
                    const result = await handleNotification(notification);
                    if (result) {
                      console.log("notification handled");
                    } else {
                      console.log("notification not handled");
                    }
                  }}
                />
              </View>
            </View>
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
  },
  row: {
    marginBottom: 10,
  },
  notificationWrapper: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 15,
    borderColor: "grey",
    borderWidth: 1,
    padding: 10,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 10,
  },
});
