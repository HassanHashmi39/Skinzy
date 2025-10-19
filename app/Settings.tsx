import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logged Out", "You have been logged out successfully.");
    router.replace("/Login");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#000" : "#fff" },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: darkMode ? "#fff" : "#000" },
        ]}
      >
        Settings
      </Text>

      <View style={styles.option}>
        <Text
          style={[
            styles.label,
            { color: darkMode ? "#fff" : "#000" },
          ]}
        >
          Dark Mode
        </Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor={darkMode ? "#fff" : "#000"}
          trackColor={{ false: "#ccc", true: "#444" }}
        />
      </View>

      <View style={styles.option}>
        <Text
          style={[
            styles.label,
            { color: darkMode ? "#fff" : "#000" },
          ]}
        >
          Notifications
        </Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          thumbColor={notifications ? "#fff" : "#000"}
          trackColor={{ false: "#ccc", true: "#444" }}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: darkMode ? "#fff" : "#000" },
        ]}
        onPress={() => Alert.alert("Privacy Policy", "Privacy Policy content.")}
      >
        <Text
          style={[
            styles.buttonText,
            { color: darkMode ? "#000" : "#fff" },
          ]}
        >
          Privacy Policy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.logoutBtn,
          { borderColor: darkMode ? "#fff" : "#000" },
        ]}
        onPress={handleLogout}
      >
        <Text
          style={[
            styles.logoutText,
            { color: darkMode ? "#fff" : "#000" },
          ]}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutBtn: {
    borderWidth: 1,
  },
  logoutText: {
    fontWeight: "bold",
  },
});
