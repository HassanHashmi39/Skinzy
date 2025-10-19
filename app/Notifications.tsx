import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Booking Confirmed",
      message: "Your consultation with Dr. Ayesha Malik is scheduled for Oct 25, 2025 at 3:00 PM.",
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
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderItem = ({ item }: any) => (
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
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
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
