import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  StyleSheet, Text, TouchableOpacity,
  View
} from "react-native";
const backgroundImage = require("./Images/Background.png");
const logoImage = require("./Images/logo.png");

export default function SelectionPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
        <ImageBackground source={backgroundImage} resizeMode="cover" style={{flex: 1,width: '100%', height: '100%'}}> 
      <Image source={logoImage}
        style={{ width: 150, height: 150, alignSelf: 'center', marginTop: 100, marginBottom: 20 }}
      />
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
    </ImageBackground>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundImage: "url(./Images/Background.png)", backgroundSize: "cover"
   },
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
