import { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { Currencies, useYnab } from "../hooks/ynab";
import { useAsync } from "../hooks/useAsync";

const YnabConfigurationModal = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
}) => {
  const [newAccessTokenValue, setNewAccessTokenValue] = useState("");
  const {
    setAccessToken,
    setBudgetId,
    // setConfiguredAccounts,
    // configuredAccounts,
    client,
    storeDefaultAccount,
    defaultAccount,
    budgetId,
  } = useYnab();

  const {
    execute: loadBudgets,
    value: budgetList,
    error,
    status,
  } = useAsync(async () => {
    if (client) {
      console.log("getting budgets");
      try {
        const budgets = await client.budgets.getBudgets(true);
        console.log("found budgets", budgets);
        return budgets.data.budgets;
      } catch (e) {
        console.error("error getting budgets", e);
        // sleep for a bit
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return null;
      }
    } else {
      return null;
    }
  }, false);

  const {
    execute: loadAccounts,
    value: accounts,
    error: accountsError,
    status: accountsStatus,
  } = useAsync(async () => {
    if (client && budgetId) {
      console.log("getting accounts");
      try {
        const accounts = await client.accounts.getAccounts(budgetId);
        console.log("found accounts", accounts);
        return accounts.data.accounts;
      } catch (e) {
        console.error("error getting accounts", e);
        // sleep for a bit
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return null;
      }
    } else {
      return null;
    }
  }, false);

  useEffect(() => {
    console.log("budgetList", budgetList, !!client);
    if (
      client &&
      !budgetList &&
      !error &&
      status !== "success" &&
      status !== "error"
    ) {
      loadBudgets();
    } else {
      console.log("not loading budgets", !!client, budgetList, error, status);
    }
  }, [client, budgetList]);

  useEffect(() => {
    console.log("accounts", accounts, !!client);
    if (
      client &&
      budgetId &&
      !accounts &&
      !accountsError &&
      accountsStatus !== "success" &&
      accountsStatus !== "error"
    ) {
      loadAccounts();
    } else {
      console.log(
        "not loading accounts",
        !!client,
        accounts,
        accountsError,
        accountsStatus
      );
    }
  }, [client, accounts, budgetId]);

  return (
    <Modal visible={isVisible}>
      <View style={{ margin: 10 }}>
        <Text>Set Access Token</Text>
        <TextInput
          onChangeText={(value) => {
            setNewAccessTokenValue(value);
          }}
          value={newAccessTokenValue || client ? "placeholder" : ""}
          style={styles.input}
          secureTextEntry={true}
          placeholder="New Access Token"
        />
        <View style={styles.buttonWrapper}>
          <View style={styles.button}>
            <Button
              title="Set Access Token"
              onPress={async () => {
                await setAccessToken(newAccessTokenValue);
              }}
            />
          </View>
          <View style={styles.button}>
            <Button title="Close" onPress={() => setIsVisible(false)} />
          </View>
        </View>
        {/* Handle failures */}
        {budgetList && (
          <View>
            <Text>Choose budget</Text>
            <Picker
              selectedValue={budgetId}
              onValueChange={(itemValue) => setBudgetId(itemValue)}
            >
              <Picker.Item label="None" value={null} />
              {budgetList.map((budget) => (
                <Picker.Item
                  key={budget.id}
                  label={budget.name}
                  value={budget.id}
                />
              ))}
            </Picker>
          </View>
        )}
        {accounts && (
          <View>
            <Text>Choose Account</Text>
            <Picker
              selectedValue={defaultAccount}
              onValueChange={(itemValue) => storeDefaultAccount(itemValue)}
            >
              <Picker.Item label="None" value={null} />
              {accounts.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.name}
                  value={account.id}
                />
              ))}
            </Picker>
          </View>
          // <View>
          //   {Currencies.map((currency) => (
          //     <View key={currency}>
          //       <Text>{`Choose account for ${currency}`}</Text>
          //       <Picker
          //         selectedValue={configuredAccounts[currency]}
          //         onValueChange={(itemValue) =>
          //           setConfiguredAccounts({
          //             ...configuredAccounts,
          //             [currency]: itemValue,
          //           })
          //         }
          //       >
          //         <Picker.Item label="None" value={null} />
          //         {accounts.map((account) => (
          //           <Picker.Item
          //             key={account.id}
          //             label={account.name}
          //             value={account.id}
          //           />
          //         ))}
          //       </Picker>
          //     </View>
          //   ))}
          // </View>
        )}
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

export default YnabConfigurationModal;
