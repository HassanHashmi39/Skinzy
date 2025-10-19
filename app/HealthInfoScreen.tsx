import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HealthInfoScreen() {
  const router = useRouter();

  const [skinType, setSkinType] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState(false);
  const [allergies, setAllergies] = useState(false);

  const toggleIssue = (issue: string) => {
    if (issues.includes(issue)) {
      setIssues(issues.filter((i) => i !== issue));
    } else {
      setIssues([...issues, issue]);
    }
  };

  const handleSubmit = () => {
    if (!skinType) {
      Alert.alert("Missing Info", "Please select your skin type.");
      return;
    }
    Alert.alert("Saved ✅", "Your health and skin info has been recorded.");
    router.push("/PermissionsScreen"); 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Skin & Health Information</Text>
      <Text style={styles.subtitle}>Help Skinzy personalize your care</Text>

      {/* Skin Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Select your skin type</Text>
        {["Normal", "Oily", "Dry", "Combination", "Sensitive"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.option,
              skinType === type && styles.optionSelected,
            ]}
            onPress={() => setSkinType(type)}
          >
            <Text
              style={[
                styles.optionText,
                skinType === type && styles.optionTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Skin Issues */}
      <View style={styles.section}>
        <Text style={styles.label}>Common skin issues</Text>
        {["Acne", "Pigmentation", "Dark Circles", "Wrinkles", "Dry Patches"].map(
          (issue) => (
            <TouchableOpacity
              key={issue}
              style={[
                styles.option,
                issues.includes(issue) && styles.optionSelected,
              ]}
              onPress={() => toggleIssue(issue)}
            >
              <Text
                style={[
                  styles.optionText,
                  issues.includes(issue) && styles.optionTextSelected,
                ]}
              >
                {issue}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Family History */}
      <View style={styles.section}>
        <Text style={styles.label}>Family History of Skin Problems?</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.smallBtn,
              familyHistory && styles.optionSelected,
            ]}
            onPress={() => setFamilyHistory(true)}
          >
            <Text
              style={[
                styles.optionText,
                familyHistory && styles.optionTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.smallBtn,
              !familyHistory && styles.optionSelected,
            ]}
            onPress={() => setFamilyHistory(false)}
          >
            <Text
              style={[
                styles.optionText,
                !familyHistory && styles.optionTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <Text style={styles.label}>Do you have any known allergies?</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.smallBtn,
              allergies && styles.optionSelected,
            ]}
            onPress={() => setAllergies(true)}
          >
            <Text
              style={[
                styles.optionText,
                allergies && styles.optionTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.smallBtn,
              !allergies && styles.optionSelected,
            ]}
            onPress={() => setAllergies(false)}
          >
            <Text
              style={[
                styles.optionText,
                !allergies && styles.optionTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
        <Text style={styles.saveText}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  subtitle: {
    color: "#444",
    marginBottom: 25,
    textAlign: "center",
  },
  section: {
    width: "100%",
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 6,
  },
  optionSelected: {
    backgroundColor: "#000",
  },
  optionText: {
    color: "#000",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#000",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
