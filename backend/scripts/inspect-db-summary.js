import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';

dotenv.config({ path: 'backend/.env' });
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const subjects = await db.collection('subjects').find({}).toArray();
  const books = await db.collection('books').find({}).toArray();
  console.log('=== SUBJECTS ===');
  for (const s of subjects) {
    const qCount = await db.collection('questions').countDocuments({
      $or: [{ subjectId: s._id }, { subject: s.name }]
    });
    console.log(`${s._id} | ${s.name} | Questions: ${qCount}`);
  }
  console.log('\n=== BOOKS ===');
  for (const b of books) {
    const qCount = await db.collection('questions').countDocuments({ bookId: b._id });
    console.log(`${b._id} | ${b.title} | SubjectId: ${b.subjectId} | Questions: ${qCount}`);
  }
  const totalQuestions = await db.collection('questions').countDocuments();
  console.log('\nTotal Questions in DB:', totalQuestions);
  const orphaned = await db.collection('questions').countDocuments({
    subjectId: { $exists: false }
  });
  console.log('Orphaned Questions (no subjectId):', orphaned);
  await mongoose.disconnect();
}
check().catch(console.error);

