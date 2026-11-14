// ============================================================
// Aary's IDE — Database Layer
// SQLite via better-sqlite3 for persistent storage
// ============================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';

let _db: Database.Database | null = null;

/**
 * Get or create the singleton database instance.
 */
export function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure the data directory exists
  const dbDir = path.dirname(config.databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  _db = new Database(config.databasePath);

  // Enable WAL mode for better concurrent performance
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('busy_timeout = 5000');

  initializeTables(_db);
  return _db;
}

/**
 * Create all required tables if they don't exist.
 */
function initializeTables(db: Database.Database): void {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      provider TEXT NOT NULL DEFAULT 'email',
      google_id TEXT,
      password_hash TEXT,
      settings TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      refresh_token TEXT,
      device_id TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

    -- Conversations table
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'New Conversation',
      messages TEXT DEFAULT '[]',
      project_id TEXT,
      device_id TEXT,
      summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);

    -- Memory table
    CREATE TABLE IF NOT EXISTS memory (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      project_id TEXT,
      task_id TEXT,
      device_id TEXT,
      source TEXT NOT NULL DEFAULT 'system',
      importance REAL NOT NULL DEFAULT 0.5,
      access_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_memory_user ON memory(user_id);
    CREATE INDEX IF NOT EXISTS idx_memory_category ON memory(category);
    CREATE INDEX IF NOT EXISTS idx_memory_project ON memory(project_id);

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT,
      title TEXT NOT NULL,
      original_request TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      priority TEXT NOT NULL DEFAULT 'normal',
      plan TEXT DEFAULT '{}',
      tool_history TEXT DEFAULT '[]',
      errors TEXT DEFAULT '[]',
      results TEXT DEFAULT '[]',
      artifacts TEXT DEFAULT '[]',
      device_id TEXT,
      workspace_id TEXT,
      project_id TEXT,
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      started_at TEXT,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

    -- AI Providers table
    CREATE TABLE IF NOT EXISTS ai_providers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      base_url TEXT,
      api_key_encrypted TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      models TEXT DEFAULT '[]',
      default_model_id TEXT,
      connected INTEGER NOT NULL DEFAULT 0,
      last_tested_at TEXT,
      error TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_providers_user ON ai_providers(user_id);

    -- Connections table
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      config_encrypted TEXT DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'disconnected',
      connected_at TEXT,
      error TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_connections_user ON connections(user_id);

    -- Workspaces table
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'local',
      path TEXT NOT NULL,
      device_id TEXT,
      git_url TEXT,
      language TEXT,
      framework TEXT,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces(user_id);

    -- Devices table
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      os TEXT NOT NULL,
      os_version TEXT,
      capabilities TEXT DEFAULT '[]',
      is_online INTEGER NOT NULL DEFAULT 0,
      last_seen_at TEXT,
      registered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);

    -- MCP Servers table
    CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      command TEXT,
      args TEXT DEFAULT '[]',
      url TEXT,
      transport TEXT NOT NULL DEFAULT 'stdio',
      env_encrypted TEXT DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1,
      tools TEXT DEFAULT '[]',
      resources TEXT DEFAULT '[]',
      error TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_mcp_user ON mcp_servers(user_id);

    -- Audit Log table
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT DEFAULT '{}',
      risk TEXT NOT NULL DEFAULT 'low',
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log(timestamp);

    -- Uploaded files table
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('[DB] Database initialized with all tables');
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Run a query that returns rows.
 */
export function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T[] {
  const db = getDb();
  return db.prepare(sql).all(...params) as T[];
}

/**
 * Run a query that returns a single row.
 */
export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T | undefined {
  const db = getDb();
  return db.prepare(sql).get(...params) as T | undefined;
}

/**
 * Run an INSERT/UPDATE/DELETE statement.
 */
export function execute(
  sql: string,
  params: unknown[] = []
): Database.RunResult {
  const db = getDb();
  return db.prepare(sql).run(...params);
}

/**
 * Run multiple statements in a transaction.
 */
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  return db.transaction(fn)();
}

/**
 * Close the database connection.
 */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
    console.log('[DB] Database connection closed');
  }
}
