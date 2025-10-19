import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyRoutine() {
  const [routineType, setRoutineType] = useState("Morning");
  const [waterIntake, setWaterIntake] = useState(0);
  const waterGoal = 8;
  const [plan, setPlan] = useState({
    Morning: ["Cleanser", "Toner", "Moisturizer", "Sunscreen (SPF 50)"],
    Night: ["Cleanser", "Serum", "Moisturizer", "Lip Balm"],
  });
  const [steps, setSteps] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newStep, setNewStep] = useState("");

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPlan = await AsyncStorage.getItem("dailyPlan");
        const savedProgress = await AsyncStorage.getItem("routineProgress");
        const savedWater = await AsyncStorage.getItem("waterIntake");
        const lastReset = await AsyncStorage.getItem("lastReset");
        const today = new Date().toDateString();

        // Reset daily water intake and progress if new day
        if (lastReset !== today) {
          await AsyncStorage.setItem("lastReset", today);
          await AsyncStorage.removeItem("routineProgress");
          await AsyncStorage.setItem("waterIntake", "0");
          setWaterIntake(0);
        } else if (savedWater) setWaterIntake(parseInt(savedWater));

        // Restore user plan and today's steps
        if (savedPlan) setPlan(JSON.parse(savedPlan));
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          if (parsed[routineType]) setSteps(parsed[routineType]);
        } else {
          setSteps(
            (savedPlan
              ? JSON.parse(savedPlan)[routineType]
              : plan[routineType]
            ).map((s) => ({ name: s, done: false }))
          );
        }
      } catch (e) {
        console.log("Load error:", e);
      }
    };
    loadData();
  }, []);

  // ---------- UPDATE WHEN ROUTINE TYPE CHANGES ----------
  useEffect(() => {
    (async () => {
      const savedProgress = await AsyncStorage.getItem("routineProgress");
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed[routineType]) setSteps(parsed[routineType]);
        else setSteps(plan[routineType].map((s) => ({ name: s, done: false })));
      } else {
        setSteps(plan[routineType].map((s) => ({ name: s, done: false })));
      }
    })();
  }, [routineType, plan]);

  // ---------- SAVE PROGRESS ----------
  useEffect(() => {
    (async () => {
      const savedProgress = await AsyncStorage.getItem("routineProgress");
      const parsed = savedProgress ? JSON.parse(savedProgress) : {};
      parsed[routineType] = steps;
      await AsyncStorage.setItem("routineProgress", JSON.stringify(parsed));
    })();
  }, [steps]);

  // ---------- SAVE WATER ----------
  useEffect(() => {
    AsyncStorage.setItem("waterIntake", waterIntake.toString());
  }, [waterIntake]);

  // ---------- TOGGLE COMPLETION ----------
  const toggleStep = (index) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s))
    );
  };

  // ---------- ADD NEW STEP ----------
  const addNewStep = () => {
    if (!newStep.trim()) return;
    setPlan((prev) => ({
      ...prev,
      [routineType]: [...prev[routineType], newStep],
    }));
    setNewStep("");
  };

  // ---------- DELETE STEP ----------
  const deleteStep = (i) => {
    setPlan((prev) => ({
      ...prev,
      [routineType]: prev[routineType].filter((_, idx) => idx !== i),
    }));
  };

  // ---------- SAVE UPDATED PLAN ----------
  const savePlan = async () => {
    await AsyncStorage.setItem("dailyPlan", JSON.stringify(plan));
    // Update steps immediately
    setSteps(plan[routineType].map((s) => ({ name: s, done: false })));
    setIsEditing(false);
    Alert.alert("✅ Routine Updated", "Your skincare plan has been updated.");
  };

  const handleAddWater = () => {
    if (waterIntake < waterGoal) setWaterIntake(waterIntake + 1);
  };

  const progress = waterIntake / waterGoal;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Routine</Text>
      <Text style={styles.subtitle}>
        Track your skincare progress and hydration 🌿
      </Text>

      {/* Morning/Night Switch */}
      <View style={styles.tabRow}>
        {["Morning", "Night"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setRoutineType(type)}
            style={[styles.tab, routineType === type && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                routineType === type && styles.activeTabText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Routine Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles-outline" size={20} color="#000" />
          <Text style={styles.sectionTitle}>Today's {routineType} Routine</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons
              name={isEditing ? "checkmark" : "create-outline"}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        {/* Normal Mode */}
        {!isEditing ? (
          steps.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.step, item.done && styles.stepDone]}
              onPress={() => toggleStep(i)}
            >
              <Text
                style={[styles.stepText, item.done && styles.stepTextDone]}
              >
                {item.name}
              </Text>
              <Text style={styles.status}>{item.done ? "✅" : "⬜"}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <>
            {plan[routineType].map((s, i) => (
              <View key={i} style={styles.editRow}>
                <Text style={styles.planStep}>{s}</Text>
                <TouchableOpacity onPress={() => deleteStep(i)}>
                  <Ionicons name="trash-outline" size={18} color="#d11a2a" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="Add new step..."
                value={newStep}
                onChangeText={setNewStep}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addNewStep}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={savePlan}>
              <Text style={styles.saveText}>Save Routine</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Water Tracker */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="water-outline" size={20} color="#000" />
          <Text style={styles.sectionTitle}>Water Tracker</Text>
        </View>
        <Text style={styles.planText}>
          {waterIntake} / {waterGoal} glasses today
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity
          style={[styles.btn, { marginTop: 10 }]}
          onPress={handleAddWater}
        >
          <Text style={styles.btnText}>+ Add Glass</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginTop: 40,
    textAlign: "center",
  },
  subtitle: { textAlign: "center", color: "#555", marginBottom: 20 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  tab: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 25,
    marginHorizontal: 5,
  },
  activeTab: { backgroundColor: "#000" },
  tabText: { color: "#000", fontWeight: "bold" },
  activeTabText: { color: "#fff" },
  section: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  step: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
  },
  stepDone: { backgroundColor: "#000" },
  stepText: { color: "#000", fontSize: 15 },
  stepTextDone: { color: "#fff", textDecorationLine: "line-through" },
  status: { fontSize: 18 },
  editRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  planStep: { color: "#000", fontSize: 14 },
  addRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#000",
  },
  addBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 10,
    marginLeft: 10,
  },
  saveBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  planText: { color: "#444", fontSize: 13, marginBottom: 10 },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  progressFill: { height: "100%", backgroundColor: "#000" },
  btn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
