/**
 * Format number as Serbian format (e.g., 1234.56 -> "1.234,56")
 */
export function formatSerbianNumber(value: number): string {
  return value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse Serbian formatted string to number (e.g., "1.234,56" -> 1234.56)
 */
export function parseSerbianNumber(value: string): number | null {
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
export function formatTotalInput(text: string, previousValue: string): string {
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
