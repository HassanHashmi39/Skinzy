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
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    color: "#FF6E56",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  details: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 14,
  },
});
