import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import fs from "fs";
import path from "path";
import { config } from "../config";

let sql: SqlJsStatic | null = null;
let db: Database | null = null;
let saveInterval: NodeJS.Timeout | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sql) {
    sql = await initSqlJs();
  }
  return sql;
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await getSqlJs();
  const dbPath = path.resolve(config.DB_PATH);

  // Load existing DB from file, or create new
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log("[DB] Loaded existing database from:", dbPath);
  } else {
    db = new SQL.Database();
    console.log("[DB] Created new database at:", dbPath);
  }

  migrateLegacyTransactionConstraint(db);
  initSchema(db);

  // Persist to file every 10 seconds
  saveInterval = setInterval(() => saveDb(), 10_000);

  return db;
}

function migrateLegacyTransactionConstraint(database: Database): void {
  const table = database.exec(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'transactions'"
  );
  const createSql = String(table[0]?.values[0]?.[0] || "");
  if (!/tx_hash\s+TEXT\s+NOT\s+NULL\s+UNIQUE/i.test(createSql)) return;

  database.run(`
    BEGIN;
    ALTER TABLE transactions RENAME TO transactions_legacy;
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      amount TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      block_number INTEGER,
      log_index INTEGER,
      created_at INTEGER NOT NULL
    );
    INSERT OR IGNORE INTO transactions
      (id, sender, recipient, amount, tx_hash, block_number, log_index, created_at)
      SELECT id, sender, recipient, amount, tx_hash, block_number, log_index, created_at
      FROM transactions_legacy;
    DROP TABLE transactions_legacy;
    COMMIT;
  `);
  console.log("[DB] Migrated transaction uniqueness to (tx_hash, log_index)");
}

function initSchema(db: Database): void {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.run(schema);
  console.log("[DB] Schema initialized");
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = path.resolve(config.DB_PATH);
  fs.writeFileSync(dbPath, buffer);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TransactionRow {
  id: number;
  sender: string;
  recipient: string;
  amount: string;
  tx_hash: string;
  block_number: number | null;
  log_index: number | null;
  created_at: number;
}

// ─── Query helpers ────────────────────────────────────────────────────────────
export function insertTransaction(
  db: Database,
  tx: Omit<TransactionRow, "id">
): boolean {
  try {
    db.run(
      `INSERT OR IGNORE INTO transactions
        (sender, recipient, amount, tx_hash, block_number, log_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tx.sender, tx.recipient, tx.amount, tx.tx_hash, tx.block_number, tx.log_index, tx.created_at]
    );
    return db.getRowsModified() > 0;
  } catch {
    return false;
  }
}

export function closeDb(): void {
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

export function getTransactionsByAddress(db: Database, address: string): TransactionRow[] {
  const addr = address.toLowerCase();
  const result = db.exec(
    `SELECT * FROM transactions
     WHERE LOWER(sender) = ? OR LOWER(recipient) = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [addr, addr]
  );

  if (!result.length || !result[0].values.length) return [];

  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj as unknown as TransactionRow;
  });
}

export function getLastBlock(db: Database): number {
  const result = db.exec("SELECT last_block FROM indexer_state WHERE id = 1");
  if (!result.length || !result[0].values.length) return 0;
  return Number(result[0].values[0][0]) || 0;
}

export function updateLastBlock(db: Database, blockNumber: number): void {
  db.run(
    "UPDATE indexer_state SET last_block = ?, last_updated_at = ? WHERE id = 1",
    [blockNumber, Math.floor(Date.now() / 1000)]
  );
}
