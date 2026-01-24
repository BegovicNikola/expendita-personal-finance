import { Stack } from "expo-router";

export default function ReceiptLayout() {
  return (
    <Stack>
      <Stack.Screen name="add" options={{ title: "Add Receipt" }} />
      <Stack.Screen name="scan" options={{ title: "Scan Receipt" }} />
      <Stack.Screen name="[id]" options={{ title: "Receipt" }} />
    </Stack>
  );
}
