import { getDatabase } from "./schema";

export interface Receipt {
  id?: number;
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

export async function deleteReceipt(id: number): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(`DELETE FROM receipts WHERE id = ?`, [id]);
}

// Clear all receipts from the database during development for a clean slate
export async function deleteAllReceipts(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM receipts`);
}
