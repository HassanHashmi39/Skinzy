import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PermissionsScreen() {
  const router = useRouter();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  // Ask for camera permission
  const askCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      setCameraGranted(true);
      Alert.alert("Camera Access Granted ✅");
    } else {
      Alert.alert("Permission Denied", "Camera access is required for AI scan.");
    }
  };

  // Ask for location permission
  const askLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationGranted(true);
      Alert.alert("Location Access Granted ✅");
    } else {
      Alert.alert(
        "Permission Denied",
        "Location is needed for weather-based routines."
      );
    }
  };

  const handleContinue = () => {
    if (!cameraGranted || !locationGranted) {
      Alert.alert("Permissions Required", "Please allow both permissions.");
      return;
    }
    router.push("/Dashboard"); // next main screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Allow Permissions</Text>
      <Text style={styles.subtitle}>
        To provide accurate skincare routines, Skinzy needs the following:
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>📷 Camera Access</Text>
        <Text style={styles.desc}>
          Used to scan your skin for analysis. Your photos are not stored.
        </Text>
        <TouchableOpacity
          style={[styles.btn, cameraGranted && styles.btnActive]}
          onPress={askCamera}
        >
          <Text
            style={[
              styles.btnText,
              cameraGranted && styles.btnTextActive,
            ]}
          >
            {cameraGranted ? "Granted" : "Allow Camera"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>📍 Location Access</Text>
        <Text style={styles.desc}>
          Used to get local weather and pollution data for your routine.
        </Text>
        <TouchableOpacity
          style={[styles.btn, locationGranted && styles.btnActive]}
          onPress={askLocation}
        >
          <Text
            style={[
              styles.btnText,
              locationGranted && styles.btnTextActive,
            ]}
          >
            {locationGranted ? "Granted" : "Allow Location"}
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
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  subtitle: {
    color: "#444",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  section: {
    width: "100%",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  btn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnActive: {
    backgroundColor: "#000",
  },
  btnText: {
    color: "#000",
    fontWeight: "600",
  },
  btnTextActive: {
    color: "#fff",
  },
  continueBtn: {
    backgroundColor: "#000",
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 20,
  },
  continueText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
