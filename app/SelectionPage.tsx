import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function SelectUserType() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert("Please select a role", "Choose Doctor or Patient to continue.");
      return;
    }

    try {
      await AsyncStorage.setItem("userType", selectedType);
      if (selectedType === "Doctor") router.replace("/Doctor/DoctorInformationForm");
      else router.replace("/Patient/UserInfoScreen");
    } catch (err) {
      Alert.alert("Error", "Something went wrong while saving your choice.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DermaCare 🌿</Text>
      <Text style={styles.subtitle}>
        Please select your role to continue
      </Text>

      <View style={styles.cardContainer}>
        {/* Doctor Option */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedType === "Doctor" && styles.selectedCard,
          ]}
          onPress={() => setSelectedType("Doctor")}
        >
          <Ionicons name="medkit-outline" size={40} color="#000" />
          <Text style={styles.cardTitle}>Doctor</Text>
          <Text style={styles.cardText}>
            Manage patients, view consultations, and provide skin care advice.
          </Text>
        </TouchableOpacity>

        {/* Patient Option */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedType === "Patient" && styles.selectedCard,
          ]}
          onPress={() => setSelectedType("Patient")}
        >
          <Ionicons name="person-circle-outline" size={40} color="#000" />
          <Text style={styles.cardTitle}>Patient</Text>
          <Text style={styles.cardText}>
            Analyze your skin, book consultations, and track your progress.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    color: "#444",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 14,
  },
  cardContainer: {
    width: "100%",
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedCard: {
    backgroundColor: "#000",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  cardText: {
    color: "#444",
    textAlign: "center",
    marginTop: 8,
  },
  continueBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  continueText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
