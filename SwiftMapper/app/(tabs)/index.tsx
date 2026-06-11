import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Sighting, SightingType } from "../../types";

const SIGHTING_COLOURS: Record<string, string> = {
  nest_entry: "#2d6a4f",
  screaming_party: "#e76f51",
  single_bird: "#457b9d",
  other: "#6c757d",
};

const SIGHTING_LABELS: Record<string, string> = {
  nest_entry: "🏠 Nest Entry",
  screaming_party: "🌀 Screaming Party",
  single_bird: "🐦 Single Bird",
  other: "📝 Other",
};

const ALL_TYPES: SightingType[] = [
  "nest_entry",
  "screaming_party",
  "single_bird",
  "other",
];

function SeasonBanner() {
  const month = new Date().getMonth();
  const isSwiftSeason = month >= 4 && month <= 7;
  if (!isSwiftSeason) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>Swift season is here! 🐦</Text>
      <Text style={styles.bannerSubtitle}>
        May-August is peak time to record sightings
      </Text>
    </View>
  );
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [activeFilters, setActiveFilters] = useState<SightingType[]>([...ALL_TYPES]);

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    getCurrentLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSightings();
    }, [])
  );

  async function fetchSightings() {
    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .order("sighted_at", { ascending: false });
    if (!error && data) {
      setSightings(data);
    }
  }

  function toggleFilter(type: SightingType) {
    setActiveFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }

  const filteredSightings = sightings.filter((s) =>
    activeFilters.includes(s.sighting_type as SightingType)
  );

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text>Finding your location... 📍</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SeasonBanner />

      {/* Filter toggles */}
      <View style={styles.filterRow}>
        {ALL_TYPES.map((type) => {
          const isActive = activeFilters.includes(type);
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: SIGHTING_COLOURS[type] },
              ]}
              onPress={() => toggleFilter(type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {SIGHTING_LABELS[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredSightings.map((sighting) => (
          <Marker
            key={sighting.id}
            coordinate={{
              latitude: sighting.latitude,
              longitude: sighting.longitude,
            }}
            pinColor={SIGHTING_COLOURS[sighting.sighting_type]}
            onPress={() => setSelectedSighting(sighting)}
          />
        ))}
      </MapView>

      <Modal
        visible={selectedSighting !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSighting(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSighting && (
              <>
                <Text style={styles.modalType}>
                  {SIGHTING_LABELS[selectedSighting.sighting_type]}
                </Text>
                {selectedSighting.location_name && (
                  <Text style={styles.modalDetail}>
                    📍 {selectedSighting.location_name}
                  </Text>
                )}
                {selectedSighting.bird_count && (
                  <Text style={styles.modalDetail}>
                    🐦 {selectedSighting.bird_count} bird
                    {selectedSighting.bird_count > 1 ? "s" : ""}
                  </Text>
                )}
                {selectedSighting.notes && (
                  <Text style={styles.modalNotes}>
                    {selectedSighting.notes}
                  </Text>
                )}
                <Text style={styles.modalDate}>
                  {new Date(selectedSighting.sighted_at).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedSighting(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    backgroundColor: "#2d6a4f",
    padding: 12,
    paddingHorizontal: 16,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  bannerSubtitle: {
    color: "#b7e4c7",
    fontSize: 13,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  filterChipText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  modalDetail: {
    fontSize: 15,
    color: "#444",
    marginBottom: 6,
  },
  modalNotes: {
    fontSize: 15,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
  },
  modalDate: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#2d6a4f",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});