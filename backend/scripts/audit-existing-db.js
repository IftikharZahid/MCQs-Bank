import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Fix for Windows / ISP DNS resolvers failing on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore
}

async function runAudit() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is missing in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('=== MONGODB ATLAS / LOCAL AUDIT REPORT ===');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    const sample = await db.collection(col.name).findOne({});
    console.log(`\nCollection: ${col.name} (Total Documents: ${count})`);
    if (sample) console.log('Sample Keys:', Object.keys(sample).join(', '));
  }
  await mongoose.disconnect();
}
runAudit().catch(console.error);
