const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Allow DB path to be overridden by environment variable (used in Docker / CI)
const DB_PATH = process.env.DB_PATH
    || path.join(__dirname, '..', '..', 'data', 'cuecare.db');

// Ensure the data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT    NOT NULL,
    last_name     TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    phone         TEXT    NOT NULL,
    date_of_birth TEXT    NOT NULL,
    gender        TEXT    NOT NULL,
    address       TEXT,
    registered_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
