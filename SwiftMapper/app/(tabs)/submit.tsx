import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { SightingType } from "../../types";

const SIGHTING_TYPES: {
  label: string;
  value: SightingType;
  description: string;
}[] = [
  {
    label: "🏠 Nest Entry",
    value: "nest_entry",
    description: "Swift seen entering or exiting a nest hole",
  },
  {
    label: "🌀 Screaming Party",
    value: "screaming_party",
    description: "Group of swifts screaming around buildings",
  },
  {
    label: "🐦 Single Bird",
    value: "single_bird",
    description: "One swift seen flying",
  },
  {
    label: "📝 Other",
    value: "other",
    description: "Any other swift activity",
  },
];

export default function SubmitScreen() {
  const [sightingType, setSightingType] = useState<SightingType | null>(null);
  const [birdCount, setBirdCount] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("");

  async function getLocation() {
    setLocating(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Error",
        "Location permission is required to submit a sighting",
      );
      setLocating(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    // Reverse geocode to get a human readable name
    const [place] = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    if (place) {
      const name = [place.subregion, place.district, place.city]
        .filter(Boolean)
        .join(", ");
      setLocationName(name);
    }
    setLocating(false);
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Camera roll permission is required to add a photo");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Camera permission is required to take a photo");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function uploadPhoto(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("sighting-photos")
        .upload(fileName, blob, { contentType: `image/${fileExt}` });

      if (error) throw error;

      const { data } = supabase.storage
        .from("sighting-photos")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Photo upload error:", error);
      return null;
    }
  }

  async function handleSubmit() {
    if (!sightingType) {
      Alert.alert("Error", "Please select a sighting type");
      return;
    }
    if (!location) {
      Alert.alert("Error", "Please get your location first");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to submit a sighting");
        return;
      }

      let photoUrl = null;
      if (photo) {
        photoUrl = await uploadPhoto(photo);
      }

      const { error } = await supabase.from("sightings").insert({
        user_id: user.id,
        sighting_type: sightingType,
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: locationName || null,
        bird_count: birdCount ? parseInt(birdCount) : null,
        notes: notes || null,
        photo_url: photoUrl,
      });

      if (error) throw error;

      Alert.alert(
        "🐦 Sighting recorded!",
        "Thank you for contributing to swift conservation.",
        [{ text: "Great!", onPress: () => router.replace("/") }],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit sighting. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Record a Sighting</Text>

      {/* Sighting Type */}
      <Text style={styles.label}>What did you see? *</Text>
      {SIGHTING_TYPES.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeCard,
            sightingType === type.value && styles.typeCardSelected,
          ]}
          onPress={() => setSightingType(type.value)}
        >
          <Text
            style={[
              styles.typeLabel,
              sightingType === type.value && styles.typeLabelSelected,
            ]}
          >
            {type.label}
          </Text>
          <Text
            style={[
              styles.typeDescription,
              sightingType === type.value && styles.typeDescriptionSelected,
            ]}
          >
            {type.description}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Location */}
      <Text style={styles.label}>Location *</Text>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color="#2d6a4f" />
        ) : (
          <Text style={styles.locationButtonText}>
            {location
              ? `📍 ${locationName || "Location captured"}`
              : "📍 Get my location"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Bird Count */}
      <Text style={styles.label}>Number of birds (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 3"
        placeholderTextColor="#999"
        value={birdCount}
        onChangeText={setBirdCount}
        keyboardType="number-pad"
      />

      {/* Notes */}
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g. Flying low, likely feeding"
        placeholderTextColor="#999"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      {/* Photo */}
      <Text style={styles.label}>Photo (optional)</Text>
      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
          <Text style={styles.photoButtonText}>🖼️ Choose Photo</Text>
        </TouchableOpacity>
      </View>
      {photo && (
        <View style={styles.photoPreview}>
          <Image source={{ uri: photo }} style={styles.photoImage} />
          <TouchableOpacity onPress={() => setPhoto(null)}>
            <Text style={styles.removePhoto}>Remove photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Sighting</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 8,
    marginTop: 16,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  typeCardSelected: {
    borderColor: "#2d6a4f",
    backgroundColor: "#f0f7f4",
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  typeLabelSelected: {
    color: "#2d6a4f",
  },
  typeDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  typeDescriptionSelected: {
    color: "#2d6a4f",
  },
  locationButton: {
    borderWidth: 1,
    borderColor: "#2d6a4f",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  locationButtonText: {
    color: "#2d6a4f",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  photoButtonText: {
    fontSize: 14,
    color: "#444",
  },
  photoPreview: {
    marginTop: 12,
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removePhoto: {
    color: "#e63946",
    marginTop: 8,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#2d6a4f",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
