import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dns from 'dns';
import apiRoutes from './routes/api.js';
import { fileURLToPath } from 'url';

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
app.use(helmet());

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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

// Database connection helper with connection reuse for serverless / fluid compute
let isConnecting = false;
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (isConnecting) return;
  isConnecting = true;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  } finally {
    isConnecting = false;
  }
}

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  next();
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL_ENV);
const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase());

if (isDirectRun && !isVercel) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Question Bank API Server running on http://localhost:${PORT}`));
  });
} else {
  // In Vercel serverless environment, initiate connection eagerly on cold start
  connectDB().catch(err => console.error('Cold-start DB connection error:', err.message));
}

export default app;
