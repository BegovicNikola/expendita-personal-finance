import { QuickActionButtons } from "@/components/quick-action-buttons";
import { ReceiptCard } from "@/components/receipt-card";
import { Colors } from "@/constants/theme";
import { deleteAllReceipts, getAllReceipts, Receipt } from "@/db/receipts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const loadReceipts = useCallback(async () => {
    try {
      const data = await getAllReceipts();
      setReceipts(data);
    } catch (error) {
      console.error("Failed to load receipts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // TODO: Remove this - dev only
  const handleClearAll = async () => {
    await deleteAllReceipts();
    setReceipts([]);
  };

  // Reload receipts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No receipts yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Scan a QR code to add your first receipt
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.text }]}>Receipts</Text>
        {/* TODO: Remove this - dev only */}
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={{ color: "red", fontSize: 14 }}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReceiptCard
            id={item.id}
            companyName={item.companyName}
            total={item.total}
            dateTime={item.dateTime}
          />
        )}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={receipts.length === 0 ? styles.emptyList : styles.list}
      />

      <QuickActionButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
