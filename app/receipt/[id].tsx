import { ReceiptForm, ReceiptFormValues } from "@/components/receipt-form";
import { Colors } from "@/constants/theme";
import {
  deleteReceipt,
  getReceiptById,
  getReceiptItems,
  ReceiptItem,
  updateReceipt,
} from "@/db/receipts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateParts, parseToISO } from "@/lib/date-utils";
import { formatSerbianNumber, parseSerbianNumber } from "@/lib/number-utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Form state
  const [values, setValues] = useState<ReceiptFormValues>({
    companyName: "",
    total: "",
    date: "",
    time: "",
  });

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState<ReceiptFormValues>({
    companyName: "",
    total: "",
    date: "",
    time: "",
  });

  // Receipt items state
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [itemsExpanded, setItemsExpanded] = useState(false);

  // Clean up item name by removing product codes and "(KOM)" suffix
  const cleanItemName = (name: string): string => {
    return name
      .replace(/\s*-\s*\d{10,}\s*/g, "") // Remove long product codes (barcodes)
      .replace(/\s*\([КK][ОO][МM]\)\s*/gi, "") // Remove (KOM) or (КОМ)
      .trim();
  };

  const hasChanges =
    values.companyName !== originalValues.companyName ||
    values.total !== originalValues.total ||
    values.date !== originalValues.date ||
    values.time !== originalValues.time;

  useEffect(() => {
    async function loadReceipt() {
      if (!id) return;
      try {
        const receiptId = Number(id);
        const [data, receiptItems] = await Promise.all([
          getReceiptById(receiptId),
          getReceiptItems(receiptId),
        ]);

        if (data) {
          const { date: dateStr, time: timeStr } = formatDateParts(
            new Date(data.dateTime)
          );

          const formattedTotal = formatSerbianNumber(data.total);
          const loadedValues: ReceiptFormValues = {
            companyName: data.companyName,
            total: formattedTotal,
            date: dateStr,
            time: timeStr,
          };
          setValues(loadedValues);
          setOriginalValues(loadedValues);
        }

        setItems(receiptItems);
      } catch (error) {
        console.error("Failed to load receipt:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadReceipt();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    // If no changes, just exit edit mode
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    const parsedTotal = parseSerbianNumber(values.total);
    if (parsedTotal === null || parsedTotal <= 0) {
      Alert.alert("Error", "Total must be greater than 0 RSD");
      return;
    }

    setIsSaving(true);
    try {
      const dateTime = parseToISO(values.date, values.time);
      await updateReceipt(Number(id), {
        companyName: values.companyName,
        total: parsedTotal,
        dateTime,
      });
      router.replace("/receipts");
    } catch (error) {
      console.error("Failed to save receipt:", error);
      setIsSaving(false);
    }
  };

  const handleEditSavePress = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReceipt(Number(id));
              router.replace("/receipts");
            } catch (error) {
              console.error("Failed to delete receipt:", error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ReceiptForm
        values={values}
        onValuesChange={setValues}
        onSubmit={handleEditSavePress}
        submitLabel={isEditing ? "Save" : "Edit"}
        isSubmitting={isSaving}
        editable={isEditing}
        showDelete={true}
        onDelete={handleDelete}
      >
        {items.length > 0 && (
          <View style={styles.itemsSection}>
            <Pressable
              style={styles.itemsHeader}
              onPress={() => setItemsExpanded(!itemsExpanded)}
            >
              <Text style={[styles.itemsLabel, { color: colors.icon }]}>
                Items ({items.length})
              </Text>
              <Text
                style={[
                  styles.chevron,
                  { color: colors.icon },
                  itemsExpanded && styles.chevronExpanded,
                ]}
              >
                ›
              </Text>
            </Pressable>

            {itemsExpanded && (
              <>
                <View style={[styles.tableHeader, { borderBottomColor: colors.icon }]}>
                  <Text style={[styles.headerName, { color: colors.icon }]}>Item</Text>
                  <Text style={[styles.headerQty, { color: colors.icon }]}>Qty</Text>
                  <Text style={[styles.headerPrice, { color: colors.icon }]}>Price</Text>
                </View>
                {items.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.itemRow, { borderBottomColor: colors.icon }]}
                  >
                    <Text
                      style={[styles.itemName, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {cleanItemName(item.name)}
                    </Text>
                    <Text style={[styles.itemQty, { color: colors.text }]}>
                      {item.quantity % 1 === 0 ? item.quantity : formatSerbianNumber(item.quantity)}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      {formatSerbianNumber(item.totalPrice)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ReceiptForm>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsSection: {
    marginTop: 24,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "600",
    transform: [{ rotate: "90deg" }],
  },
  chevronExpanded: {
    transform: [{ rotate: "-90deg" }],
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  headerQty: {
    width: 40,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  headerPrice: {
    width: 80,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    paddingRight: 8,
  },
  itemQty: {
    width: 40,
    fontSize: 14,
    textAlign: "center",
  },
  itemPrice: {
    width: 80,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
});
