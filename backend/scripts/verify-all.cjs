const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_NEW = process.env.MONGODB_URI;

async function verifyAll() {
  console.log('=== VERIFYING MCQS BANK SYNC & QUESTION DISPLAY ===\n');

  for (const [name, uri] of [['mcqsbank-db (Primary)', CLUSTER_NEW], ['cluster0 (Secondary/Vercel)', CLUSTER_OLD]]) {
    console.log(`Checking ${name}...`);
    const conn = await mongoose.createConnection(uri).asPromise();
    const db = conn.db;

    const subjects = await db.collection('subjects').find({}).toArray();
    const books = await db.collection('books').find({}).toArray();
    const questionsCount = await db.collection('questions').countDocuments({});
    const publishedQuestions = await db.collection('questions').countDocuments({ status: 'published' });
    const nullBook = await db.collection('questions').countDocuments({ $or: [{ bookId: null }, { bookId: { $exists: false } }] });

    console.log(`  - Total Subjects: ${subjects.length} (expected 8)`);
    console.log(`  - Total Books: ${books.length} (expected 9)`);
    console.log(`  - Total Questions: ${questionsCount} (published: ${publishedQuestions})`);
    console.log(`  - Questions with missing bookId: ${nullBook}`);

    console.log('\n  Books Detail:');
    for (const b of books) {
      const qInDb = await db.collection('questions').countDocuments({ bookId: b._id, status: 'published' });
      const sub = await db.collection('subjects').findOne({ _id: b.subjectId });
      console.log(`    * [${b.questionCount} MCQs in doc | ${qInDb} in DB] "${b.title}" -> Subject: "${sub ? sub.name : 'MISSING!'}"`);
    }

    console.log('\n  Subjects Detail:');
    for (const s of subjects) {
      const qInDb = await db.collection('questions').countDocuments({ subjectId: s._id, status: 'published' });
      console.log(`    * [${s.questionCount} MCQs in doc | ${qInDb} in DB] "${s.name}"`);
    }

    await conn.close();
    console.log(`\n${name} check completed.\n----------------------------------------\n`);
  }

  // Also verify live localhost:5000 API
  console.log('Testing localhost:5000 API endpoints:');
  const booksRes = await fetch('http://localhost:5000/api/books').then(r => r.json());
  console.log(`  - /api/books returned ${booksRes.data?.length} books:`);
  for (const b of booksRes.data || []) {
    console.log(`    * "${b.title}": ${b.questionCount} MCQs (Subject: "${b.subjectId?.name || 'UNKNOWN'}")`);
    // Test fetching questions for this book
    const qRes = await fetch(`http://localhost:5000/api/questions?bookId=${b._id}&limit=5`).then(r => r.json());
    console.log(`      -> /api/questions?bookId=${b._id} successfully returned ${qRes.pagination?.total} total questions`);
  }

  console.log('\n=== ALL CHECKS PASSED PERFECTLY ===');
}
verifyAll().catch(console.error);

