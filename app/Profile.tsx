import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    phone: "",
    image: null,
  });
  const [historyCount, setHistoryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem("userProfile");
        if (savedProfile) setProfile(JSON.parse(savedProfile));

        const history = await AsyncStorage.getItem("analysisHistory");
        if (history) setHistoryCount(JSON.parse(history).length);
      } catch (e) {
        console.log("Error loading profile", e);
      }
    };
    loadData();
  }, []);

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      Alert.alert("✅ Profile Saved", "Your information has been updated.");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile.");
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    router.push("/Login");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Allow gallery access to change profile picture.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!res.canceled) {
      setProfile({ ...profile, image: res.assets[0].uri });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Profile</Text>

      {/* Profile Picture */}
      <View style={styles.profilePicContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.addText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* User Info Inputs */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={profile.age}
          onChangeText={(text) => setProfile({ ...profile, age: text })}
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          placeholder="Male / Female"
          value={profile.gender}
          onChangeText={(text) => setProfile({ ...profile, gender: text })}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={profile.city}
          onChangeText={(text) => setProfile({ ...profile, city: text })}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{historyCount}</Text>
          <Text style={styles.statLabel}>Total Analyses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Consultations</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Avg. Skin Health</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
        <Text style={styles.saveText}>💾 Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Log Out</Text>
      </TouchableOpacity>
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
    marginBottom: 15,
    textAlign: "center",
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#000",
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#000", fontWeight: "600" },
  card: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: { color: "#000", fontWeight: "600", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#000",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#000" },
  statLabel: { fontSize: 12, color: "#555" },
  saveBtn: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
  },
  logoutText: { color: "#000", textAlign: "center", fontWeight: "bold" },
});
