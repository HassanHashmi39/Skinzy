import { Ionicons } from "@expo/vector-icons";
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
  const [bookings, setBookings] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const menuLinks: { label: string; path: "/user/MyRoutine" | "/user/Products" | "/user/Consult" | "/user/Profile" | "/user/MyBookings" }[] = [
    { label: "🧴 My Routine", path: "/user/MyRoutine" },
    { label: "🛍️ Products", path: "/user/Products" },
    { label: "👨‍⚕️ Doctors", path: "/user/Consult" },
    { label: "📄 Profile", path: "/user/Profile" },
    { label: "🗓 Bookings", path: "/user/MyBookings" }
  ];

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
      pathname: "/user/Consult",
      params: { ...booking, reschedule: true },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push("/user/Profile")} style={styles.navIcon}>
          <Ionicons name="person-circle-outline" size={28} color="black" />
        </TouchableOpacity>

        <Text style={styles.appTitle}>SKINZY</Text>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={() => router.push("/user/Notifications")} style={styles.navIcon}>
            <Ionicons name="notifications-outline" size={22} color="#FF6E56" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMenu} style={styles.navIcon}>
            <Ionicons name="menu-outline" size={26} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {menuVisible && (
        <View style={styles.dropdown}>
          {menuLinks.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push(item.path);
              }}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
  },
  navIcon: {
    padding: 5,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    zIndex: 10,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#000",
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
