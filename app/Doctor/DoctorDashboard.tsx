import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState({
    name: "Dr. Ayesha Malik",
    specialization: "Dermatologist",
    experience: "7 Years",
    clinic: "SkinGlow Clinic, Lahore",
  });

  const [stats, setStats] = useState({
    totalPatients: 320,
    todayAppointments: 5,
    pendingConsults: 2,
    earnings: "45,000 PKR",
  });

  const [appointments, setAppointments] = useState([
    {
      id: "1",
      patient: "Sara Khan",
      time: "10:00 AM",
      status: "Confirmed",
      issue: "Acne & Oil Control",
    },
    {
      id: "2",
      patient: "Ali Raza",
      time: "12:30 PM",
      status: "Pending",
      issue: "Dark Spots",
    },
  ]);

  useEffect(() => {
    // Later connect to backend for dynamic doctor data
  }, []);

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View>
        <Text style={styles.patientName}>{item.patient}</Text>
        <Text style={styles.issueText}>{item.issue}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.statusBtn,
          item.status === "Confirmed"
            ? { backgroundColor: "#000" }
            : { backgroundColor: "#888" },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {doctor.name}</Text>
        <Text style={styles.subtitle}>{doctor.specialization}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {Object.entries(stats).map(([key, value]) => (
          <View style={styles.statBox} key={key}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Text>
          </View>
        ))}
      </View>

      {/* Today&apos;s Appointments */}
      <Text style={styles.sectionTitle}>Today&apos;s Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={{ color: "#555", textAlign: "center" }}>
            No appointments today.
          </Text>
        }
      />

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubbles-outline" size={22} color="#000" />
          <Text style={styles.actionText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="calendar-outline" size={22} color="#000" />
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="people-outline" size={22} color="#000" />
          <Text style={styles.actionText}>Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="stats-chart-outline" size={22} color="#000" />
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    color: "#555",
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    color: "#555",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    marginTop: 10,
  },
  appointmentCard: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  patientName: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 15,
  },
  issueText: {
    color: "#555",
  },
  timeText: {
    color: "#333",
    marginTop: 3,
  },
  statusBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionBtn: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    color: "#000",
    fontWeight: "bold",
    marginTop: 6,
  },
});
