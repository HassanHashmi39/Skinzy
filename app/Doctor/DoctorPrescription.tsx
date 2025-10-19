import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DoctorPrescription() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patients = [
    { id: "1", name: "Ahsan Shah", condition: "Acne & Oily Skin" },
    { id: "2", name: "Sana Fatima", condition: "Dryness & Pigmentation" },
    { id: "3", name: "Ali Khan", condition: "Dark Circles" },
  ];

  const [prescriptions, setPrescriptions] = useState({});
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const addMedicine = () => {
    if (!medicineName || !dosage) {
      Alert.alert("Incomplete", "Please fill medicine name and dosage.");
      return;
    }

    const newMed = { id: Date.now().toString(), medicineName, dosage, instructions };

    setPrescriptions((prev) => ({
      ...prev,
      [selectedPatient]: [...(prev[selectedPatient] || []), newMed],
    }));

    setMedicineName("");
    setDosage("");
    setInstructions("");
  };

  const sendPrescription = () => {
    if (!prescriptions[selectedPatient]?.length) {
      Alert.alert("Empty", "Please add at least one medicine before sending.");
      return;
    }
    Alert.alert("✅ Sent", "Prescription sent to the patient successfully.");
    setSelectedPatient(null);
  };

  if (!selectedPatient) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Patient Prescriptions</Text>
        <Text style={styles.subtitle}>Select a patient to create treatment plan</Text>

        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.patientCard}
              onPress={() => setSelectedPatient(item.id)}
            >
              <Ionicons name="person-circle-outline" size={40} color="#000" />
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.condition}>{item.condition}</Text>
              </View>
              <Ionicons name="medkit-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Prescription form
  return (
    <ScrollView style={styles.formContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedPatient(null)}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {patients.find((p) => p.id === selectedPatient)?.name}
        </Text>
      </View>

      {/* Medicine Form */}
      <Text style={styles.sectionTitle}>Add Medicine</Text>

      <TextInput
        style={styles.input}
        placeholder="Medicine Name"
        placeholderTextColor="#777"
        value={medicineName}
        onChangeText={setMedicineName}
      />
      <TextInput
        style={styles.input}
        placeholder="Dosage (e.g. 1 tablet twice daily)"
        placeholderTextColor="#777"
        value={dosage}
        onChangeText={setDosage}
      />
      <TextInput
        style={[styles.input, { height: 70 }]}
        placeholder="Special Instructions (optional)"
        placeholderTextColor="#777"
        value={instructions}
        onChangeText={setInstructions}
        multiline
      />

      <TouchableOpacity style={styles.addBtn} onPress={addMedicine}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Add Medicine</Text>
      </TouchableOpacity>

      {/* Added Medicines */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Prescription List</Text>

        {prescriptions[selectedPatient]?.length ? (
          prescriptions[selectedPatient].map((med) => (
            <View key={med.id} style={styles.medicineCard}>
              <Text style={styles.medicineName}>{med.medicineName}</Text>
              <Text style={styles.medicineDetail}>💊 {med.dosage}</Text>
              {med.instructions ? (
                <Text style={styles.medicineDetail}>📝 {med.instructions}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={{ color: "#666", marginTop: 10 }}>No medicines added yet.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.sendBtn} onPress={sendPrescription}>
        <Text style={styles.sendText}>Send Prescription</Text>
      </TouchableOpacity>
    </ScrollView>
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
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  patientName: {
    fontWeight: "bold",
    color: "#000",
  },
  condition: {
    color: "#666",
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: "#000",
  },
  addBtn: {
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  medicineCard: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  medicineName: {
    fontWeight: "bold",
    color: "#000",
  },
  medicineDetail: {
    color: "#333",
    fontSize: 13,
    marginTop: 3,
  },
  sendBtn: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 40,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
