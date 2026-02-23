const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || "./data/app.db";
const absoluteDbPath = path.resolve(process.cwd(), dbPath);

fs.mkdirSync(path.dirname(absoluteDbPath), { recursive: true });

const db = new Database(absoluteDbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'FREE',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// If users table existed before without plan, add it (safe)
try {
  db.exec(`ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'FREE';`);
} catch (e) {
  // ignore if column already exists
}

module.exports = db;
