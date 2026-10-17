import dns from 'dns';
import mongoose from 'mongoose';
import Book from '../src/models/Book.js';
import Subject from '../src/models/Subject.js';
import Question from '../src/models/Question.js';

if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const URI = 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

async function check() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(URI, {
    dbName: 'mcq_question_bank',
    serverSelectionTimeoutMS: 8000
  });
  console.log('Successfully connected to MongoDB Atlas!');

  const [subCount, bookCount, qCount] = await Promise.all([
    Subject.countDocuments(),
    Book.countDocuments(),
    Question.countDocuments()
  ]);

  console.log('--- STATS IN MONGODB ATLAS ---');
  console.log('Subjects in Atlas:', subCount);
  console.log('Books in Atlas:', bookCount);
  console.log('Questions in Atlas:', qCount);

  const books = await Book.find().limit(5).lean();
  console.log('Existing Books sample:', books);

  process.exit(0);
}

check().catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
