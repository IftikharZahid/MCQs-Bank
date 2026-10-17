import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dns from 'dns';
import apiRoutes from './routes/api.js';

dotenv.config();

// Fix for Windows / ISP DNS resolvers failing on MongoDB Atlas SRV records (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server override failed, continuing with system DNS:', dnsErr.message);
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

// Database connection helper with connection reuse for serverless / fluid compute
let isConnecting = false;
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (isConnecting) return;
  isConnecting = true;
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.warn('MONGODB_URI is not defined in environment variables.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  } finally {
    isConnecting = false;
  }
}

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
    await connectDB();
  }
  next();
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL_ENV);

if (!isVercel) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Question Bank API Server running on http://localhost:${PORT}`));
  });
} else {
  // In Vercel environment, initiate connection eagerly on cold start
  connectDB().catch(err => console.error('Cold-start DB connection error:', err.message));
}

export default app;
