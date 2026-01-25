import { QuickActionButtons } from "@/components/quick-action-buttons";
import { ReceiptCard } from "@/components/receipt-card";
import { Colors, SectionColors } from "@/constants/theme";
import { getAllReceipts, Receipt } from "@/db/receipts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateParts } from "@/lib/date-utils";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ReceiptSection = {
  title: string;
  data: Receipt[];
  isOdd: boolean;
};

function groupReceiptsByDate(receipts: Receipt[]): ReceiptSection[] {
  const groups = new Map<string, Receipt[]>();
  const todayKey = formatDateParts(new Date()).date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateParts(yesterday).date;

  for (const receipt of receipts) {
    const dateKey = formatDateParts(new Date(receipt.dateTime)).date;
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(receipt);
  }

  return Array.from(groups.entries())
    .sort((a, b) => new Date(b[1][0].dateTime).getTime() - new Date(a[1][0].dateTime).getTime())
    .map(([dateKey, data], index) => ({
      title: dateKey === todayKey ? "Today" : dateKey === yesterdayKey ? "Yesterday" : dateKey,
      data: data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
      isOdd: index % 2 === 0,
    }));
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const sections = useMemo(() => groupReceiptsByDate(receipts), [receipts]);

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

  const getSectionColor = (isOdd: boolean) =>
    SectionColors[colorScheme][isOdd ? "odd" : "even"];

  const renderSectionHeader = ({ section }: { section: ReceiptSection }) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: getSectionColor(section.isOdd) },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.icon }]}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.text }]}>Receipts</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, section }) => (
          <View style={{ backgroundColor: getSectionColor(section.isOdd) }}>
            <ReceiptCard
              id={item.id}
              companyName={item.companyName}
              total={item.total}
              dateTime={item.dateTime}
            />
          </View>
        )}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={({ section }) => (
          <View style={[styles.sectionFooter, { backgroundColor: getSectionColor(section.isOdd) }]} />
        )}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={receipts.length === 0 ? styles.emptyList : styles.list}
        stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionFooter: {
    height: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
