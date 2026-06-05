import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2d6a4f",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#1a1a2e",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🗺️</Text>,
          headerTitle: "Swift Mapper",
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: "Record",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🐦</Text>,
          headerTitle: "Record Sighting",
        }}
      />
      <Tabs.Screen
        name="my-sightings"
        options={{
          title: "My Sightings",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
          headerTitle: "My Sightings",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
          headerTitle: "Profile",
        }}
      />
    </Tabs>
  );
}
