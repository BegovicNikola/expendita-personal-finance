import { StyleSheet, Text, View } from "react-native";

export default function AddReceiptScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add Receipt Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
});
