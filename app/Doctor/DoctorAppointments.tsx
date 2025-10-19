import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      patientName: "Ahsan Shah",
      date: "2025-10-21",
      time: "2:00 PM",
      status: "Pending",
      issue: "Acne and oily skin",
    },
    {
      id: "2",
      patientName: "Sana Fatima",
      date: "2025-10-22",
      time: "4:00 PM",
      status: "Accepted",
      issue: "Pigmentation and dryness",
    },
    {
      id: "3",
      patientName: "Ali Khan",
      date: "2025-10-19",
      time: "5:00 PM",
      status: "Completed",
      issue: "Dark circles and dull skin",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    Alert.alert("Status Updated", `Appointment marked as ${newStatus}.`);
  };

  const renderItem = ({ item }) => {
    const isPending = item.status === "Pending";
    const isAccepted = item.status === "Accepted";

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text
            style={[
              styles.status,
              {
                color:
                  item.status === "Pending"
                    ? "#d97706"
                    : item.status === "Accepted"
                    ? "#059669"
                    : "#2563eb",
              },
            ]}
          >
            {item.status}
          </Text>
        </View>

        <Text style={styles.detail}>
          <Ionicons name="calendar-outline" size={14} /> {item.date} |{" "}
          {item.time}
        </Text>
        <Text style={styles.detail}>
          <Ionicons name="medical-outline" size={14} /> {item.issue}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#059669" }]}
                onPress={() => updateStatus(item.id, "Accepted")}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#dc2626" }]}
                onPress={() => updateStatus(item.id, "Rejected")}
              >
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {isAccepted && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#2563eb" }]}
              onPress={() => updateStatus(item.id, "Completed")}
            >
              <Text style={styles.btnText}>Mark Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      <Text style={styles.subtitle}>Manage your patient consultations</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#777", marginTop: 50 }}>
            No appointments yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  patientName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  status: {
    fontWeight: "bold",
  },
  detail: {
    color: "#333",
    fontSize: 13,
    marginVertical: 3,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
