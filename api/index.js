import app, { connectDB } from '../backend/src/server.js';

export default async function handler(req, res) {
  // Normalize req.url so Express router always matches whether Vercel rewrote it or not
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-original-url'] || req.headers['x-forwarded-uri'];
  if (matchedPath && (req.url === '/api/index.js' || req.url === '/api' || req.url === '/api/')) {
    const queryIdx = req.url.indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.substring(queryIdx) : '';
    req.url = matchedPath + (matchedPath.includes('?') ? '' : queryString);
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('Vercel serverless pre-flight DB connect error:', err.message);
  }
  return app(req, res);
}
