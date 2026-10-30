import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dns from 'dns';
import apiRoutes from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Fix for Windows / ISP DNS resolvers failing on MongoDB Atlas SRV records (querySrv ECONNREFUSED)
// Only apply on local Windows, NEVER in Vercel / Linux containers
if (process.platform === 'win32' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    console.warn('DNS server override failed, continuing with system DNS:', dnsErr.message);
  }
}

const app = express();
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(cookieParser());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

// Database connection helper with global connection reuse for Serverless (Vercel & AWS Lambda)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'mcq_question_bank',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('Connected to MongoDB Atlas');
      return m;
    }).catch(err => {
      cached.promise = null;
      console.error('MongoDB Atlas connection error:', err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Ensure DB is connected before handling requests (bypass for status/health checks)
app.use(async (req, res, next) => {
  if (req.path === '/api/status' || req.path === '/status' || req.path === '/health') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection middleware error:', err.message);
    return res.status(503).json({
      success: false,
      message: 'MongoDB connection failed. Please ensure current IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).',
      error: err.message
    });
  }
});

// Dual mounting to ensure both /api/* and /* resolve correctly on Vercel rewrites
app.use('/api', apiRoutes);
app.use(apiRoutes);

const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL_ENV);
const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase());

if (isDirectRun && !isVercel) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Question Bank API Server running on http://localhost:${PORT}`));
  }).catch(err => {
    console.error('Initial DB connection failure:', err.message);
    app.listen(PORT, () => console.log(`Question Bank API Server running (degraded DB) on http://localhost:${PORT}`));
  });
} else {
  // In Vercel serverless environment, initiate connection eagerly on cold start
  connectDB().catch(err => console.error('Cold-start DB connection error:', err.message));
}

export default app;
