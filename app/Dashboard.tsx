// Dashboard.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg } from "react-native-svg";

// ----- SAMPLE DATA -----
const PRODUCTS = [
  {
    id: "p1",
    name: "POND'S Charcoal Cleanser",
    subtitle: "Deep Clean",
    img: "https://images.unsplash.com/photo-1585386959984-a415522c7c48?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "p2",
    name: "Hydra Serum",
    subtitle: "Hyaluronic",
    img: "https://images.unsplash.com/photo-1582204279600-9b4b2b1b5fbd?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "p3",
    name: "SPF 50 Gel",
    subtitle: "Sun Protect",
    img: "https://images.unsplash.com/photo-1600180758890-6e85d3c37bfc?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "p4",
    name: "Vitamin C Cream",
    subtitle: "Brightening",
    img: "https://images.unsplash.com/photo-1590080877777-1c3a6f2f3b2b?auto=format&fit=crop&w=500&q=60",
  }
];

const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Ali Shah",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=60",
    title: "Dermatologist",
  },
  {
    id: "d2",
    name: "Dr. Sara Khan",
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=500&q=60",
    title: "Skin Specialist",
  },
  {
    id: "d3",
    name: "Dr. Omar Latif",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=60",
    title: "Cosmetic Surgeon",
  },
  {
    id: "d4",
    name: "Dr. Nadia Ahmed",
    img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=60",
    title: "Pediatric Dermatologist",
  }
];

// Animated SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CircularProgress({ size = 90, strokeWidth = 8, percentage = 50, title }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const color = percentage < 50 ? "#e74c3c" : "#2ecc71";

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.progressNumber}>{percentage}%</Text>
      {title && <Text style={styles.progressLabel}>{title}</Text>}
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("User");

  const averageScore = 76;
  const routineScore = 88;

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const menuLinks = [
    { label: "🧴 My Routine", path: "/MyRoutine" },
    { label: "🛍️ Products", path: "/Products" },
    { label: "👨‍⚕️ Doctors", path: "/Consult" },
    { label: "📄 Profile", path: "/Profile" },
    { label: "🗓 Bookings " ,path: "/MyBookings" }
  ];

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("userProfile");
      if (savedProfile) {
        const data = JSON.parse(savedProfile);
        setProfileImage(data.image);
        setUserName(data.name || "User");
      }
    } catch (e) {
      console.log("Error loading profile:", e);
    }
  };
  loadProfile();
}, []);

  return (
    <View style={styles.screen}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push("/Profile")} style={styles.navIcon}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.appTitle}>SKINZY</Text>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={() => router.push("/Notifications")} style={styles.navIcon}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMenu} style={styles.navIcon}>
            <Ionicons name="menu-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <View style={styles.dropdown}>
          {menuLinks.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push(item.path);
              }}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Row */}
        <View style={styles.topRow}>
          <View style={styles.profileCard}>
            <View style={styles.profileImageWrap}>
              <Image
                source={{
                  uri: profileImage
                    ? profileImage
                    : "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                }}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.smallLabel}>See Detail</Text>
              <Text style={styles.greetingSmall}>HEY 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>

          <View style={styles.progressColumn}>
            <View style={styles.smallCard}>
              <CircularProgress percentage={averageScore} title="Average Skin Score" />
            </View>
            <View style={styles.smallCard}>
              <CircularProgress percentage={routineScore} title="Routine Score" />
            </View>
          </View>
        </View>

        {/* Discover */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover</Text>
          <FlatList
            data={PRODUCTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productCard}>
                <Image source={{ uri: item.img }} style={styles.productThumb} />
                <Text style={styles.productNameSmall}>{item.name}</Text>
                <Text style={styles.productSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Doctors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctors</Text>
          <FlatList
            data={DOCTORS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.doctorCard}>
                <Image source={{ uri: item.img }} style={styles.doctorImage} />
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.doctorTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const CORAL = "#000";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CORAL,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },
  appTitle: { color: "#fff", fontWeight: "900", fontSize: 20, letterSpacing: 2 },
  navRight: { flexDirection: "row", alignItems: "center" },
  navIcon: { marginHorizontal: 8 },

  dropdown: {
    backgroundColor: "#fff",
    position: "absolute",
    top: 100,
    right: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 99,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  menuText: { fontWeight: "600", color: "#333" },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  profileCard: { width: "55%" },
  profileImageWrap: {
    borderRadius: 14,
    borderWidth: 8,
    borderColor: CORAL,
    overflow: "hidden",
  },
  profileImage: { width: "100%", height: 220 },
  profileMeta: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  smallLabel: { color: "#666", textAlign: "right", fontSize: 12 },
  greetingSmall: { fontSize: 13, color: "#000" },
  userName: { fontSize: 18, fontWeight: "900", color: "#000" },

  progressColumn: { flex: 1 },
  smallCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 8,
    borderColor: "#000",
    padding: 10,
    marginBottom: 10,
    alignItems: "center",

  },
  progressNumber: {
    position: "absolute",
    top: 34,
    left: "38%",
    fontWeight: "800",
  },
  progressLabel: { fontSize: 11, color: "#666", marginTop: 8, textAlign: "center" },

  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  productCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  productThumb: { width: 110, height: 90, borderRadius: 10, marginBottom: 8 },
  productNameSmall: { fontWeight: "700", fontSize: 12, textAlign: "center" },
  productSubtitle: { fontSize: 11, color: "#666" },

  doctorCard: {
    width: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  doctorImage: { width: 86, height: 86, borderRadius: 10, marginBottom: 8 },
  doctorName: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  doctorTitle: { fontSize: 11, color: "#666", textAlign: "center" },
});
