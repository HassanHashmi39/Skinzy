import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "Hassan Hashmi",
    email: "hassan@example.com",
    number: "03123456789",
    city: "Lahore",
    gender: "Male",
    skinType: "Oily",
    age: "22",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Profile Updated ✅", "Your changes have been saved.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>

      {Object.keys(profile).map((key) => (
        <View key={key} style={styles.inputContainer}>
          <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readOnly]}
            editable={isEditing}
            value={profile[key]}
            onChangeText={(t) => handleChange(key, t)}
          />
        </View>
      ))}

      {!isEditing ? (
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: "#000",
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    color: "#000",
  },
  readOnly: {
    backgroundColor: "#f9f9f9",
  },
  editBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
