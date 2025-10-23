import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  issue: string;
}

export default function DoctorAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from AsyncStorage
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const storedAppointments = await AsyncStorage.getItem("doctorAppointments");
        if (storedAppointments) {
          setAppointments(JSON.parse(storedAppointments));
        } else {
          // Default appointments if none stored
          const defaultAppointments = [
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
          ];
          setAppointments(defaultAppointments);
          await AsyncStorage.setItem("doctorAppointments", JSON.stringify(defaultAppointments));
        }
      } catch (error) {
        console.log("Error loading appointments:", error);
      }
    };
    loadAppointments();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const updatedAppointments = appointments.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setAppointments(updatedAppointments);
    await AsyncStorage.setItem("doctorAppointments", JSON.stringify(updatedAppointments));
    Alert.alert("Status Updated", `Appointment marked as ${newStatus}.`);
  };

  const renderItem = ({ item }: { item: Appointment }) => {
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
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push("/Doctor/DoctorProfile")} style={styles.navIcon}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.appTitle}>DOCTOR PANEL</Text>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={() => router.push("/Doctor/DoctorNotifications")} style={styles.navIcon}>
            <Ionicons name="notifications-outline" size={22} color="#FF6E56" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/Doctor/DoctorChat")} style={styles.navIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

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
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },
  appTitle: { color: "#fff", fontWeight: "900", fontSize: 20, letterSpacing: 1 },
  navRight: { flexDirection: "row", alignItems: "center" },
  navIcon: { marginHorizontal: 8 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 20,
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
