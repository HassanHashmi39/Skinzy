
import { Stack } from "expo-router";
import React from "react";

export default function DoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorDashboard" />
      <Stack.Screen name="Patients" />
      <Stack.Screen name="Profile" />
      <Stack.Screen name="Notifications" />
      <Stack.Screen name="Calendar" />
    </Stack>
  );
}
