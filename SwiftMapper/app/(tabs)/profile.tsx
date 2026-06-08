import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [totalSightings, setTotalSightings] = useState<number>(0);
  const [nestEntries, setNestEntries] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);

        const { data, error } = await supabase
          .from("sightings")
          .select("sighting_type")
          .eq("user_id", user.id);

        if (!error && data) {
          setTotalSightings(data.length);
          setNestEntries(
            data.filter((s) => s.sighting_type === "nest_entry").length,
          );
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐦 Swift Mapper</Text>

      {email && <Text style={styles.email}>{email}</Text>}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalSightings}</Text>
          <Text style={styles.statLabel}>Total Sightings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{nestEntries}</Text>
          <Text style={styles.statLabel}>Nest Entries</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why it matters</Text>
        <Text style={styles.infoText}>
          Swifts are a red-listed species in the UK. Every sighting you record
          helps conservationists track nesting sites and monitor how populations
          are changing over time. Thank you for contributing! 💚
        </Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 4,
    marginTop: 16,
  },
  email: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f0f7f4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2d6a4f",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#e63946",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  signOutText: {
    color: "#e63946",
    fontSize: 16,
    fontWeight: "600",
  },
});
