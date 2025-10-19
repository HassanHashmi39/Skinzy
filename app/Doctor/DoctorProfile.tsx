import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    hospital: "",
    email: "",
    phone: "",
    bio: "",
    image: null,
  });

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("doctorProfile");
      if (savedData) setDoctor(JSON.parse(savedData));
    } catch (e) {
      console.log("Error loading profile", e);
    }
  };

  const saveDoctorData = async () => {
    try {
      await AsyncStorage.setItem("doctorProfile", JSON.stringify(doctor));
      Alert.alert("Profile Updated ✅", "Your profile has been saved.");
    } catch (e) {
      Alert.alert("Error", "Could not save profile data.");
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setDoctor({ ...doctor, image: result.assets[0].uri });
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged Out", "You have been logged out successfully.");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>My Profile 🧑‍⚕️</Text>

      {/* Profile Picture */}
      <View style={styles.imageContainer}>
        {doctor.image ? (
          <Image source={{ uri: doctor.image }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#000" />
        )}
        <TouchableOpacity style={styles.editBtn} onPress={pickImage}>
          <Ionicons name="camera-outline" size={18} color="#fff" />
          <Text style={styles.editText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Doctor Info Inputs */}
      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={doctor.name}
          onChangeText={(t) => setDoctor({ ...doctor, name: t })}
        />

        <Text style={styles.label}>Specialization</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dermatologist"
          value={doctor.specialization}
          onChangeText={(t) => setDoctor({ ...doctor, specialization: t })}
        />

        <Text style={styles.label}>Hospital / Clinic</Text>
        <TextInput
          style={styles.input}
          value={doctor.hospital}
          onChangeText={(t) => setDoctor({ ...doctor, hospital: t })}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={doctor.email}
          onChangeText={(t) => setDoctor({ ...doctor, email: t })}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={doctor.phone}
          onChangeText={(t) => setDoctor({ ...doctor, phone: t })}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Write about your experience or special approach"
          value={doctor.bio}
          onChangeText={(t) => setDoctor({ ...doctor, bio: t })}
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveDoctorData}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
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
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#000",
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    gap: 5,
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 25,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#000",
  },
  saveBtn: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
  },
  logoutText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
});
