import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const vpSub = new mongoose.Types.ObjectId('6ad2e9faf4302e6a145fd6f3');
  const vpBook = new mongoose.Types.ObjectId('6ad2f5eee1dac5c428c6d8ef');

  const subject = await db.collection('subjects').findOne({ _id: vpSub });
  console.log('Subject Details:');
  console.log(`- Name: ${subject.name}`);
  console.log(`- Slug: ${subject.slug}`);
  console.log(`- Code: ${subject.code}`);
  console.log(`- Program: ${subject.programOrClass}`);
  console.log(`- Semester: ${subject.semester}`);
  console.log(`- Status: ${subject.status}`);

  const book = await db.collection('books').findOne({ _id: vpBook });
  console.log('\nBook Details:');
  console.log(`- Title: ${book.title}`);
  console.log(`- Author: ${book.author}`);
  console.log(`- Edition: ${book.edition}`);
  console.log(`- Chapters count: ${book.chapters.length}`);
  console.log(`- Sample Chapter: ${book.chapters[0]?.title}`);

  const totalQuestions = await db.collection('questions').countDocuments({ subjectId: vpSub, bookId: vpBook });
  console.log(`\nTotal Questions attached: ${totalQuestions} / 504`);

  const sample = await db.collection('questions').find({ subjectId: vpSub }).sort({ _id: 1 }).limit(2).toArray();
  console.log('\nSample Question 1:');
  console.log(`Q: ${sample[0].question}`);
  console.log(`Options:`, sample[0].options);
  console.log(`Correct Answer: ${sample[0].correctAnswer} -> "${sample[0].options[sample[0].correctAnswer]}"`);
  console.log(`Chapter: ${sample[0].chapter}`);
  console.log(`Week: ${sample[0].week}`);
  console.log(`Topic: ${sample[0].topic}`);
  console.log(`Explanation: ${sample[0].explanation}`);

  // Check for any corrupted records
  const invalidOptions = await db.collection('questions').find({
    subjectId: vpSub,
    $or: [
      { 'options.3': { $exists: false } },
      { 'options.0': '[object Object]' },
      { correctAnswer: { $nin: [0, 1, 2, 3] } }
    ]
  }).toArray();
  console.log(`\nIntegrity Check - Invalid Questions: ${invalidOptions.length} (Must be 0)`);

  await mongoose.disconnect();
}

verify().catch(console.error);

