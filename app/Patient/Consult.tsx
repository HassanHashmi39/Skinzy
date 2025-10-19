import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Consult() {
  const router = useRouter();

  // Temporary doctor list (can later come from backend)
  const doctors = [
    {
      id: "1",
      name: "Dr. Ayesha Malik",
      specialization: "Dermatologist - Acne & Skin Health",
      experience: "8 years",
      image:
        "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
    },
    {
      id: "2",
      name: "Dr. Hassan Raza",
      specialization: "Cosmetic & Aesthetic Specialist",
      experience: "5 years",
      image:
        "https://cdn-icons-png.flaticon.com/512/921/921073.png",
    },
    {
      id: "3",
      name: "Dr. Fatima Noor",
      specialization: "Pediatric Dermatologist",
      experience: "6 years",
      image:
        "https://cdn-icons-png.flaticon.com/512/4140/4140050.png",
    },
  ];

  const handleBook = (doctorName: string) => {
    router.push({
      pathname: "/BookConsultation",
      params: { doctor: doctorName },
    });
  };

  const renderDoctor = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.specialization}>{item.specialization}</Text>
        <Text style={styles.exp}>Experience: {item.experience}</Text>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => handleBook(item.name)}
        >
          <Text style={styles.bookText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Consult a Dermatologist</Text>
      <Text style={styles.subHeader}>
        Choose a specialist for your skin concerns
      </Text>

      <FlatList
        data={doctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subHeader: {
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    flexDirection: "row",
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
  },
  specialization: {
    color: "#444",
    fontSize: 14,
    marginVertical: 4,
  },
  exp: {
    color: "#444",
    fontSize: 13,
  },
  bookBtn: {
    marginTop: 8,
    backgroundColor: "#000",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
