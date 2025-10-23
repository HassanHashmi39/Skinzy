import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionPage() {
  const router = useRouter();
  const backgroundImage = require("./Images/Background.png");

  return (
      //<ImageBackground source={backgroundImage} resizeMode="cover" style={{flex: 1,width: '100%', height: '100%'}}>
    <View style={styles.container}>
      <Image source={require('./Images/logo1.png')}
        style={{ width: 150, height: 230, alignSelf: 'center', marginTop: 100, marginBottom: 20 }}
      />
      <Text style={styles.title}>Select Your Role</Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#4CAF50" }]}
        onPress={() => router.replace("/user/UserInfoScreen")}
      >
        <Text style={styles.text}>Continue as Patient</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#2196F3" }]}
        onPress={() => router.replace("/Doctor/DoctorInformationForm")}
      >
        <Text style={styles.text}>Continue as Doctor</Text>
      </TouchableOpacity>
    </View>
      //</ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop:"20%", alignItems: "center",backgroundColor: 'white' },
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
