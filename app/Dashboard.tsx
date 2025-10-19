import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const progress = 0.72; // Daily routine completion %
  const recommendedProducts = [
    { id: 1, name: "CeraVe Moisturizing Cream", desc: "Hydrating dry skin barrier", img: "https://m.media-amazon.com/images/I/61g3E9bofpL._SL1500_.jpg" },
    { id: 2, name: "La Roche-Posay Sunscreen", desc: "SPF 50+ UVA/UVB Protection", img: "https://m.media-amazon.com/images/I/61WKnx4X1BL._SL1500_.jpg" },
  ];

  const doctors = [
    { id: 1, name: "Dr. Ayesha Khan", spec: "Dermatologist", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 2, name: "Dr. Sarah Malik", spec: "Skin Specialist", img: "https://cdn-icons-png.flaticon.com/512/2922/2922561.png" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/2922/2922506.png" }}
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.username}>Hi, Ahsan 👋</Text>
            <Text style={styles.subtitle}>Your daily progress is improving!</Text>
          </View>
        </View>

        <View style={styles.progressBox}>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Routine Done</Text>
        </View>
      </View>

      {/* Recommendation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Products</Text>
        {recommendedProducts.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.img }} style={styles.productImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDesc}>{item.desc}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="cart-outline" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Doctor Consultation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consult Dermatologists</Text>
        {doctors.map((doc) => (
          <View key={doc.id} style={styles.doctorCard}>
            <Image source={{ uri: doc.img }} style={styles.doctorImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doc.name}</Text>
              <Text style={styles.doctorSpec}>{doc.spec}</Text>
            </View>
            <TouchableOpacity style={styles.consultBtn}>
              <Text style={styles.consultText}>Book</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb", padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  profilePic: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "#000" },
  username: { fontSize: 20, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 12, color: "#444" },

  progressBox: {
    width: 100,
    alignItems: "center",
  },
  progressText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#000" },
  progressLabel: { fontSize: 10, color: "#555", marginTop: 5 },

  section: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 15 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  productImg: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  productName: { fontSize: 14, fontWeight: "bold", color: "#000" },
  productDesc: { fontSize: 12, color: "#555" },

  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  doctorImg: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  doctorName: { fontWeight: "bold", color: "#000" },
  doctorSpec: { color: "#555", fontSize: 12 },
  consultBtn: {
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  consultText: { color: "#fff", fontWeight: "bold" },
});
