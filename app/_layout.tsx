import "../global.css";
import { Stack, usePathname } from 'expo-router';
import { View, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from '../components/Header';

if (typeof global !== 'undefined' && global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('FATAL ERROR CAUGHT:', error);
  });
}

export default function RootLayout() {
  // We can skip the global header if the user is in a login/signup screen if we want,
  // but Header.tsx already has a small clean state or hides itself if needed.
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <Header />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

