#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// EcoVerse — Database Migration Runner
// Runs migration and seed SQL files against PostgreSQL
//
// Usage:
//   node src/db/migrate.mjs               # run migrations only
//   node src/db/migrate.mjs --seed        # run migrations + seeds
//   node src/db/migrate.mjs --reset       # drop & recreate (DEV ONLY)
// ─────────────────────────────────────────────────────────────
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load env from apps/web/.env.local
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../../.env.local") });

const { Pool } = pg;
const __dir = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS = [
  join(__dir, "migrations/001_location_schema.sql"),
];

const SEEDS = [
  join(__dir, "seeds/001_india_locations.sql"),
];

async function run() {
  const args = process.argv.slice(2);
  const doSeed = args.includes("--seed");
  const doReset = args.includes("--reset");

  if (!process.env.DATABASE_URL) {
    console.error("\n❌ DATABASE_URL is not set.\n   Set it in apps/web/.env.local:\n   DATABASE_URL=postgresql://user:pass@localhost:5432/ecoverse\n");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    if (doReset) {
      console.log("⚠️  RESET MODE — Dropping all EcoVerse tables...");
      await client.query(`
        DROP TABLE IF EXISTS escalation_log CASCADE;
        DROP TABLE IF EXISTS rescue_notifications CASCADE;
        DROP TABLE IF EXISTS rescue_cases CASCADE;
        DROP TABLE IF EXISTS user_locations CASCADE;
        DROP TABLE IF EXISTS ngos CASCADE;
        DROP TABLE IF EXISTS areas CASCADE;
        DROP TABLE IF EXISTS cities CASCADE;
        DROP TABLE IF EXISTS states CASCADE;
      `);
      console.log("   ✅ Tables dropped.\n");
    }

    console.log("🔄 Running migrations...");
    for (const file of MIGRATIONS) {
      const sql = readFileSync(file, "utf-8");
      await client.query(sql);
      console.log(`   ✅ ${basename(file)}`);
    }

    if (doSeed) {
      console.log("\n🌱 Running seeds...");
      for (const file of SEEDS) {
        const sql = readFileSync(file, "utf-8");
        await client.query(sql);
        console.log(`   ✅ ${basename(file)}`);
      }
    }

    // Summary
    const [stateCount, cityCount, areaCount] = await Promise.all([
      client.query("SELECT COUNT(*) FROM states"),
      client.query("SELECT COUNT(*) FROM cities"),
      client.query("SELECT COUNT(*) FROM areas"),
    ]);

    console.log("\n📊 Database Summary:");
    console.log(`   States: ${stateCount.rows[0].count}`);
    console.log(`   Cities: ${cityCount.rows[0].count}`);
    console.log(`   Areas:  ${areaCount.rows[0].count}`);
    console.log("\n✅ Done! EcoVerse location isolation database is ready.\n");

  } catch (err) {
    console.error("\n❌ Migration failed:", err.message, "\n");
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
