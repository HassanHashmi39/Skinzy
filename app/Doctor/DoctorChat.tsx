import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DoctorChat() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Dummy patient list
  const patients = [
    { id: "1", name: "Ahsan Shah", issue: "Acne & Oily Skin" },
    { id: "2", name: "Sana Fatima", issue: "Dryness & Pigmentation" },
    { id: "3", name: "Ali Khan", issue: "Dark Circles" },
  ];

  // Sample messages
  const [messages, setMessages] = useState({
    "1": [
      { id: "m1", sender: "patient", text: "Hello Doctor!", time: "9:00 AM" },
      {
        id: "m2",
        sender: "doctor",
        text: "Hi Ahsan, how are you feeling today?",
        time: "9:02 AM",
      },
    ],
    "2": [
      { id: "m1", sender: "patient", text: "My skin feels too dry", time: "8:30 AM" },
    ],
    "3": [],
  });

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim() || !selectedPatient) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "doctor",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedPatient]: [...(prev[selectedPatient] || []), newMsg],
    }));

    setInput("");
  };

  // Chat interface
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "doctor" ? styles.doctorMsg : styles.patientMsg,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  );

  if (!selectedPatient) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Doctor Messages</Text>
        <Text style={styles.subtitle}>Select a patient to start chat</Text>

        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.patientCard}
              onPress={() => setSelectedPatient(item.id)}
            >
              <Ionicons name="person-circle-outline" size={40} color="#000" />
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.issue}>{item.issue}</Text>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    );
  }

  // Chat Screen
  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedPatient(null)}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.chatTitle}>
          {patients.find((p) => p.id === selectedPatient)?.name}
        </Text>
      </View>

      {/* Chat messages */}
      <FlatList
        data={messages[selectedPatient]}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* Input box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#777"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#444",
    marginBottom: 15,
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  patientName: {
    fontWeight: "bold",
    color: "#000",
  },
  issue: {
    color: "#666",
    fontSize: 13,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
  },
  doctorMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#000",
  },
  patientMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  messageText: {
    color: "#fff",
  },
  messageTime: {
    color: "#ccc",
    fontSize: 10,
    textAlign: "right",
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 10,
  },
});
