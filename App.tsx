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
import * as Updates from "expo-updates";

import {
  notificationHandler,
  NotificationPayload,
} from "./src/hooks/notificationHandler";
import { useAsyncStorage } from "./src/hooks/storage";
import YnabConfigurationModal from "./src/components/ynabConfigurationModal";
import DebugModal from "./src/components/debugModal";

// const IS_PROD = Updates.manifest?.extra !== undefined;

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

  const { data: transactionsCreated } = useAsyncStorage(
    "@created-transactions"
  );

  const [configurationModalVisible, setConfigurationModalVisible] =
    useState(false);
  const [debugModalVisible, setDebugModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {configurationModalVisible && (
        <YnabConfigurationModal
          isVisible={configurationModalVisible}
          setIsVisible={setConfigurationModalVisible}
        />
      )}
      {debugModalVisible && (
        <DebugModal
          isVisible={debugModalVisible}
          setIsVisible={setDebugModalVisible}
        />
      )}
      <View style={styles.buttonWrapper}>
        <View style={styles.button}>
          <Button
            title="Configure YNAB"
            onPress={() => setConfigurationModalVisible(true)}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Debug"
            onPress={async () => {
              setDebugModalVisible(true);
            }}
          />
        </View>
      </View>
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
