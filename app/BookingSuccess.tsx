import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookingSuccess() {
  const router = useRouter();
  const { doctor, date, time } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Confirmed ✅</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Doctor:</Text>
        <Text style={styles.value}>{doctor || "Dermatologist"}</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{date || "—"}</Text>

        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{time || "—"}</Text>
      </View>

      <Text style={styles.message}>
        Your booking request has been sent successfully.  
        The doctor will reach out via email or phone soon.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/Dashboard")}
      >
        <Text style={styles.btnText}>Return to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.secondaryBtn]}
        onPress={() => router.push("/Consult")}
      >
        <Text style={[styles.btnText, styles.secondaryText]}>
          Book Another Consultation
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    marginBottom: 25,
  },
  label: {
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
  },
  value: {
    color: "#333",
    marginBottom: 6,
  },
  message: {
    textAlign: "center",
    color: "#444",
    marginBottom: 40,
    fontSize: 14,
  },
  btn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
  },
  secondaryText: {
    color: "#000",
  },
});
