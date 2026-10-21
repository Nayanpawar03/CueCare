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

// Appointment scheduling schema
db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    specialty   TEXT NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1
                CHECK (is_active IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS appointment_slots (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id        INTEGER NOT NULL
                     REFERENCES doctors(id) ON DELETE RESTRICT,
    appointment_date TEXT NOT NULL,
    start_time       TEXT NOT NULL,
    end_time         TEXT NOT NULL,
    UNIQUE (doctor_id, appointment_date, start_time),
    CHECK (end_time > start_time)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id  INTEGER NOT NULL
                REFERENCES patients(id) ON DELETE RESTRICT,
    slot_id     INTEGER NOT NULL
                REFERENCES appointment_slots(id) ON DELETE RESTRICT,
    status      TEXT NOT NULL DEFAULT 'REQUESTED'
                CHECK (status IN ('REQUESTED', 'CONFIRMED', 'CANCELLED')),
    reason      TEXT,
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_active_appointments_per_slot
    ON appointments(slot_id)
    WHERE status IN ('REQUESTED', 'CONFIRMED');

  CREATE INDEX IF NOT EXISTS idx_appointments_patient
    ON appointments(patient_id);
`);

module.exports = db;
