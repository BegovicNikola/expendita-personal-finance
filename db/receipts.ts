import { getDatabase } from "./schema";

export interface Receipt {
  id: number;
  companyName: string;
  total: number;
  dateTime: string;
  verificationURL: string | null;
  rawData: string;
}

export async function insertReceipt(
  receipt: Omit<Receipt, "id">,
): Promise<number> {
  const db = await getDatabase();

  const result = await db.runAsync(
    `INSERT INTO receipts (companyName, total, dateTime, verificationURL, rawData) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      receipt.companyName,
      receipt.total,
      receipt.dateTime,
      receipt.verificationURL,
      receipt.rawData,
    ],
  );

  return result.lastInsertRowId;
}

export async function getAllReceipts(): Promise<Receipt[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<Receipt>(
    `SELECT * FROM receipts ORDER BY dateTime DESC`,
  );

  return results;
}

export async function getReceiptById(id: number): Promise<Receipt | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<Receipt>(
    `SELECT * FROM receipts WHERE id = ?`,
    [id],
  );

  return result ?? null;
}

export async function updateReceipt(
  id: number,
  updates: Partial<Omit<Receipt, "id">>,
): Promise<void> {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.companyName !== undefined) {
    fields.push("companyName = ?");
    values.push(updates.companyName);
  }
  if (updates.total !== undefined) {
    fields.push("total = ?");
    values.push(updates.total);
  }
  if (updates.dateTime !== undefined) {
    fields.push("dateTime = ?");
    values.push(updates.dateTime);
  }
  if (updates.verificationURL !== undefined) {
    fields.push("verificationURL = ?");
    values.push(updates.verificationURL);
  }
  if (updates.rawData !== undefined) {
    fields.push("rawData = ?");
    values.push(updates.rawData);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(
    `UPDATE receipts SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
}

export async function deleteReceipt(id: number): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(`DELETE FROM receipts WHERE id = ?`, [id]);
}

// Clear all receipts from the database during development for a clean slate
export async function deleteAllReceipts(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM receipts`);
}
