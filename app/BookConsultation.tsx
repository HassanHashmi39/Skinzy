import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookConsultation() {
  const { doctor } = useLocalSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    age: "",
    skinType: "",
    familyDisease: "",
    allergies: "",
    date: "",
    time: "",
    description: "",
  });

  const handleChange = (key, value) =>
    setFormData({ ...formData, [key]: value });

  const handleSubmit = async () => {
    const required = ["name", "email", "gender", "skinType", "date", "time"];
    for (const field of required) {
      if (!formData[field]) {
        Alert.alert("Missing Fields", `Please fill in ${field} field.`);
        return;
      }
    }

    try {
      // ---- Send to Formspree ----
      await fetch("https://formspree.io/f/xqayjpng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: doctor || "General Dermatologist",
          ...formData,
        }),
      });

      // ---- Save booking locally ----
      const existing = JSON.parse(await AsyncStorage.getItem("bookings")) || [];
      const newBooking = {
        id: Date.now(),
        doctor: doctor || "General Dermatologist",
        date: formData.date,
        time: formData.time,
        mode: "Online",
        notes: formData.description,
        status: "Pending",
      };
      existing.push(newBooking);
      await AsyncStorage.setItem("bookings", JSON.stringify(existing));

      // ---- Navigate to success screen ----
      router.push("/BookingSuccess");

      // ---- Reset form ----
      setFormData({
        name: "",
        email: "",
        gender: "",
        age: "",
        skinType: "",
        familyDisease: "",
        allergies: "",
        date: "",
        time: "",
        description: "",
      });
    } catch (error) {
      Alert.alert("Error", "Something went wrong, please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book Consultation</Text>
      <Text style={styles.subtitle}>
        {doctor ? `Booking with ${doctor}` : "Please select a doctor from the list"}
      </Text>

      <View style={styles.form}>
        {[
          { key: "name", label: "Full Name *", placeholder: "Enter your full name" },
          { key: "email", label: "Email *", placeholder: "Enter your email", keyboard: "email-address" },
          { key: "gender", label: "Gender *", placeholder: "Male / Female / Other" },
          { key: "age", label: "Age", placeholder: "Enter your age", keyboard: "numeric" },
          { key: "skinType", label: "Skin Type *", placeholder: "Normal / Dry / Oily / Combination / Sensitive" },
          { key: "familyDisease", label: "Family Disease History", placeholder: "Any hereditary conditions" },
          { key: "allergies", label: "Allergies", placeholder: "List any allergies" },
          { key: "date", label: "Preferred Date *", placeholder: "YYYY-MM-DD" },
          { key: "time", label: "Preferred Time *", placeholder: "e.g. 2:30 PM" },
        ].map((item) => (
          <View key={item.key}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={item.placeholder}
              keyboardType={item.keyboard || "default"}
              value={formData[item.key]}
              onChangeText={(t) => handleChange(item.key, t)}
            />
          </View>
        ))}

        <Text style={styles.label}>Describe Your Skin Issue *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Describe symptoms, how long you've had them, etc."
          value={formData.description}
          onChangeText={(t) => handleChange("description", t)}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 25 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    color: "#444",
    fontSize: 14,
    marginBottom: 25,
    textAlign: "center",
  },
  form: { width: "100%" },
  label: { color: "#000", fontWeight: "600", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#000",
  },
  textArea: { height: 120, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
