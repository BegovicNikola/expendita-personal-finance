import { ReceiptForm, ReceiptFormValues } from "@/components/receipt-form";
import { Colors } from "@/constants/theme";
import { deleteReceipt, getReceiptById, updateReceipt } from "@/db/receipts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateParts, parseToISO } from "@/lib/date-utils";
import { formatSerbianNumber, parseSerbianNumber } from "@/lib/number-utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
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

  const hasChanges =
    values.companyName !== originalValues.companyName ||
    values.total !== originalValues.total ||
    values.date !== originalValues.date ||
    values.time !== originalValues.time;

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
          const loadedValues: ReceiptFormValues = {
            companyName: data.companyName,
            total: formattedTotal,
            date: dateStr,
            time: timeStr,
          };
          setValues(loadedValues);
          setOriginalValues(loadedValues);
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
      />
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
});
