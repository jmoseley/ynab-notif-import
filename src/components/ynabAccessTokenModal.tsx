import { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";

const YnabAccessTokenModal = ({
  accessTokenModalVisible,
  setAccessTokenModalVisible,
  setAccessToken,
}: {
  accessTokenModalVisible: boolean;
  setAccessTokenModalVisible: (value: boolean) => void;
  setAccessToken: (value: string) => Promise<void>;
}) => {
  const [newAccessTokenValue, setNewAccessTokenValue] = useState("");

  return (
    <Modal visible={accessTokenModalVisible}>
      <View>
        <Text>Set Access Token</Text>
        <TextInput
          onChangeText={(value) => {
            setNewAccessTokenValue(value);
          }}
          style={styles.input}
          placeholder="New Access Token"
        />
        <View style={styles.buttonWrapper}>
          <View style={styles.button}>
            <Button
              title="Set"
              onPress={async () => {
                await setAccessToken(newAccessTokenValue);
                setAccessTokenModalVisible(false);
              }}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Close"
              onPress={() => setAccessTokenModalVisible(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  input: {
    margin: 5,
    padding: 5,
    borderColor: "black",
  },
});

export default YnabAccessTokenModal;
