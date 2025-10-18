import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    setIsSignup(!isSignup);
    Animated.timing(slide, {
      toValue: isSignup ? 0 : width * 0.5,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.wrapper}  >
      <Animated.View
        style={[
          styles.purplePanel,
          { left: slide.interpolate({ inputRange: [0, width * 0.5], outputRange: [0, width * 0.5] }) },
        ]}
      >
        <Text style={styles.purpleTitle}>Welcome!</Text>
        <Text style={styles.purpleText}>
          {isSignup
            ? "Already have an account? Login now!"
            : "Don’t have an account? Sign up now!"}
        </Text>
        <TouchableOpacity onPress={toggle} style={styles.whiteBtn}>
          <Text style={styles.whiteBtnText}>
            {isSignup ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.formArea,
          { right: slide.interpolate({ inputRange: [0, width * 0.5], outputRange: [0, width * 0.5] }) },
        ]}
      >
        {!isSignup ? (
          <>
            <Text style={styles.formTitle}>Login</Text>
            <TextInput style={styles.input} placeholder="Email" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
            />
            <TouchableOpacity style={styles.purpleBtn}>
              <Text style={styles.purpleBtnText}>Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>Sign Up</Text>
            <TextInput style={styles.input} placeholder="Name" />
            <TextInput style={styles.input} placeholder="Email" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
            />
            <TouchableOpacity style={styles.purpleBtn}>
              <Text style={styles.purpleBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000000ff",
    alignItems: "center",
    justifyContent: "center",
  },
  purplePanel: {
    position: "absolute",
    width: "50%",
    height: 480,
    backgroundColor: "black",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  purpleTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  purpleText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 25,
    lineHeight: 20,
  },
  whiteBtn: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  whiteBtnText: {
    color: "black",
    fontWeight: "bold",
  },
  formArea: {
    position: "absolute",
    width: "50%",
    height: 480,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    elevation: 6,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  purpleBtn: {
    backgroundColor: "black",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 5,
  },
  purpleBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
