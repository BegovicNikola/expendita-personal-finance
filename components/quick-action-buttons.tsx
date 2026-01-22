import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function QuickActionButtons() {
  const color = useThemeColor({ light: Colors.light.accent, dark: Colors.dark.accent }, 'accent');
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button}>
        <IconSymbol size={28} name="format-list-bulleted-add" color={color} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <IconSymbol size={28} name="qr-code-scanner" color={color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 12,
    backgroundColor: Colors.light.accent,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});