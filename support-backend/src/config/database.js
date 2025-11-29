import pg from "pg";

const { Pool } = pg;

// Database configuration - hardcoded values
const dbConfig = {
  host: process.env.DB_HOST || "monte-rosa.liara.cloud",
  port: parseInt(process.env.DB_PORT || "32687"),
  database: process.env.DB_NAME || "support_db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "2h6K66YCuPggSqCWe1Guzmkn",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for remote connections
};

// Log database config (without password)
console.log("📊 Database Config:", {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password ? "***" : "NOT SET",
});

const pool = new Pool(dbConfig);

// Test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connection test successful");
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    console.error("   Config:", {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });
  }
})();

// Test database connection
pool.on("connect", () => {
  console.log("✅ New client connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  // Don't exit in production, let the app handle it
  if (process.env.NODE_ENV !== "production") {
    process.exit(-1);
  }
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("✅ Executed query", {
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      duration,
      rows: res.rowCount,
    });
    return res;
  } catch (error) {
    console.error("❌ Query error details:", {
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      errorMessage: error.message,
      errorCode: error.code,
      errorName: error.name,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
    });
    throw error;
  }
};

// Get a client from the pool
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    // Clear timeout
    clearTimeout(timeout);
    // Set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export default pool;
