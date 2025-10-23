import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // 👈 to receive params
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PatientDetail() {
  const router = useRouter();
  const { name, age, gender, skinType, allergies, history } = useLocalSearchParams();

  const [doctorNote, setDoctorNote] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notesList, setNotesList] = useState<{ id: number; diagnosis: string; note: string; date: string }[]>([]);

  // Dummy previous data (could be fetched via API later)
  const patient = {
    name: name || "Ayesha Khan",
    age: age || 25,
    gender: gender || "Female",
    skinType: skinType || "Combination",
    allergies: allergies || "None",
    history: history || "Mild acne since teenage years.",
    analyses: [
      {
        id: 1,
        date: "2025-10-12",
        score: 78,
        result: "Healthy skin with slight oiliness in T-zone.",
        image:
          "https://images.unsplash.com/photo-1611162617213-f7e7d1d296cf?auto=format&w=600&q=60",
      },
      {
        id: 2,
        date: "2025-09-25",
        score: 64,
        result: "Mild acne and pigmentation detected.",
        image:
          "https://images.unsplash.com/photo-1603791452906-b7c9ae4fa3a4?auto=format&w=600&q=60",
      },
    ],
    prescriptions: [
      {
        id: 1,
        date: "2025-09-25",
        meds: "Niacinamide 10% Serum, CeraVe Moisturizer, SPF 50 Sunscreen",
      },
    ],
  };

  const addNote = () => {
    if (!doctorNote.trim() || !diagnosis.trim()) {
      Alert.alert("Incomplete Entry", "Please enter both diagnosis and note.");
      return;
    }
    const newNote = {
      id: Date.now(),
      diagnosis,
      note: doctorNote,
      date: new Date().toLocaleDateString(),
    };
    setNotesList([newNote, ...notesList]);
    setDoctorNote("");
    setDiagnosis("");
    Alert.alert("Saved ✅", "Your diagnosis has been recorded.");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={40} color="#000" />
        <View>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.sub}>
            {patient.age} yrs | {patient.gender}
          </Text>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <Text style={styles.info}>Skin Type: {patient.skinType}</Text>
        <Text style={styles.info}>Allergies: {patient.allergies}</Text>
        <Text style={styles.info}>History: {patient.history}</Text>
      </View>

      {/* Past AI Analyses */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Past AI Analyses</Text>
        {patient.analyses.map((a) => (
          <View key={a.id} style={styles.analysisCard}>
            <Image source={{ uri: a.image }} style={styles.analysisImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.analysisDate}>Date: {a.date}</Text>
              <Text style={styles.analysisResult}>Score: {a.score}/100</Text>
              <Text style={styles.analysisText}>{a.result}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Past Prescriptions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Past Prescriptions</Text>
        {patient.prescriptions.map((p) => (
          <View key={p.id} style={styles.prescriptionCard}>
            <Text style={styles.analysisDate}>Date: {p.date}</Text>
            <Text style={styles.analysisText}>{p.meds}</Text>
          </View>
        ))}
      </View>

      {/* Add Diagnosis Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add New Diagnosis / Note</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Diagnosis (e.g. Acne Vulgaris)"
          value={diagnosis}
          onChangeText={setDiagnosis}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Write detailed note or treatment plan"
          multiline
          value={doctorNote}
          onChangeText={setDoctorNote}
        />
        <TouchableOpacity style={styles.btn} onPress={addNote}>
          <Text style={styles.btnText}>Save Diagnosis</Text>
        </TouchableOpacity>
      </View>

      {/* Previous Notes */}
      {notesList.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Previous Notes</Text>
          {notesList.map((n) => (
            <View key={n.id} style={styles.noteCard}>
              <Text style={styles.analysisDate}>{n.date}</Text>
              <Text style={styles.bold}>Diagnosis:</Text>
              <Text style={styles.analysisText}>{n.diagnosis}</Text>
              <Text style={styles.bold}>Note:</Text>
              <Text style={styles.analysisText}>{n.note}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20,paddingTop:0 },
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
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "bold", color: "#000" },
  sub: { color: "#555" },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 10 },
  info: { color: "#333", marginBottom: 5 },
  analysisCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
    gap: 10,
  },
  analysisImg: { width: 70, height: 70, borderRadius: 8 },
  analysisDate: { color: "#555", fontSize: 12 },
  analysisResult: { fontWeight: "bold", color: "#000" },
  analysisText: { color: "#333", fontSize: 13 },
  prescriptionCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },
  btn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  noteCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  bold: { fontWeight: "600", color: "#000" },
});
