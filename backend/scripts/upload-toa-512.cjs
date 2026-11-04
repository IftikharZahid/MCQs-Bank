/**
 * upload-toa-512.cjs
 * Directly uploads Theory_of_Automata_512 MCQs to BOTH MongoDB clusters.
 * Bypasses Vercel serverless timeout by running locally.
 *
 * Usage: node backend/scripts/upload-toa-512.cjs
 */

'use strict';

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const crypto   = require('crypto');
const fs       = require('fs');
const path     = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ── Schema definitions (mirror of src/models) ────────────────────────────────
const subjectSchema = new mongoose.Schema({
  name: String, slug: String, code: String,
  programOrClass: String, semester: String, academicYear: String,
  language: { type: String, default: 'en' },
  status: { type: String, default: 'published' },
  questionCount: { type: Number, default: 0 }
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: String, subjectId: mongoose.Schema.Types.ObjectId,
  author: String, edition: String,
  programOrClass: String, semester: String, academicYear: String,
  language: { type: String, default: 'en' },
  status: { type: String, default: 'published' },
  questionCount: { type: Number, default: 0 }
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  question: String, normalizedQuestion: String,
  options: [String], correctAnswer: { type: Number, default: 0 },
  explanation: String, topic: String, week: Number,
  subjectId: mongoose.Schema.Types.ObjectId,
  bookId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'published' },
  fingerprint: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// ── Load JSON file ────────────────────────────────────────────────────────────
const JSON_FILE = path.resolve(
  'C:/Users/USER/.gemini/antigravity/brain/770ab8f3-84a7-42b7-b9fa-def1ac6947d7/.user_uploaded/media_1793768250015_68509ed3.json'
);
const rawData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
const rawQuestions = rawData.questions || [];
console.log(`\n📂 Loaded ${rawQuestions.length} questions from JSON file`);

// ── Helper: normalise option text ─────────────────────────────────────────────
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestionDoc(rawQ, subjectId, bookId) {
  // options may be an object { A, B, C, D } or array
  let optArr;
  const correctKey = (rawQ.correct_option || 'A').trim().toUpperCase();

  if (Array.isArray(rawQ.options)) {
    optArr = rawQ.options.map(String);
  } else if (rawQ.options && typeof rawQ.options === 'object') {
    optArr = ['A', 'B', 'C', 'D'].map(k => String(rawQ.options[k] || ''));
  } else {
    return null;
  }

  // Find correct answer index (before any shuffle)
  const keyIndex = ['A', 'B', 'C', 'D'].indexOf(correctKey);
  const correctText = keyIndex >= 0 ? optArr[keyIndex] : optArr[0];

  // Shuffle options
  const shuffled = shuffleArray([...optArr]);
  const newCorrectIndex = shuffled.indexOf(correctText);

  const questionText = (rawQ.question || '').trim();
  if (!questionText || shuffled.length < 2) return null;

  const normalizedText = questionText.toLowerCase().replace(/\s+/g, ' ');
  const normalizedOpts = shuffled.map(o => String(o).trim().toLowerCase()).join('|');
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${subjectId.toString()}::${normalizedText}::${normalizedOpts}`)
    .digest('hex');

  return {
    question: questionText,
    normalizedQuestion: normalizedText,
    options: shuffled,
    correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    explanation: rawQ.explanation || '',
    topic: rawQ.topic || '',
    week: rawQ.week || 0,
    subjectId,
    bookId,
    status: 'published',
    fingerprint
  };
}

// ── Batch insert helper ───────────────────────────────────────────────────────
async function batchInsert(QuestionModel, docs, batchSize = 100) {
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    process.stdout.write(`  Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docs.length / batchSize)} (${batch.length} docs)...`);
    try {
      const res = await QuestionModel.insertMany(batch, { ordered: false });
      inserted += res.length;
      console.log(` ✅ ${res.length} inserted`);
    } catch (err) {
      const dupes = err.writeErrors ? err.writeErrors.filter(e => e.code === 11000).length : 0;
      const ok    = batch.length - (err.writeErrors ? err.writeErrors.length : batch.length);
      inserted += Math.max(0, ok);
      skipped  += dupes;
      console.log(` ⚠️  ${ok} inserted, ${dupes} duplicates skipped`);
    }
  }
  return { inserted, skipped };
}

// ── Upload to one cluster ─────────────────────────────────────────────────────
async function uploadToCluster(label, uri, subjectConfig, bookConfig) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`🔌 Connecting to ${label}...`);

  const conn = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 60000
  }).asPromise();

  const Subject  = conn.model('Subject',  subjectSchema,  'subjects');
  const Book     = conn.model('Book',     bookSchema,     'books');
  const Question = conn.model('Question', questionSchema, 'questions');

  // ── 1. Resolve / create subject ──────────────────────────────────────────
  let subject = await Subject.findOne({
    name: new RegExp(`^${subjectConfig.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  });

  if (!subject) {
    console.log(`  📚 Creating new subject: "${subjectConfig.name}"`);
    subject = await Subject.create({
      name: subjectConfig.name,
      slug: subjectConfig.slug,
      code: subjectConfig.code,
      programOrClass: subjectConfig.programOrClass,
      semester: subjectConfig.semester,
      academicYear: '2026',
      language: 'en',
      status: 'published'
    });
    console.log(`  ✅ Subject created: ${subject._id}`);
  } else {
    console.log(`  ♻️  Reusing existing subject: "${subject.name}" (${subject._id})`);
  }

  // ── 2. Resolve / create book ─────────────────────────────────────────────
  let book = await Book.findOne({
    subjectId: subject._id,
    title: new RegExp(`^${bookConfig.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  });

  if (!book) {
    console.log(`  📖 Creating new book: "${bookConfig.title}"`);
    book = await Book.create({
      title: bookConfig.title,
      subjectId: subject._id,
      author: bookConfig.author,
      edition: bookConfig.edition,
      programOrClass: subject.programOrClass,
      semester: subject.semester,
      academicYear: '2026',
      language: 'en',
      status: 'published'
    });
    console.log(`  ✅ Book created: ${book._id}`);
  } else {
    console.log(`  ♻️  Reusing existing book: "${book.title}" (${book._id})`);
  }

  // ── 3. Build question docs ───────────────────────────────────────────────
  const docs = rawQuestions.map(q => buildQuestionDoc(q, subject._id, book._id)).filter(Boolean);
  console.log(`  🔧 Built ${docs.length} valid question documents`);

  // ── 4. Batch insert ──────────────────────────────────────────────────────
  const { inserted, skipped } = await batchInsert(Question, docs, 100);
  console.log(`  📊 Result: ${inserted} inserted, ${skipped} duplicates skipped`);

  // ── 5. Update counts ─────────────────────────────────────────────────────
  const bookQCount = await Question.countDocuments({ bookId: book._id, status: 'published' });
  const subQCount  = await Question.countDocuments({ subjectId: subject._id, status: 'published' });
  await Book.findByIdAndUpdate(book._id,       { $set: { questionCount: bookQCount } });
  await Subject.findByIdAndUpdate(subject._id, { $set: { questionCount: subQCount  } });
  console.log(`  📈 Updated counts — Book: ${bookQCount}, Subject: ${subQCount}`);

  // ── 6. Final verification ────────────────────────────────────────────────
  const updatedBook = await Book.findById(book._id).lean();
  console.log(`  ✅ Verified — "${updatedBook.title}": ${updatedBook.questionCount} MCQs`);

  await conn.close();
  return { subjectId: subject._id, bookId: book._id, inserted, bookQCount };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Theory of Automata 512 MCQ Direct Upload Script');
  console.log('='.repeat(60));

  // Config for the new TOA 457 book
  const subjectConfig = {
    name: 'Theory of Automata Mock-Test',
    slug: `theory-of-automata-mock-test-${Date.now().toString().slice(-4)}`,
    code: 'TOA-457',
    programOrClass: 'ADP',
    semester: ''
  };
  const bookConfig = {
    title: 'Theory Of Automata (457)',
    author: 'Lec. Iftikhar Zahid',
    edition: '1st Edition • Comprehensive Normalized MCQ Bank'
  };

  const PRIMARY_URI = process.env.MONGODB_URI;

  // Try to get cluster0 URI from env
  const CLUSTER0_URI = process.env.MONGODB_URI_CLUSTER0 || process.env.MONGODB_CLUSTER0_URI;

  if (!PRIMARY_URI) {
    console.error('❌ MONGODB_URI not found in backend/.env');
    process.exit(1);
  }

  try {
    // Upload to primary cluster (mcqsbank-db)
    const primary = await uploadToCluster('mcqsbank-db (primary)', PRIMARY_URI, subjectConfig, bookConfig);

    // Upload to cluster0 if URI is available
    if (CLUSTER0_URI) {
      await uploadToCluster('cluster0 (Vercel)', CLUSTER0_URI, subjectConfig, bookConfig);
    } else {
      console.log('\n⚠️  MONGODB_URI_CLUSTER0 not set — skipping cluster0 sync.');
      console.log('   Set it in backend/.env and re-run to sync to Vercel\'s database.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Upload complete!');
    console.log(`   Primary cluster: ${primary.inserted} new MCQs inserted`);
    console.log(`   Book: "${bookConfig.title}" now has ${primary.bookQCount} MCQs`);
    console.log('\n   Verify: node -e "fetch(\'http://localhost:5000/api/books\').then(r=>r.json()).then(d=>d.data.forEach(b=>console.log(b.title,b.questionCount)))"');

  } catch (err) {
    console.error('\n❌ Upload failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
