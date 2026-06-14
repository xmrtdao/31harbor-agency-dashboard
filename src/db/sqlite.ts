import initSqlJs from 'sql.js';
import { seedData } from './seed';

// ─── Database Singleton ──────────────────────────────────────────────────────

let db: any = null;
let SQL: any = null;

export async function initDB(): Promise<void> {
  if (db) return;

  SQL = await initSqlJs({ locateFile: (file: string) => `/${file}` });

  // Try to load from localStorage
  const saved = localStorage.getItem('suiteai_db');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const uint8 = new Uint8Array(parsed);
      db = new SQL.Database(uint8);
      // Verify DB is valid by running a simple query
      db.exec("SELECT 1");
    } catch (e) {
      console.warn('[SuiteAI] Failed to load saved DB, creating fresh:', e);
      db = null;
    }
  }

  if (!db) {
    db = new SQL.Database();
    createSchema();
    seedData();
    saveDB();
  }
}

export function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

export function saveDB(): void {
  if (!db) return;
  try {
    const data = db.export();
    localStorage.setItem('suiteai_db', JSON.stringify(Array.from(data)));
  } catch (e) {
    console.warn('[SuiteAI] Failed to save DB to localStorage:', e);
  }
}

export function resetDB(): void {
  if (!db) return;
  db.close();
  db = null;
  localStorage.removeItem('suiteai_db');
}

// ─── Schema ──────────────────────────────────────────────────────────────────

function createSchema(): void {
  const database = getDB();

  // Companies
  database.run(`CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    color TEXT,
    domain TEXT,
    api_key_masked TEXT,
    active INTEGER DEFAULT 1,
    lead_score_threshold INTEGER DEFAULT 50,
    dns_verified INTEGER DEFAULT 0,
    created_at TEXT
  )`);

  // Leads
  database.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    intent TEXT,
    company_routed TEXT,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new',
    ai_confidence TEXT DEFAULT 'high',
    ai_reasoning TEXT,
    pipeline_stage TEXT DEFAULT 'scraping',
    value REAL DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`);

  // Lead Sharing Rules — CRITICAL FEATURE
  database.run(`CREATE TABLE IF NOT EXISTS lead_sharing_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_company TEXT NOT NULL,
    to_company TEXT NOT NULL,
    allowed INTEGER DEFAULT 1,
    created_at TEXT,
    UNIQUE(from_company, to_company)
  )`);

  // Campaigns
  database.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    status TEXT DEFAULT 'draft',
    budget REAL DEFAULT 0,
    spend REAL DEFAULT 0,
    revenue REAL DEFAULT 0,
    roi REAL DEFAULT 0,
    reach INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    platform TEXT,
    start_date TEXT,
    end_date TEXT
  )`);

  // Pipeline Stages config
  database.run(`CREATE TABLE IF NOT EXISTS pipeline_stages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    order_index INTEGER,
    requires_approval INTEGER DEFAULT 0,
    auto_advance INTEGER DEFAULT 0,
    timeout_hours INTEGER DEFAULT 48
  )`);

  // Activity Log
  database.run(`CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    company TEXT,
    description TEXT,
    metadata TEXT,
    created_at TEXT
  )`);

  // Users
  database.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    role TEXT,
    companies TEXT,
    status TEXT DEFAULT 'active',
    last_active TEXT
  )`);
}

// ─── Seed Data is in seed.ts ─────────────────────────────────────────────────
