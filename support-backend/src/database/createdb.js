import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function createDatabase() {
  // Connect to default postgres database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    const dbName = process.env.DB_NAME || 'support_db';

    // Check if database exists
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    } else {
      // Create database
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    }

    await client.end();
    console.log('🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client._connected) {
      await client.end();
    }
    process.exit(1);
  }
}

createDatabase();
