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
    host: process.env.DB_HOST || "monte-rosa.liara.cloud",
    port: parseInt(process.env.DB_PORT || "32687"),
    database: process.env.DB_NAME || "support_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "2h6K66YCuPggSqCWe1Guzmkn",
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Check if base schema exists (check for users table)
    const schemaCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const schemaExists = schemaCheck.rows[0].exists;

    if (!schemaExists) {
      console.log("📋 Base schema not found. Creating base schema first...");
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSQL = fs.readFileSync(schemaPath, "utf8");
      await client.query(schemaSQL);
      console.log("✅ Base schema created successfully");
    } else {
      console.log("ℹ️  Base schema already exists, skipping schema creation");
    }

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
