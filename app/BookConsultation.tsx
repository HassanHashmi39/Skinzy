import { useLocalSearchParams } from "expo-router";
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

  const handleChange = (key: string, value: string) =>
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
      const response = await fetch("https://formspree.io/f/xqayjpng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: doctor || "General Dermatologist",
          ...formData,
        }),
      });

      if (response.ok) {
        Alert.alert("Booking Confirmed ✅", "Doctor will contact you soon.");
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
      } else {
        Alert.alert("Error", "Something went wrong, please try again.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection and try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book Consultation</Text>
      <Text style={styles.subtitle}>
        {doctor
          ? `Booking with ${doctor}`
          : "Please select a doctor from the list"}
      </Text>

      <View style={styles.form}>
        {/* Personal Info */}
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={(t) => handleChange("name", t)}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(t) => handleChange("email", t)}
        />

        <Text style={styles.label}>Gender *</Text>
        <TextInput
          style={styles.input}
          placeholder="Male / Female / Other"
          value={formData.gender}
          onChangeText={(t) => handleChange("gender", t)}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(t) => handleChange("age", t)}
        />

        {/* Medical / Skin Info */}
        <Text style={styles.label}>Skin Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="Normal / Dry / Oily / Combination / Sensitive"
          value={formData.skinType}
          onChangeText={(t) => handleChange("skinType", t)}
        />

        <Text style={styles.label}>Family Disease History</Text>
        <TextInput
          style={styles.input}
          placeholder="Any hereditary conditions"
          value={formData.familyDisease}
          onChangeText={(t) => handleChange("familyDisease", t)}
        />

        <Text style={styles.label}>Allergies</Text>
        <TextInput
          style={styles.input}
          placeholder="List any allergies"
          value={formData.allergies}
          onChangeText={(t) => handleChange("allergies", t)}
        />

        {/* Appointment Info */}
        <Text style={styles.label}>Preferred Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={formData.date}
          onChangeText={(t) => handleChange("date", t)}
        />

        <Text style={styles.label}>Preferred Time *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2:30 PM"
          value={formData.time}
          onChangeText={(t) => handleChange("time", t)}
        />

        {/* Description */}
        <Text style={styles.label}>Describe Your Skin Issue *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your symptoms, how long you’ve had them, any treatments tried, etc."
          multiline
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
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 25,
  },
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
  form: {
    width: "100%",
  },
  label: {
    color: "#000",
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#000",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  btn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
