import { Colors } from "@/constants/theme";
import { getReceiptById, updateReceipt } from "@/db/receipts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateParts, parseToISO } from "@/lib/date-utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Format number as Serbian format (e.g., 1234.56 -> "1.234,56")
 */
function formatSerbianNumber(value: number): string {
  return value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse Serbian formatted string to number (e.g., "1.234,56" -> 1234.56)
 */
function parseSerbianNumber(value: string): number | null {
  const normalized = value.replace(/\./g, "").replace(/,/g, ".");
  const result = parseFloat(normalized);
  return isNaN(result) ? null : result;
}

/**
 * Format input as user types with Serbian thousand separators.
 * - Auto-adds dots as thousand separators
 * - Allows only one comma for decimal
 * - Limits decimal to 2 digits
 */
function formatTotalInput(text: string, previousValue: string): string {
  // Remove any character that's not digit or comma
  let cleaned = text.replace(/[^\d,]/g, "");

  // Allow empty field
  if (cleaned === "") {
    return "";
  }

  // Block second comma - if there's more than one, revert to previous value
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 1) {
    return previousValue;
  }

  // Split by comma (decimal separator)
  const parts = cleaned.split(",");

  // Get integer part (only digits)
  let integerPart = parts[0].replace(/\D/g, "");

  // Remove leading zeros (but keep single "0" if user types it)
  integerPart = integerPart.replace(/^0+/, "") || (parts[0] === "0" ? "0" : "");

  // Add thousand separators (dots)
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Get decimal part (limit to 2 digits)
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, "").slice(0, 2);
    return `${integerPart},${decimalPart}`;
  }

  return integerPart;
}

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string; }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [total, setTotal] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    companyName: "",
    total: "",
    date: "",
    time: "",
  });

  const hasChanges =
    companyName !== originalValues.companyName ||
    total !== originalValues.total ||
    date !== originalValues.date ||
    time !== originalValues.time;

  useEffect(() => {
    async function loadReceipt() {
      if (!id) return;
      try {
        const data = await getReceiptById(Number(id));
        if (data) {
          const { date: dateStr, time: timeStr } = formatDateParts(
            new Date(data.dateTime)
          );

          const formattedTotal = formatSerbianNumber(data.total);
          setCompanyName(data.companyName);
          setTotal(formattedTotal);
          setDate(dateStr);
          setTime(timeStr);
          setOriginalValues({
            companyName: data.companyName,
            total: formattedTotal,
            date: dateStr,
            time: timeStr,
          });
        }
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

    const parsedTotal = parseSerbianNumber(total);
    if (parsedTotal === null || parsedTotal <= 0) {
      Alert.alert("Greška", "Iznos mora biti veći od 0 RSD");
      return;
    }

    setIsSaving(true);
    try {
      const dateTime = parseToISO(date, time);
      await updateReceipt(Number(id), {
        companyName,
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

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isEditing
        ? colorScheme === "dark" ? "#1E2022" : "#fff"
        : colorScheme === "dark" ? "#151718" : "#F9FAFB",
      borderColor: colorScheme === "dark" ? "#2A2E31" : "#E5E7EB",
      color: colors.text,
    },
  ];

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.icon }]}>
                Company Name
              </Text>
              <TextInput
                style={inputStyle}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Enter company name"
                placeholderTextColor={colors.icon}
                editable={isEditing}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.icon }]}>
                Total (RSD)
              </Text>
              <TextInput
                style={inputStyle}
                value={total}
                onChangeText={(text) => setTotal(formatTotalInput(text, total))}
                placeholder="1.234,56"
                placeholderTextColor={colors.icon}
                keyboardType="decimal-pad"
                editable={isEditing}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.flex1]}>
                <Text style={[styles.label, { color: colors.icon }]}>Date</Text>
                <TextInput
                  style={inputStyle}
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD.MM.YYYY"
                  placeholderTextColor={colors.icon}
                  editable={isEditing}
                />
              </View>

              <View style={styles.rowGap} />

              <View style={[styles.field, styles.flex1]}>
                <Text style={[styles.label, { color: colors.icon }]}>Time</Text>
                <TextInput
                  style={inputStyle}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.icon}
                  editable={isEditing}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Text
              style={[
                styles.actionButton,
                {
                  backgroundColor: isEditing ? colors.tint : colorScheme === "dark" ? "#2A2E31" : "#E5E7EB",
                  color: isEditing ? "#fff" : colors.text,
                  opacity: isSaving ? 0.6 : 1,
                },
              ]}
              onPress={handleEditSavePress}
            >
              {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
  },
  rowGap: {
    width: 12,
  },
  flex1: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
  },
  actionButton: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    padding: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
});