import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#4CAF50" }]}
        onPress={() => router.replace("/user/UserInfoScreen")}
      >
        <Text style={styles.text}>Continue as User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#2196F3" }]}
        onPress={() => router.replace("/Doctor/DoctorInformationForm")}
      >
        <Text style={styles.text}>Continue as Doctor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 30 },
  btn: {
    width: 220,
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  text: { color: "#fff", fontWeight: "600" },
});
