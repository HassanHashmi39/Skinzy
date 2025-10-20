import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const image = require("../Images/Background.png");

const PATIENTS = [
  { id: "p1", name: "Ayesha Khan", age: 25, issue: "Acne Treatment", img: "https://randomuser.me/api/portraits/women/65.jpg" },
  { id: "p2", name: "Ali Raza", age: 30, issue: "Dark Spots", img: "https://randomuser.me/api/portraits/men/75.jpg" },
  { id: "p3", name: "Sara Ahmed", age: 22, issue: "Pigmentation", img: "https://randomuser.me/api/portraits/women/45.jpg" },
  { id: "p4", name: "Bilal Malik", age: 28, issue: "Skin Sensitivity", img: "https://randomuser.me/api/portraits/men/43.jpg" },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState("Doctor");
  const [profileImage, setProfileImage] = useState(null);

  // Load profile data from AsyncStorage
  useEffect(() => {
    const loadDoctorProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem("doctorProfile");
        if (storedProfile) {
          const data = JSON.parse(storedProfile);
          setDoctorName(data.name || "Doctor");
          setProfileImage(data.image || null);
        }
      } catch (error) {
        console.log("Error loading doctor profile:", error);
      }
    };
    loadDoctorProfile();

    // Listen for screen focus to refresh data when returning from Profile
    const unsubscribe = router.addListener?.("focus", loadDoctorProfile);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.screen}>
      <ImageBackground source={image} resizeMode="cover" style={styles.bg}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.push("/Doctor/DoctorProfile")} style={styles.navIcon}>
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.appTitle}>DOCTOR PANEL</Text>

          <View style={styles.navRight}>
            <TouchableOpacity onPress={() => router.push("/Doctor/DoctorNotifications")} style={styles.navIcon}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/Doctor/DoctorChat")} style={styles.navIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Doctor Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png",
            }}
            style={styles.profileImage}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.name}>{doctorName}</Text>
            <Text style={styles.subText}>Dermatologist</Text>
          </View>
        </View>

        {/* Patients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Patients</Text>
          <FlatList
            data={PATIENTS}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientCard}
                onPress={() =>
                  router.push({ pathname: "/PatientDetail", params: { id: item.id } })
                }
              >
                <Image source={{ uri: item.img }} style={styles.patientImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{item.name}</Text>
                  <Text style={styles.patientInfo}>
                    {item.age} yrs | {item.issue}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color="#999" />
              </TouchableOpacity>
            )}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  bg: { flex: 1, width: "100%", height: "100%" },
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

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    elevation: 3,
  },
  profileImage: { width: 70, height: 70, borderRadius: 40 },
  greeting: { fontSize: 13, color: "#555" },
  name: { fontSize: 18, fontWeight: "900", color: "#000" },
  subText: { fontSize: 12, color: "#777" },

  section: { flex: 1, marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10, color: "#000" },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  patientImg: { width: 55, height: 55, borderRadius: 30, marginRight: 10 },
  patientName: { fontWeight: "700", fontSize: 14, color: "#000" },
  patientInfo: { color: "#777", fontSize: 12 },
});
