export type QRType = "nbs-ips" | "suf-purs" | "unknown";

export interface ParsedReceipt {
  companyName: string;
  total: number;
  dateTime: string;
  verificationURL: string | null;
  rawData: string;
}

/**
 * Detect QR code type based on content
 */
export function detectQRType(data: string): QRType {
  if (data.startsWith("K:PR|")) {
    return "nbs-ips";
  }
  if (data.startsWith("https://suf.purs.gov.rs")) {
    return "suf-purs";
  }
  return "unknown";
}

/**
 * Parse NBS IPS QR code format
 * Format: K:PR|V:01|C:1|R:200220618010100048|N:JKP INFOSTAN TEHNOLOGIJE|I:RSD4142,74|SF:122|S:OBJEDINJENA NAPLATA|RO:11800577342080-25127-1
 *
 * Field mapping:
 * - K: Type (PR = payment request)
 * - V: Version
 * - C: ?
 * - R: Reference number
 * - N: Name (company name)
 * - I: Amount with currency (e.g., "RSD4142,74")
 * - SF: ?
 * - S: Service description
 * - RO: Additional reference
 */
export function parseNbsIps(data: string): ParsedReceipt {
  const fields: Record<string, string> = Object.fromEntries(
    data.split("|").map((pair) => {
      const [key, ...rest] = pair.split(":");
      return [key, rest.join(":")];
    })
  );

  // Extract company name from N field
  const companyName = fields.N || "Unknown";

  // Parse amount from I field: "RSD4142,74" -> 4142.74
  // Serbian format uses . as thousand separator and , as decimal separator
  const amountMatch = fields.I?.match(/RSD([\d.,]+)/);
  const total = amountMatch
    ? parseFloat(amountMatch[1].replace(/\./g, "").replace(",", "."))
    : 0;

  // Use current timestamp since NBS IPS doesn't include datetime
  const dateTime = new Date().toISOString();

  return {
    companyName,
    total,
    dateTime,
    verificationURL: null,
    rawData: data,
  };
}

/**
 * Parse SUF/PURS scraped data into receipt format
 */
export function parseSufPurs(
  scrapedData: { companyName: string; total: number; dateTime: string },
  url: string,
  rawData: string
): ParsedReceipt {
  return {
    companyName: "", // TODO: extract from scrapedData.companyName
    total: 0, // TODO: extract from scrapedData.total
    dateTime: "", // TODO: extract from scrapedData.dateTime
    verificationURL: url,
    rawData: rawData,
  };
}
