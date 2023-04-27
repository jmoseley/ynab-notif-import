import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Button,
} from "react-native";

import { useAsyncStorage } from "../hooks/storage";
import { NotificationPayload } from "../hooks/notificationHandler";
import { handleNotification } from "../hooks/ynab";
import { useState } from "react";

interface Props {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
}

const DebugModal = ({ isVisible, setIsVisible }: Props) => {
  const {
    clear,
    data: notificationsHandled,
    storeValue: storeNotifications,
  } = useAsyncStorage("@notifications-handled");
  const {
    clear: clearIgnored,
    data: notificationsIgnored,
    storeValue: storeNotificationsIgnored,
  } = useAsyncStorage("@notifications-ignored");

  const [shownNotifications, setShownNotifications] = useState<
    "handled" | "ignored"
  >("handled");

  return (
    <Modal visible={isVisible}>
      <View style={styles.modal}>
        <View>
          <Text>Debugging Info</Text>
        </View>
        <View style={{ ...styles.buttonWrapper, marginVertical: 10 }}>
          <View style={styles.button}>
            <Button title="Close" onPress={() => setIsVisible(false)} />
          </View>
          <View style={styles.button}>
            <Button
              title="Clear All"
              onPress={() => {
                clear();
                clearIgnored();
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
                  text: "Paid -$1.00 for a test notification",
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
                  ...(notificationsHandled || []),
                  notification,
                ]);
              }}
            />
          </View>
          <View style={styles.button}>
            <Button
              title={`Show ${
                shownNotifications === "handled" ? "Ignored" : "Handled"
              } Notifications`}
              onPress={() =>
                setShownNotifications(
                  shownNotifications === "handled" ? "ignored" : "handled"
                )
              }
            />
          </View>
        </View>
        <NotificationView
          notifications={
            shownNotifications === "handled"
              ? notificationsHandled
              : notificationsIgnored
          }
          clearNotification={async (notification) => {
            if (shownNotifications === "handled") {
              if (!notificationsHandled) return;

              const newNotifications = notificationsHandled.filter(
                (n) => n.time !== notification.time
              );
              await storeNotifications(newNotifications);
            } else {
              if (!notificationsIgnored) return;

              const newNotifications = notificationsIgnored.filter(
                (n) => n.time !== notification.time
              );
              await storeNotificationsIgnored(newNotifications);
            }
          }}
        />
      </View>
    </Modal>
  );
};

//

const NotificationView = ({
  notifications,
  clearNotification,
}: {
  notifications: NotificationPayload[] | null;
  clearNotification: (notification: NotificationPayload) => void;
}) => {
  return (
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
          <View style={styles.buttonWrapper}>
            <View style={styles.button}>
              <Button
                title="Clear"
                onPress={() => clearNotification(notification)}
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
  );
};

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
  modal: {
    flex: 1,
    margin: 20,
    backgroundColor: "white",
    flexDirection: "column",
  },
});

export default DebugModal;
