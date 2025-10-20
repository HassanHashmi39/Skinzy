import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const saved = await AsyncStorage.getItem("bookings");
        if (saved) setBookings(JSON.parse(saved));
      } catch (err) {
        console.log("Error loading bookings:", err);
      }
    };
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          const updated = bookings.filter((b) => b.id !== id);
          setBookings(updated);
          await AsyncStorage.setItem("bookings", JSON.stringify(updated));
        },
      },
    ]);
  };

  const handleReschedule = (booking) => {
    router.push({
      pathname: "/Consult",
      params: { ...booking, reschedule: true },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>My Bookings</Text>

      {bookings.length === 0 ? (
        <Text style={styles.empty}>No appointments booked yet.</Text>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.doctorName}>{b.doctor}</Text>
              <Text
                style={[
                  styles.status,
                  {
                    color:
                      b.status === "Confirmed"
                        ? "green"
                        : b.status === "Pending"
                        ? "#ff8c00"
                        : "red",
                  },
                ]}
              >
                {b.status}
              </Text>
            </View>

            <Text style={styles.info}>Date: {b.date}</Text>
            <Text style={styles.info}>Time: {b.time}</Text>
            <Text style={styles.info}>Mode: {b.mode}</Text>
            <Text style={styles.info}>Notes: {b.notes || "—"}</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => router.push(`/DoctorDetails/${b.doctorId}`)}
              >
                <Text style={styles.viewText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rescheduleBtn}
                onPress={() => handleReschedule(b)}
              >
                <Text style={styles.rescheduleText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(b.id)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  empty: {
    color: "#555",
    textAlign: "center",
    marginTop: 60,
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 18,
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
  },
  info: {
    color: "#333",
    fontSize: 14,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  viewBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginRight: 6,
  },
  viewText: {
    color: "#000",
    fontWeight: "bold",
  },
  rescheduleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  rescheduleText: {
    color: "#000",
    fontWeight: "bold",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginLeft: 6,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
