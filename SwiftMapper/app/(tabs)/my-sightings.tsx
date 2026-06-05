import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Sighting } from "../../types";

const SIGHTING_LABELS: Record<string, string> = {
  nest_entry: "🏠 Nest Entry",
  screaming_party: "🌀 Screaming Party",
  single_bird: "🐦 Single Bird",
  other: "📝 Other",
};

export default function MySightingsScreen() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchSightings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .eq("user_id", user.id)
      .order("sighted_at", { ascending: false });

    if (!error && data) {
      setSightings(data);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchSightings();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchSightings();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  if (sightings.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🐦</Text>
        <Text style={styles.emptyTitle}>No sightings yet</Text>
        <Text style={styles.emptySubtitle}>
          Head to the Record tab to submit your first swift sighting!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sightings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2d6a4f"
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sightingType}>
              {SIGHTING_LABELS[item.sighting_type]}
            </Text>
            <Text style={styles.date}>
              {new Date(item.sighted_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          {item.location_name && (
            <Text style={styles.location}>📍 {item.location_name}</Text>
          )}

          {item.bird_count && (
            <Text style={styles.detail}>
              🐦 {item.bird_count} bird{item.bird_count > 1 ? "s" : ""}
            </Text>
          )}

          {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

          {item.photo_url && (
            <Image
              source={{ uri: item.photo_url }}
              style={styles.photo}
              resizeMode="cover"
            />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  list: {
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sightingType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  date: {
    fontSize: 13,
    color: "#999",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
    marginTop: 4,
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 12,
  },
});
