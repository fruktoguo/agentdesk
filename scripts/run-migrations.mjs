import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const migrationsDir =
  process.env.MIGRATIONS_DIR ?? path.join(process.cwd(), "prisma", "migrations");
const connectRetries = Number.parseInt(process.env.DB_CONNECT_RETRIES ?? "30", 10);
const connectRetryDelayMs = Number.parseInt(
  process.env.DB_CONNECT_RETRY_DELAY_MS ?? "1000",
  10,
);

function checksum(sql) {
  return createHash("sha256").update(sql).digest("hex");
}

async function listMigrations() {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const migrations = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const migrationName = entry.name;
    const file = path.join(migrationsDir, migrationName, "migration.sql");
    const sql = await readFile(file, "utf8");
    migrations.push({
      migrationName,
      sql,
      checksum: checksum(sql),
    });
  }
  return migrations.sort((a, b) =>
    a.migrationName.localeCompare(b.migrationName),
  );
}

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);
}

async function loadAppliedMigrations(client) {
  const result = await client.query(`
    SELECT "migration_name", "checksum", "finished_at", "rolled_back_at", "logs"
    FROM "_prisma_migrations"
    ORDER BY "started_at" ASC
  `);
  const applied = new Map();
  for (const row of result.rows) {
    applied.set(row.migration_name, row);
  }
  return applied;
}

async function applyMigration(client, migration) {
  const id = randomUUID();
  await client.query(
    `
      INSERT INTO "_prisma_migrations"
        ("id", "checksum", "migration_name", "started_at", "applied_steps_count")
      VALUES ($1, $2, $3, now(), 0)
    `,
    [id, migration.checksum, migration.migrationName],
  );

  try {
    await client.query("BEGIN");
    await client.query(migration.sql);
    await client.query(
      `
        UPDATE "_prisma_migrations"
        SET "finished_at" = now(), "applied_steps_count" = 1
        WHERE "id" = $1
      `,
      [id],
    );
    await client.query("COMMIT");
    console.log(`Applied migration ${migration.migrationName}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    await client.query(
      `
        UPDATE "_prisma_migrations"
        SET "logs" = $2
        WHERE "id" = $1
      `,
      [id, error instanceof Error ? error.stack ?? error.message : String(error)],
    );
    throw error;
  }
}

async function main() {
  const client = await connectWithRetry();
  try {
    await ensureMigrationTable(client);
    const applied = await loadAppliedMigrations(client);
    const migrations = await listMigrations();

    for (const migration of migrations) {
      const existing = applied.get(migration.migrationName);
      if (existing) {
        if (!existing.finished_at || existing.rolled_back_at) {
          throw new Error(
            `Migration ${migration.migrationName} is not in a finished state`,
          );
        }
        if (existing.checksum !== migration.checksum) {
          throw new Error(
            `Checksum mismatch for applied migration ${migration.migrationName}`,
          );
        }
        console.log(`Skipping applied migration ${migration.migrationName}`);
        continue;
      }

      await applyMigration(client, migration);
    }
  } finally {
    await client.end();
  }
}

async function connectWithRetry() {
  let lastError;
  for (let attempt = 1; attempt <= connectRetries; attempt += 1) {
    const client = new Client({ connectionString: databaseUrl });
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => {});
      const message = error instanceof Error ? error.message : String(error);
      console.log(
        `Database is not ready (${attempt}/${connectRetries}): ${message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, connectRetryDelayMs));
    }
  }
  throw lastError;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
