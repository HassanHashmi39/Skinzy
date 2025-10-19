import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";

const screenWidth = Dimensions.get("window").width;

export default function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem("analysisHistory");
        if (saved) setHistory(JSON.parse(saved));
      } catch (e) {
        console.log("Error loading history", e);
      }
    };
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    await AsyncStorage.setItem("analysisHistory", JSON.stringify(updated));
  };

  const handleView = (item) => {
    router.push({ pathname: "/AnalysisResult", params: item });
  };

  // Stats
  const scores = history.map((h) => h.overall);
  const avgScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const chartData = {
    labels: history.slice(0, 5).map((h) => h.date),
    datasets: [
      {
        data: history.slice(0, 5).map((h) => h.overall),
        strokeWidth: 2,
      },
    ],
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.score}>
          Score:{" "}
          <Text style={{ color: item.overall < 50 ? "red" : "green" }}>
            {item.overall}
          </Text>
        </Text>
        <Text style={styles.detail}>Skin Age: {item.skinAge}</Text>
        <Text style={styles.detail}>Issues: {item.issues?.join(", ")}</Text>
        <Text style={styles.date}>{item.date}</Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.viewBtn} onPress={() => handleView(item)}>
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              Alert.alert("Delete Analysis", "Remove this record?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => handleDelete(item.id) },
              ])
            }
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>AI Analysis History</Text>

      {history.length === 0 ? (
        <Text style={styles.empty}>No saved analyses yet.</Text>
      ) : (
        <>
          {/* --- Circular Overall Indicator --- */}
          <View style={styles.circleCard}>
            <Progress.Circle
              size={130}
              progress={avgScore / 100}
              thickness={10}
              color="#000"
              unfilledColor="#e5e5e5"
              borderWidth={0}
              showsText={true}
              formatText={() => `${avgScore}%`}
              textStyle={{ color: "#000", fontWeight: "bold", fontSize: 20 }}
            />
            <Text style={styles.circleLabel}>Average Skin Score</Text>
          </View>

          {/* --- Stats Cards --- */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{history.length}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
          </View>

          {/* --- Line Graph --- */}
          <Text style={styles.sectionTitle}>Score Trend</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => "#000",
              strokeWidth: 2,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#000" },
            }}
            bezier
            style={styles.chart}
          />

          {/* --- List --- */}
          <Text style={styles.sectionTitle}>Previous Analyses</Text>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  circleCard: {
    alignItems: "center",
    marginBottom: 25,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#000",
  },
  circleLabel: {
    marginTop: 10,
    color: "#000",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
    marginBottom: 30,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
  },
  score: { fontWeight: "bold", color: "#000" },
  detail: { fontSize: 13, color: "#333" },
  date: { fontSize: 12, color: "#777", marginTop: 3 },
  btnRow: { flexDirection: "row", marginTop: 8 },
  viewBtn: {
    backgroundColor: "#000",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  viewText: { color: "#fff", fontWeight: "bold" },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  deleteText: { color: "#000", fontWeight: "bold" },
  empty: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
    marginTop: 60,
  },
});
