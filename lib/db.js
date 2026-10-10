import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "belajar_nulis.db");
  const db = new Database(dbPath);

  // Performance & safety settings
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      language TEXT NOT NULL DEFAULT 'id',
      word_count INTEGER NOT NULL DEFAULT 0,
      ai_reviewed INTEGER NOT NULL DEFAULT 0,
      ai_reviewed_at TEXT,
      ai_review_data TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_entries_user_created 
    ON entries (user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS daily_ai_usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date_key TEXT NOT NULL,
      reviewed_at TEXT,
      entry_id TEXT,
      model TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  dbInstance = db;
  return dbInstance;
}

export default getDb;
