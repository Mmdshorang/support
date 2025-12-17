import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend root directory only in development
// In production, use system environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

// Import database after env is loaded
import pool from "./config/database.js";

// Create Express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
<<<<<<< HEAD
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: false
}));
=======
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
>>>>>>> 61cb24291c7d1a68ba5007ef3eba27f5437fcdc2

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Database connected at:", res.rows[0].now);
  }
});

// Health check routes
<<<<<<< HEAD
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
=======
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
>>>>>>> 61cb24291c7d1a68ba5007ef3eba27f5437fcdc2
});

// Database health check endpoint
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() as time, version() as version"
    );
    res.status(200).json({
      success: true,
      message: "Database is connected",
      data: {
        time: result.rows[0].time,
        version:
          result.rows[0].version.split(" ")[0] +
          " " +
          result.rows[0].version.split(" ")[1],
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      code: error.code,
    });
  }
});

// Environment variables check endpoint (for debugging)
app.get("/api/health/env", (req, res) => {
  res.status(200).json({
    success: true,
    env: {
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
      DB_HOST: process.env.DB_HOST || "NOT SET",
      DB_PORT: process.env.DB_PORT || "NOT SET",
      DB_NAME: process.env.DB_NAME || "NOT SET",
      DB_USER: process.env.DB_USER || "NOT SET",
      DB_PASSWORD: process.env.DB_PASSWORD ? "***SET***" : "NOT SET",
      PORT: process.env.PORT || "NOT SET",
    },
  });
});

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 2400;

<<<<<<< HEAD
// **Change here: listen on 0.0.0.0**
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API Base: http://0.0.0.0:${PORT}/api`);
});

process.on('unhandledRejection', (err) => {
=======
const server = app.listen(PORT, () => {
  console.log("═══════════════════════════════════════════");
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log("═══════════════════════════════════════════");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
>>>>>>> 61cb24291c7d1a68ba5007ef3eba27f5437fcdc2
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

<<<<<<< HEAD
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server gracefully');
  server.close(() => {
=======
// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, closing server gracefully");
  server.close(() => {
    console.log("✅ Server closed");
>>>>>>> 61cb24291c7d1a68ba5007ef3eba27f5437fcdc2
    pool.end();
    process.exit(0);
  });
});

export default app;
