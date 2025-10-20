import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications from storage
  useEffect(() => {
    const loadNotifications = async () => {
      const stored = await AsyncStorage.getItem("notifications");
      if (stored) setNotifications(JSON.parse(stored));
      else setNotifications(sampleNotifications);
    };
    loadNotifications();
  }, []);

  // Sample defaults (only used if no saved data exists)
  const sampleNotifications = [
    {
      id: "1",
      title: "Booking Confirmed",
      message:
        "Your consultation with Dr. Ayesha Malik is scheduled for Oct 25, 2025 at 3:00 PM.",
      time: "2 min ago",
      read: false,
    },
    {
      id: "2",
      title: "Doctor Message",
      message: "Dr. Fatima Noor has sent you a follow-up questionnaire.",
      time: "1 hr ago",
      read: false,
    },
    {
      id: "3",
      title: "Reminder",
      message: "Don’t forget your appointment tomorrow at 2:30 PM.",
      time: "1 day ago",
      read: true,
    },
  ];

  const saveNotifications = async (data) => {
    setNotifications(data);
    await AsyncStorage.setItem("notifications", JSON.stringify(data));
  };

  const markAsRead = async (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    await saveNotifications(updated);
  };

  const deleteNotification = async (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    await saveNotifications(updated);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const stored = await AsyncStorage.getItem("notifications");
    if (stored) setNotifications(JSON.parse(stored));
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: item.read ? "#f9f9f9" : "#fff" },
      ]}
    >
      <View style={styles.cardHeader}>
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
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#777", marginTop: 30 }}>
            No notifications yet.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
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
    marginBottom: 5,
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
    marginBottom: 8,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
