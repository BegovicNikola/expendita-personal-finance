/**
 * Parse a Date object into local date and time strings.
 * @returns { date: "DD.MM.YYYY", time: "HH:MM" }
 */
export function formatDateParts(dateObj: Date): { date: string; time: string } {
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return {
    date: `${day}.${month}.${year}`,
    time: `${hours}:${minutes}`,
  };
}

/**
 * Format ISO date string to readable format (e.g., "22.01.2026, 14:30")
 */
export function formatDateTime(isoString: string): string {
  const { date, time } = formatDateParts(new Date(isoString));
  return `${date}, ${time}`;
}

/**
 * Parse DD.MM.YYYY date and HH:MM time to ISO string.
 */
export function parseToISO(date: string, time: string): string {
  const [day, month, year] = date.split(".");
  return new Date(`${year}-${month}-${day}T${time}`).toISOString();
}
