import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />        {/* Selection screen */}
      <Stack.Screen name="user" />         {/* User section */}
      <Stack.Screen name="Doctor" />       {/* Doctor section */}
    </Stack>
  );
}
