import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Load notifications from AsyncStorage
  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem("doctorNotifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Default notifications for new users
        const sample = [
          {
            id: "1",
            title: "New Consultation Request",
            message:
              "Patient Ali Khan requested a consultation on Oct 25, 2025 at 2:30 PM.",
            time: "2 min ago",
            read: false,
          },
          {
            id: "2",
            title: "Skin Analysis Uploaded",
            message:
              "Patient Sara Ahmed uploaded new AI skin analysis for review.",
            time: "30 min ago",
            read: false,
          },
          {
            id: "3",
            title: "Booking Cancelled",
            message:
              "Patient John cancelled his consultation scheduled for Oct 20, 2025.",
            time: "2 hours ago",
            read: true,
          },
        ];
        setNotifications(sample);
        await AsyncStorage.setItem("doctorNotifications", JSON.stringify(sample));
      }
    } catch (e) {
      console.log("Error loading notifications", e);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem("doctorNotifications", JSON.stringify(updated));
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    await AsyncStorage.setItem("doctorNotifications", JSON.stringify(updated));
  };

  // Clear all notifications
  const clearAll = async () => {
    Alert.alert("Clear All", "Delete all notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          setNotifications([]);
          await AsyncStorage.removeItem("doctorNotifications");
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: item.read ? "#f9f9f9" : "#fff" },
      ]}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name={item.read ? "notifications-outline" : "notifications"}
          size={22}
          color={item.read ? "#555" : "#000"}
        />
        <Text style={styles.title}>{item.title}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>

      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.time}</Text>

      <View style={styles.actions}>
        {!item.read && (
          <TouchableOpacity
            style={styles.readBtn}
            onPress={() => markAsRead(item.id)}
          >
            <Text style={styles.btnText}>Mark as Read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteNotification(item.id)}
        >
          <Text style={[styles.btnText, { color: "#000" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Ionicons name="trash-outline" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications yet 🎉</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  message: {
    color: "#333",
    marginBottom: 6,
  },
  time: {
    color: "#777",
    fontSize: 12,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  readBtn: {
    backgroundColor: "#000",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  btnText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 50,
    fontSize: 16,
  },
});
