import { useRouter } from "expo-router";
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

export default function UserInfoScreen() {
  const router = useRouter();
  const [user, setUser] = useState({
    fullName: "",
    gender: "",
    age: "",
    phone: "",
    city: "",
  });

  const handleChange = (field: string, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleSubmit = () => {
    if (!user.fullName || !user.gender || !user.phone || !user.city) {
      Alert.alert("Missing info", "Please fill all required fields.");
      return;
    }
    Alert.alert("Profile Saved ✅", "Your personal info has been recorded.");
    router.push("/Dashboard");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Let’s personalize your Skinzy experience
      </Text>

      <View style={styles.formBox}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#888"
            value={user.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="Male / Female / Other"
            placeholderTextColor="#888"
            value={user.gender}
            onChangeText={(text) => handleChange("gender", text)}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 22"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={user.age}
            onChangeText={(text) => handleChange("age", text)}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+92XXXXXXXXXX"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={user.phone}
            onChangeText={(text) => handleChange("phone", text)}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>City / Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your city"
            placeholderTextColor="#888"
            value={user.city}
            onChangeText={(text) => handleChange("city", text)}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={styles.saveText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff", // white background
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000", // black text
    marginBottom: 5,
  },
  subtitle: {
    color: "#444",
    marginBottom: 25,
    textAlign: "center",
  },
  formBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  inputBox: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    padding: 10,
    color: "#000",
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#000", // solid black button
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
