// app/_layout.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      const userType = await AsyncStorage.getItem("userType");
      setLoading(false);
      if (userType === "Doctor") router.replace("/Doctor/DoctorInformationForm");
      else if (userType === "Patient") router.replace("/Patient/UserInfoScreen");
      else router.replace("/SelectionPage");
    };
    checkUserType();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );

  return <Stack screenOptions={{ headerShown: false }} />;
}
