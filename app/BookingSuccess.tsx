import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookingSuccess() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>
        Your appointment has been sent to the doctor.  
        You’ll receive confirmation soon.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/MyBookings")}
      >
        <Text style={styles.btnText}>View My Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emoji: { fontSize: 70, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#000", marginBottom: 8 },
  subtitle: {
    textAlign: "center",
    color: "#444",
    fontSize: 14,
    marginBottom: 25,
  },
  btn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
