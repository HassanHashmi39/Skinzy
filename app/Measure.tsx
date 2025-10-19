import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Measure() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Select from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) setImage(result.assets[0].uri);
    } catch (error) {
      console.log("Gallery error:", error);
    }
  };

  // ✅ Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) setImage(result.assets[0].uri);
    } catch (error) {
      console.log("Camera error:", error);
    }
  };

  // ✅ Save each analysis record to AsyncStorage
  const saveAnalysis = async (data) => {
    try {
      const existing = await AsyncStorage.getItem("analysisHistory");
      const parsed = existing ? JSON.parse(existing) : [];

      const newEntry = {
        id: Date.now(),
        ...data,
        image,
        date: new Date().toLocaleDateString(),
      };

      parsed.unshift(newEntry);
      await AsyncStorage.setItem("analysisHistory", JSON.stringify(parsed));
    } catch (err) {
      console.log("Error saving analysis:", err);
    }
  };

  // ✅ Simulate AI analysis (you’ll replace this with real model later)
  const analyzeImage = async () => {
    if (!image) {
      Alert.alert("No Image", "Please upload or take a photo first.");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      const fakeScore = Math.floor(Math.random() * 100);
      const resultData = {
        overall: fakeScore,
        skinAge: 18 + Math.floor(Math.random() * 15),
        issues: fakeScore < 50 ? ["Acne", "Dryness", "Dark Circles"] : ["Minor Redness"],
        recommendation:
          fakeScore < 50
            ? "Your skin shows some imbalance. Keep your face clean, hydrated, and avoid oily foods."
            : "Your skin looks great! Maintain hydration and sun protection.",
        products:
          fakeScore < 50
            ? [
                { name: "CeraVe Foaming Cleanser" },
                { name: "The Ordinary Niacinamide 10% + Zinc" },
                { name: "Neutrogena Oil-Free Moisturizer" },
              ]
            : [
                { name: "COSRX Snail Essence" },
                { name: "La Roche-Posay SPF 50" },
              ],
      };

      await saveAnalysis(resultData);

      setLoading(false);
      router.push({
        pathname: "/AnalysisResult",
        params: {
          ...resultData,
          issues: JSON.stringify(resultData.issues),
          products: JSON.stringify(resultData.products),
        },
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Skin Analysis</Text>
      <Text style={styles.subtitle}>
        Upload or capture a photo for instant skin analysis.
      </Text>

      <View style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image Selected</Text>
          </View>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.outlineBtn} onPress={pickImage}>
          <Text style={styles.outlineText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={takePhoto}>
          <Text style={styles.outlineText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.analyzeBtn, loading && { opacity: 0.6 }]}
        onPress={analyzeImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.analyzeText}>Start Analysis</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        *Your photo will be used for analysis only and not stored permanently.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 25,
    textAlign: "center",
  },
  imageBox: {
    width: 230,
    height: 230,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 15,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#888",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  outlineText: {
    color: "#000",
    fontWeight: "bold",
  },
  analyzeBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: "center",
  },
  analyzeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  note: {
    marginTop: 25,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});
