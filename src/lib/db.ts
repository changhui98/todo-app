import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "todos.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }
  return db;
}
