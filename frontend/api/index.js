import app, { connectDB } from '../backend/src/server.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Vercel serverless DB connect error:', err.message);
  }
  return app(req, res);
}
