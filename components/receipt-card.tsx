import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateTime } from "@/lib/date-utils";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

interface ReceiptCardProps {
  id: number;
  companyName: string;
  total: number;
  dateTime: string;
}

/**
 * Format number as Serbian currency (e.g., 4142.74 -> "4.142,74 RSD")
 */
function formatCurrency(amount: number): string {
  const formatted = amount
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} RSD`;
}

export function ReceiptCard({ id, companyName, total, dateTime }: ReceiptCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handlePress = () => {
    router.push(`/receipt/${id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1E2022" : "#fff",
          borderColor: colorScheme === "dark" ? "#2A2E31" : "#E5E7EB",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
        {companyName}
      </Text>
      <Text style={[styles.total, { color: colors.tint }]}>
        {formatCurrency(total)}
      </Text>
      <Text style={[styles.dateTime, { color: colors.icon }]}>
        {formatDateTime(dateTime)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 13,
  },
});
