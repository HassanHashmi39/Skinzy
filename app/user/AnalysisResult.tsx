import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AnalysisResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Safely parse incoming parameters
  const overall = Number(params.overall) || 0;
  const skinAge = params.skinAge || "N/A";

  let issues = [];
  let products = [];
  try {
    issues =
      typeof params.issues === "string"
        ? JSON.parse(params.issues)
        : params.issues || [];
  } catch {
    issues = Array.isArray(params.issues)
      ? params.issues
      : (params.issues || "").split(",");
  }

  try {
    products =
      typeof params.products === "string"
        ? JSON.parse(params.products)
        : params.products || [];
  } catch {
    products = Array.isArray(params.products)
      ? params.products
      : (params.products || "").split(",");
  }

  const recommendation = params.recommendation || "No recommendation available.";

  // Alert if score is low
  useEffect(() => {
    if (overall < 50) {
      Alert.alert(
        "Consultation Recommended ⚠️",
        "Your analysis indicates potential skin issues. Please consult a dermatologist."
      );
    }
  }, [overall]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Skin Analysis Result</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Skin Age:</Text>
        <Text style={styles.value}>{skinAge}</Text>

        <Text style={styles.label}>Overall Score:</Text>
        <Text
          style={[
            styles.score,
            overall < 50 ? { color: "red" } : { color: "#000" },
          ]}
        >
          {overall}
        </Text>

        <Text style={styles.label}>Detected Issues:</Text>
        {issues.length > 0 ? (
          issues.map((issue, i) => (
            <Text key={i} style={styles.text}>
              • {issue}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No major issues detected.</Text>
        )}

        <Text style={styles.label}>Recommendation:</Text>
        <Text style={styles.text}>{recommendation}</Text>
      </View>

      {/* Products Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Recommended Products:</Text>
        {products.length > 0 ? (
          products.map((p, i) => (
            <View key={i} style={styles.productBox}>
              <Text style={styles.productName}>• {p.name || p}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No product suggestions available.</Text>
        )}
      </View>

      {overall < 50 && (
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            router.push({
              pathname: "/Consult",
              params: {
                from: "analysis",
                concern: issues.join(", "),
              },
            })
          }
        >
          <Text style={styles.btnText}>Consult Doctor</Text>
        </TouchableOpacity>
      )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "600",
    color: "#000",
    marginTop: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  score: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 8,
  },
  text: {
    color: "#333",
    marginTop: 4,
  },
  productBox: {
    paddingVertical: 6,
  },
  productName: {
    fontWeight: "bold",
    color: "#000",
  },
  btn: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 40,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
