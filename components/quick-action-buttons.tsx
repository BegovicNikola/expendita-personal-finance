import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function QuickActionButtons() {
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
  const backgroundColor = useThemeColor({ light: Colors.light.accent, dark: Colors.dark.accent }, 'accent');

  return (
    <View style={[styles.container, { bottom: 16 + insets.bottom }]}>
      <Pressable
        style={({ pressed }) => [styles.button, { backgroundColor, opacity: pressed ? 0.7 : 1 }]}
        onPress={() => router.push("/receipt/add")}
        accessibilityLabel="Add receipt manually"
        accessibilityRole="button"
      >
        <IconSymbol size={28} name="format-list-bulleted-add" color={iconColor} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.button, { backgroundColor, opacity: pressed ? 0.7 : 1 }]}
        onPress={() => router.push("/receipt/scan")}
        accessibilityLabel="Scan receipt QR code"
        accessibilityRole="button"
      >
        <IconSymbol size={28} name="qr-code-scanner" color={iconColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});