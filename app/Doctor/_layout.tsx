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
          backgroundColor: "#000000ff",
          borderTopColor: "#000",
          borderTopWidth: 1,
          height: 60,
        },
      }}
    >
      {/* ✅ Visible Tabs */}
      <Tabs.Screen
        name="DoctorDashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="Patients"
        options={{
          title: "Patients",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="DoctorSchedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
      name ="DoctorChat"
      options ={{
        title: "Messages",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />
        ),
      }}
      />


      {/* 🚫 Hidden Pages */}
      <Tabs.Screen name="DoctorInformationForm" options={{ href: null }} />
      <Tabs.Screen name="DoctorNotifications" options={{ href: null }} />
      <Tabs.Screen name="DoctorProfile" options={{ href: null }} />
      <Tabs.Screen name="DoctorSettings" options={{ href: null }} />
      <Tabs.Screen name="MedicalRecords" options={{ href: null }} />
      <Tabs.Screen name="DoctorLogin" options={{ href: null }} />
      <Tabs.Screen name="DoctorSignup" options={{ href: null }} />
      <Tabs.Screen name="DoctorNotes" options={{ href: null }} />
      <Tabs.Screen name="DoctorPrescription" options={{ href: null }} />
      <Tabs.Screen name="DoctorAppointments" options={{ href: null }} />
      <Tabs.Screen name="PatientDetail" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
