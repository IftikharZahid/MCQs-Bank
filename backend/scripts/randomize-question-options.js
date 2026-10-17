import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

if (process.platform === 'win32' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    console.warn('DNS server override failed, continuing with system DNS:', dnsErr.message);
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

export function shuffleQuestionOptions(options, correctAnswer) {
  if (!Array.isArray(options) || options.length <= 1) {
    return { options, correctAnswer };
  }
  const indexed = options.map((opt, i) => ({ opt, isCorrect: i === correctAnswer }));
  const lastOpt = String(options[options.length - 1]).trim();
  const keepLast = /all of the above|none of the above/i.test(lastOpt);
  
  const toShuffle = keepLast ? indexed.slice(0, -1) : [...indexed];
  // Fisher-Yates shuffle
  for (let i = toShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
  }
  const result = keepLast ? [...toShuffle, indexed[indexed.length - 1]] : toShuffle;
  const newOptions = result.map(o => o.opt);
  const newCorrectAnswer = result.findIndex(o => o.isCorrect);

  return {
    options: newOptions,
    correctAnswer: newCorrectAnswer
  };
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, {
    dbName: 'mcq_question_bank',
    serverSelectionTimeoutMS: 8000
  });
  console.log('Connected to MongoDB Atlas.');

  const Question = (await import('../src/models/Question.js')).default;
  const allQuestions = await Question.find({}).lean();
  console.log(`Found ${allQuestions.length} questions in database.`);

  // 1. Save local backup before modifying
  const backupPath = path.join(__dirname, 'backup-questions.json');
  fs.writeFileSync(backupPath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`Backup saved to ${backupPath} (${allQuestions.length} records).`);

  // 2. Count before distribution
  const beforeDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const q of allQuestions) {
    beforeDist[q.correctAnswer] = (beforeDist[q.correctAnswer] || 0) + 1;
  }
  console.log('Before correctAnswer distribution:', beforeDist);

  // 3. Randomize options for each question
  let updatedCount = 0;
  for (const q of allQuestions) {
    const originalCorrectText = q.options[q.correctAnswer];
    const { options: newOptions, correctAnswer: newCorrectAnswer } = shuffleQuestionOptions(q.options, q.correctAnswer);

    // Sanity check: Ensure the correct answer text is still identical
    if (newOptions[newCorrectAnswer] !== originalCorrectText) {
      throw new Error(`Integrity check failed for question "${q._id}": "${newOptions[newCorrectAnswer]}" !== "${originalCorrectText}"`);
    }

    await Question.updateOne(
      { _id: q._id },
      { $set: { options: newOptions, correctAnswer: newCorrectAnswer } }
    );
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} questions.`);

  // 4. Count after distribution
  const updatedQuestions = await Question.find({}).lean();
  const afterDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const q of updatedQuestions) {
    afterDist[q.correctAnswer] = (afterDist[q.correctAnswer] || 0) + 1;
  }
  console.log('After correctAnswer distribution:', afterDist);

  // Print sample updated questions
  console.log('\n--- SAMPLE UPDATED QUESTIONS ---');
  for (const q of updatedQuestions.slice(0, 5)) {
    console.log(`Q: ${q.question}`);
    console.log(`Options: ${JSON.stringify(q.options)}`);
    console.log(`Correct Answer Index: ${q.correctAnswer} (${q.options[q.correctAnswer]})`);
    console.log('---');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
