import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatTotalInput } from "@/lib/number-utils";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface ReceiptFormValues {
  companyName: string;
  total: string;
  date: string;
  time: string;
}

interface ReceiptFormProps {
  values: ReceiptFormValues;
  onValuesChange: (values: ReceiptFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  editable?: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
}

export function ReceiptForm({
  values,
  onValuesChange,
  onSubmit,
  submitLabel,
  isSubmitting,
  editable = true,
  showDelete = false,
  onDelete,
}: ReceiptFormProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const updateField = <K extends keyof ReceiptFormValues>(
    field: K,
    value: ReceiptFormValues[K]
  ) => {
    onValuesChange({ ...values, [field]: value });
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: editable
        ? colorScheme === "dark"
          ? "#1E2022"
          : "#fff"
        : colorScheme === "dark"
          ? "#151718"
          : "#F9FAFB",
      borderColor: colorScheme === "dark" ? "#2A2E31" : "#E5E7EB",
      color: colors.text,
    },
  ];

  return (
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
              value={values.companyName}
              onChangeText={(text) => updateField("companyName", text)}
              placeholder="Enter company name"
              placeholderTextColor={colors.icon}
              editable={editable}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.icon }]}>
              Total (RSD)
            </Text>
            <TextInput
              style={inputStyle}
              value={values.total}
              onChangeText={(text) =>
                updateField("total", formatTotalInput(text, values.total))
              }
              placeholder="1.234,56"
              placeholderTextColor={colors.icon}
              keyboardType="decimal-pad"
              editable={editable}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={[styles.label, { color: colors.icon }]}>Date</Text>
              <TextInput
                style={inputStyle}
                value={values.date}
                onChangeText={(text) => updateField("date", text)}
                placeholder="DD.MM.YYYY"
                placeholderTextColor={colors.icon}
                editable={editable}
              />
            </View>

            <View style={styles.rowGap} />

            <View style={[styles.field, styles.flex1]}>
              <Text style={[styles.label, { color: colors.icon }]}>Time</Text>
              <TextInput
                style={inputStyle}
                value={values.time}
                onChangeText={(text) => updateField("time", text)}
                placeholder="HH:MM"
                placeholderTextColor={colors.icon}
                editable={editable}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Text
            style={[
              styles.actionButton,
              {
                backgroundColor: editable
                  ? "#0a7ea4"
                  : colorScheme === "dark"
                    ? "#2A2E31"
                    : "#E5E7EB",
                color: editable ? "#fff" : colors.text,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
            onPress={isSubmitting ? undefined : onSubmit}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Text>
          {showDelete && onDelete && (
            <Text
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              Delete
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
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
    gap: 12,
  },
  actionButton: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    padding: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    color: "#fff",
  },
});
