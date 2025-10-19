import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DoctorSchedule() {
  const [slots, setSlots] = useState([
    { id: "1", day: "Monday", time: "10:00 AM - 1:00 PM" },
    { id: "2", day: "Wednesday", time: "3:00 PM - 6:00 PM" },
  ]);

  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");

  const addSlot = () => {
    if (!newDay || !newTime) {
      Alert.alert("Missing Information", "Please enter both day and time.");
      return;
    }

    const newSlot = {
      id: Date.now().toString(),
      day: newDay,
      time: newTime,
    };

    setSlots((prev) => [...prev, newSlot]);
    setNewDay("");
    setNewTime("");
  };

  const deleteSlot = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to remove this slot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setSlots((prev) => prev.filter((s) => s.id !== id)),
      },
    ]);
  };

  const renderSlot = ({ item }) => (
    <View style={styles.slotCard}>
      <View>
        <Text style={styles.day}>{item.day}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteSlot(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Your Schedule</Text>
      <Text style={styles.subtitle}>
        Set your available consultation timings
      </Text>

      {/* Add Slot Form */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter Day (e.g. Monday)"
          value={newDay}
          onChangeText={setNewDay}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Time (e.g. 10:00 AM - 2:00 PM)"
          value={newTime}
          onChangeText={setNewTime}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addSlot}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addText}>Add Slot</Text>
        </TouchableOpacity>
      </View>

      {/* Slots List */}
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderSlot}
        style={{ marginTop: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#555", marginTop: 30 }}>
            No available slots added yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#444",
    marginBottom: 25,
  },
  inputSection: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
  },
  slotCard: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  day: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
  time: {
    color: "#555",
  },
});
