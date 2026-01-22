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
  await database.execAsync(CREATE_RECEIPTS_TABLE);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
