import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/auth/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐦 Swift Mapper</Text>
      <Text style={styles.subtitle}>
        Thank you for helping swift conservation!
      </Text>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 48,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#e63946",
    borderRadius: 8,
    padding: 14,
    paddingHorizontal: 32,
  },
  signOutText: {
    color: "#e63946",
    fontSize: 16,
    fontWeight: "600",
  },
});
