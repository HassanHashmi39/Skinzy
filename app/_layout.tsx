import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Articles') iconName = 'newspaper';
          else if (route.name === 'Measure') iconName = 'scan';
          else if (route.name === 'Market') iconName = 'bag-handle';
          else if (route.name === 'Consult') iconName = 'chatbubbles';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',  
        tabBarInactiveTintColor: '#888', 
        tabBarStyle: {
          backgroundColor: '#fff',       
          borderTopColor: '#000',        
          borderTopWidth: 1,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="Home" options={{ title: 'Home' }} />
      <Tabs.Screen name="Articles" options={{ title: 'Articles' }} />
      <Tabs.Screen name="Measure" options={{ title: 'Measure' }} />
      <Tabs.Screen name="Market" options={{ title: 'Market' }} />
      <Tabs.Screen name="Consult" options={{ title: 'Consult' }} />
    </Tabs>
  );
}
