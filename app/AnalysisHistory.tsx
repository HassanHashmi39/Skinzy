import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AnalysisResult() {
  const { overall, skinAge, issues, recommendation, products } = useLocalSearchParams();

  // Convert issues/products from string if needed
  const parsedIssues = typeof issues === "string" ? issues.split(",") : issues;
  const parsedProducts = typeof products === "string" ? products.split(",") : products;

  // Show alert if score is low
  if (overall < 50) {
    Alert.alert(
      "Consultation Recommended ⚠️",
      "Your analysis indicates potential skin issues. Please consult a dermatologist."
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text style={styles.title}>AI Analysis Result</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Skin Age</Text>
        <Text style={styles.value}>{skinAge}</Text>

        <Text style={styles.label}>Overall Score</Text>
        <Text style={[styles.score, overall < 50 && { color: "red" }]}>{overall}</Text>

        <Text style={styles.label}>Detected Issues</Text>
        {parsedIssues?.map((item, i) => (
          <Text key={i} style={styles.text}>• {item}</Text>
        ))}

        <Text style={styles.label}>Recommendation</Text>
        <Text style={styles.text}>{recommendation}</Text>

        <Text style={styles.label}>Suggested Products</Text>
        {parsedProducts?.map((p, i) => (
          <Text key={i} style={styles.text}>• {p.name || p}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Consult Doctor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  label: {
    fontWeight: "600",
    color: "#000",
    marginTop: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  score: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
  },
  text: {
    color: "#333",
    marginTop: 3,
  },
  btn: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
