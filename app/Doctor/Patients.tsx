import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Patients() {
  const router = useRouter();

  // Dummy patient data (you can later fetch this from backend)
  const patients = [
    { id: "1", name: "Ali Raza", age: 28, issue: "Skin Allergy" },
    { id: "2", name: "Sara Ahmed", age: 34, issue: "Acne Treatment" },
    { id: "3", name: "Hassan Khan", age: 41, issue: "Rash & Itching" },
    { id: "4", name: "Ayesha Malik", age: 22, issue: "Hair Fall" },
  ];

  const handleSelectPatient = (patient: any) => {
    router.push({
      pathname: "/Doctor/PatientDetail",
      params: patient, // send full patient object as params
    });
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

      <Text style={styles.title}>Patients List</Text>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectPatient(item)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>
              Age: {item.age} | Issue: {item.issue}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
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
    color: "#000000ff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#f2f2f2ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FF6E56",
  },
  name: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "600",
  },
  details: {
    color: "#000000ff",
    marginTop: 4,
    fontSize: 14,
  },
});
