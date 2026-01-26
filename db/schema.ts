import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "expendita.db";

// Receipt table schema
const CREATE_RECEIPTS_TABLE = `
  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyName TEXT NOT NULL,
    total REAL NOT NULL,
    dateTime TEXT NOT NULL,
    verificationURL TEXT,
    rawData TEXT NOT NULL
  );
`;

// Receipt items table schema
const CREATE_RECEIPT_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS receipt_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiptId INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    totalPrice REAL NOT NULL,
    FOREIGN KEY (receiptId) REFERENCES receipts(id) ON DELETE CASCADE
  );
`;

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(
  database: SQLite.SQLiteDatabase,
): Promise<void> {
  // Enable foreign key constraints
  await database.execAsync("PRAGMA foreign_keys = ON;");
  await database.execAsync(CREATE_RECEIPTS_TABLE);
  await database.execAsync(CREATE_RECEIPT_ITEMS_TABLE);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
