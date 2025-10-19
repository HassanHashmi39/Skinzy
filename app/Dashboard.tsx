import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();

  const buttons = [
    { label: "Analyze Skin", route: "/AIAnalysis" },
    { label: "My Routine", route: "/Routine" },
    { label: "Appointments", route: "/Appointments" },
    { label: "Products", route: "/Products" },
    { label: "Progress", route: "/Progress" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, Sophie 👋</Text>
          <Text style={styles.subtext}>Welcome back to Skinzy</Text>
        </View>

        <View style={styles.icons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/Notifications")}
          >
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/Profile")}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreTitle}>AI Analysis Score</Text>
          <Text style={styles.scoreValue}>72</Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: "72%" }]} />
          </View>
          <Text style={styles.scoreInfo}>Last Analysis: 2025/10/10</Text>
        </View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2922/2922506.png",
          }}
          style={styles.profileImg}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/BeautyPlan")}
        >
          <Text style={styles.actionTitle}>My Beauty Plan</Text>
          <Text style={styles.actionSub}>Dr’s Advice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/Data")}
        >
          <Text style={styles.actionTitle}>Data</Text>
          <Text style={styles.actionSub}>Analysis & Care</Text>
        </TouchableOpacity>
      </View>

      {/* Skin Care Partner */}
      <Text style={styles.sectionTitle}>Skin Care Partner</Text>
      <View style={styles.partnerRow}>
        <TouchableOpacity
          style={styles.partnerBtn}
          onPress={() => router.push("/WaterTracker")}
        >
          <Text style={styles.partnerText}>Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.partnerBtn}
          onPress={() => router.push("/Mirror")}
        >
          <Text style={styles.partnerText}>Mirror</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.partnerBtn}
          onPress={() => router.push("/UVChecker")}
        >
          <Text style={styles.partnerText}>UV</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Articles */}
      <Text style={styles.sectionTitle}>Recommended Articles</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.articleScroll}
      >
        {[1, 2, 3].map((i) => (
          <TouchableOpacity
            key={i}
            style={styles.articleCard}
            onPress={() => router.push(`/ArticleDetails/${i}`)}
          >
            <Image
              source={{
                uri: "https://via.placeholder.com/150x100.png?text=Article+" + i,
              }}
              style={styles.articleImg}
            />
            <Text style={styles.articleTitle}>Skin Beauty Tips #{i}</Text>
            <Text style={styles.articleSubtitle}>81% suits you</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  subtext: {
    fontSize: 14,
    color: "#555",
  },
  icons: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 6,
  },
  iconText: {
    fontSize: 16,
    color: "#000",
  },

  scoreCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    padding: 20,
    marginVertical: 25,
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreLeft: {
    flex: 1,
  },
  scoreTitle: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 5,
  },
  bar: {
    width: "90%",
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 5,
  },
  barFill: {
    height: 6,
    backgroundColor: "#000",
  },
  scoreInfo: {
    fontSize: 12,
    color: "#666",
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 15,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionBtn: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 25,
    alignItems: "center",
  },
  actionTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionSub: {
    color: "#555",
    fontSize: 12,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  partnerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  partnerBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  partnerText: {
    color: "#000",
    fontWeight: "bold",
  },

  articleScroll: {
    marginBottom: 40,
  },
  articleCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    marginRight: 15,
    width: 160,
    padding: 10,
  },
  articleImg: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  articleTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  articleSubtitle: {
    color: "#555",
    fontSize: 12,
    marginTop: 4,
  },
});
