import { View, Text, StyleSheet } from "react-native";

export default function MySightingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your sightings will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
});
