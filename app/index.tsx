import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      router.push("./AuthScreen"); 
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
        <Image source={require('./Images/logo.png')} style={{width:150, height:150, marginBottom:20}} >

        </Image>
      <Animated.Text
        style={[
          styles.logoText,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        SKINZY
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        AI Skincare & Wellness
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        Signup to Look Good & Feel Great!
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // white background
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#000", // black text
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    color: "#000",
    marginTop: 8,
    letterSpacing: 1,
  },
});
