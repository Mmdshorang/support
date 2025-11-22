import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || "damavand.liara.cloud",
    port: parseInt(process.env.DB_PORT || "32884"),
    database: process.env.DB_NAME || "support_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "81lW3Mnd1PHTwdZPH7HWUaVT",
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("ℹ️  No migration files found.");
    }

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      console.log(`📝 Running migration: ${file}`);
      await client.query(migrationSQL);
      console.log(`✅ Migration ${file} applied successfully`);
    }

    console.log("🎉 All migrations completed successfully!");

    await client.end();
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    if (client._connected) {
      await client.end();
    }
    process.exit(1);
  }
}

runMigration();
