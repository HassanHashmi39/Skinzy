import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6E56",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#0d81c3",
          borderTopWidth: 1,
          height: 60,
        },
      }}
    >
      {/* Visible Tabs */}
      <Tabs.Screen name="Dashboard" options={{
        title: "Home",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" color={color} size={size} />
        ),
      }} />

    
        <Tabs.Screen name="Measure" options={{
        title: "Analyze",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="scan-outline" color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="AnalysisHistory" options={{
        title: "History",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="time-outline" color={color} size={size} />
        ),
      }} />

    

      {/* Hidden Pages */}
      <Tabs.Screen
        name="BookConsultation"
        options={{ href: null }} 
      />
      <Tabs.Screen
        name="BookingSuccess"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="AnalysisResult"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="PermissionsScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="HealthInfoScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="UserInfoScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="AuthScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="SplashScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
      name="Notifications"
      options={{ href: null }}
    />
    <Tabs.Screen
      name="Profile"
      options={{ href: null }}
    />
    <Tabs.Screen
    name="index"
    options={{ href: null }}
  />
  <Tabs.Screen
    name="MyBookings"
    options={{ href: null }}
  />
  <Tabs.Screen
    name="Consult"
    options={{ href: null }}
  />
  <Tabs.Screen
    name="Products"
    options={{ href: null }}
  />
  <Tabs.Screen
    name="MyRoutine"
    options={{ href: null }}
  />


    </Tabs>
  );
}
