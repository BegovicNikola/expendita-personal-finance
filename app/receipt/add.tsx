import { ReceiptForm, ReceiptFormValues } from "@/components/receipt-form";
import { Colors } from "@/constants/theme";
import { insertReceipt } from "@/db/receipts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateParts, parseToISO } from "@/lib/date-utils";
import { parseSerbianNumber } from "@/lib/number-utils";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddReceiptScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with current date/time
  const { date: currentDate, time: currentTime } = formatDateParts(new Date());

  const [values, setValues] = useState<ReceiptFormValues>({
    companyName: "",
    total: "",
    date: currentDate,
    time: currentTime,
  });

  const handleSubmit = async () => {
    // Validate company name
    if (!values.companyName.trim()) {
      Alert.alert("Error", "Please enter a company name");
      return;
    }

    // Validate total
    const parsedTotal = parseSerbianNumber(values.total);
    if (parsedTotal === null || parsedTotal <= 0) {
      Alert.alert("Error", "Total must be greater than 0 RSD");
      return;
    }

    // Validate date format
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(values.date)) {
      Alert.alert("Error", "Please enter a valid date (DD.MM.YYYY)");
      return;
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(values.time)) {
      Alert.alert("Error", "Please enter a valid time (HH:MM)");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTime = parseToISO(values.date, values.time);
      await insertReceipt({
        companyName: values.companyName.trim(),
        total: parsedTotal,
        dateTime,
        verificationURL: null,
        rawData: "manual-entry",
      });
      router.replace("/receipts");
    } catch (error) {
      console.error("Failed to add receipt:", error);
      Alert.alert("Error", "Failed to add receipt. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ReceiptForm
        values={values}
        onValuesChange={setValues}
        onSubmit={handleSubmit}
        submitLabel="Add Receipt"
        isSubmitting={isSubmitting}
        editable={true}
      />
    </SafeAreaView>
  );
}
