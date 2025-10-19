import * as ImagePicker from "expo-image-picker";
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

export default function DoctorInformationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    clinic: "",
    city: "",
  });
  const [license, setLicense] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (type === "license") setLicense(result.assets[0].uri);
      if (type === "idCard") setIdCard(result.assets[0].uri);
      if (type === "profile") setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.specialization ||
      !license ||
      !idCard ||
      !profilePhoto
    ) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    try {
      await fetch("https://formspree.io/f/xqayjpng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          license,
          idCard,
          profilePhoto,
          submittedAt: new Date().toISOString(),
        }),
      });
      Alert.alert(
        "Submitted Successfully ✅",
        "Your information has been sent for verification."
      );
      setForm({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        clinic: "",
        city: "",
      });
      setLicense(null);
      setIdCard(null);
      setProfilePhoto(null);
    } catch (error) {
      Alert.alert("Error", "Failed to submit form. Please try again later.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Doctor Verification Form</Text>
      <Text style={styles.subtitle}>
        Submit your credentials to register as a verified dermatologist.
      </Text>

      {Object.keys(form).map((key) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(text) => handleChange(key, text)}
            placeholder={`Enter ${key}`}
            placeholderTextColor="#888"
          />
        </View>
      ))}

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.label}>Upload Documents</Text>

        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => pickImage("license")}
        >
          <Text style={styles.uploadText}>📄 Upload License</Text>
          {license && <Image source={{ uri: license }} style={styles.image} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => pickImage("idCard")}
        >
          <Text style={styles.uploadText}>🪪 Upload ID Card</Text>
          {idCard && <Image source={{ uri: idCard }} style={styles.image} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => pickImage("profile")}
        >
          <Text style={styles.uploadText}>🧑‍⚕️ Upload Profile Photo</Text>
          {profilePhoto && (
            <Image source={{ uri: profilePhoto }} style={styles.image} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit for Verification</Text>
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
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 13,
  },
  field: {
    marginBottom: 12,
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
    padding: 10,
    color: "#000",
  },
  uploadSection: {
    marginVertical: 20,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  uploadText: {
    color: "#000",
    fontWeight: "bold",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 40,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
