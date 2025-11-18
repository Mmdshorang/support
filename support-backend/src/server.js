import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import pool from './config/database.js';

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: false
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Health check routes
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 2400;

// **Change here: listen on 0.0.0.0**
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API Base: http://0.0.0.0:${PORT}/api`);
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server gracefully');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});

export default app;
