import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Singleton better-sqlite3 connection. In development the connection is
// cached on globalThis so Next's hot reload does not reopen the database.

type Db = Database.Database;

interface SplitlyGlobal {
  __splitlyDb?: Db;
}

const globalRef = globalThis as unknown as SplitlyGlobal;

function resolveDbPath(): string {
  const envPath = process.env.SPLITLY_DB_PATH;
  const target = envPath && envPath.length > 0 ? envPath : "./data/splitly.db";
  const absolute = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
  const dir = path.dirname(absolute);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return absolute;
}

function createConnection(): Db {
  const db = new Database(resolveDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      currency TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      paid_by TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);

    CREATE TABLE IF NOT EXISTS expense_shares (
      expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      PRIMARY KEY (expense_id, member_id)
    );
  `);
  return db;
}

export function getDb(): Db {
  if (process.env.NODE_ENV === "production") {
    if (!globalRef.__splitlyDb) {
      globalRef.__splitlyDb = createConnection();
    }
    return globalRef.__splitlyDb;
  }
  if (!globalRef.__splitlyDb) {
    globalRef.__splitlyDb = createConnection();
  }
  return globalRef.__splitlyDb;
}
