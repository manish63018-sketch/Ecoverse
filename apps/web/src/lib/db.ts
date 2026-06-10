// ─────────────────────────────────────────────────────────────
// EcoVerse — PostgreSQL Connection Pool
// Singleton pattern for Next.js (avoids connection exhaustion)
// ─────────────────────────────────────────────────────────────
import { Pool } from 'pg';

declare global {
  // Prevent multiple pool instances in Next.js hot-reload dev mode
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[EcoVerse DB] DATABASE_URL is not set. PostgreSQL features will not work. ' +
    'Copy .env.example to apps/web/.env.local and set DATABASE_URL.'
  );
}

function createPool(): Pool {
  return new Pool({
    connectionString,
    max: 10,               // max pool connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  });
}

// In development, reuse the pool across hot-reloads
const pool: Pool =
  process.env.NODE_ENV === 'development'
    ? (global.__pgPool ?? (global.__pgPool = createPool()))
    : createPool();

export default pool;

// Helper: typed query with automatic error logging
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  if (!connectionString) {
    console.error('[EcoVerse DB] Attempted DB query but DATABASE_URL is not configured.');
    return [];
  }
  const result = await pool.query(sql, params);
  return result.rows as T[];
}
