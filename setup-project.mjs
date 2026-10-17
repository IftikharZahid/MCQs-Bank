// setup-project.mjs
// Run with: node setup-project.mjs
import fs from 'fs';
import path from 'path';

const files = {
  /* ==========================================================================
   * ROOT CONFIGURATION & README
   * ======================================================================== */
  'package.json': JSON.stringify({
    name: 'qb-platform-root',
    version: '1.0.0',
    private: true,
    scripts: {
      'install:all': 'npm install && cd backend && npm install && cd ../frontend && npm install',
      'dev:backend': 'cd backend && npm run dev',
      'dev:frontend': 'cd frontend && npm run dev',
      'seed:admin': 'cd backend && npm run seed:admin',
      'audit:db': 'cd backend && npm run audit:db',
      'build': 'cd frontend && npm run build'
    }
  }, null, 2),

  'README.md': `# Professional MCQs Question Bank & Admin Panel

## Quick Start Guide (Local Laptop Setup)

### 1. Prerequisites
- **Node.js** v18+ installed (https://nodejs.org)
- **MongoDB Atlas URI** (or local MongoDB instance \`mongodb://127.0.0.1:27017/question_bank\`)

### 2. Install Dependencies
Open a terminal in this root folder and run:
\`\`\`bash
npm run install:all
\`\`\`

### 3. Configure Environment Variables
Copy \`backend/.env.example\` to \`backend/.env\` and fill in your MongoDB connection string:
\`\`\`bash
cp backend/.env.example backend/.env
\`\`\`

### 4. Seed Initial Super Admin Account
\`\`\`bash
npm run seed:admin
\`\`\`
*(Default login: \`admin@iftikharzahid.me\` / \`Admin@123456\`)*

### 5. Run Backend & Frontend
Open **two terminal tabs**:
- **Terminal 1 (Backend API - Port 5000):**
  \`\`\`bash
  npm run dev:backend
  \`\`\`
- **Terminal 2 (React Frontend - Port 5173):**
  \`\`\`bash
  npm run dev:frontend
  \`\`\`

Open **http://localhost:5173/qb/** for the Student Portal and **http://localhost:5173/qb/admin/login** for the Admin Panel.
`,

  /* ==========================================================================
   * BACKEND FILES (Node.js + Express + Mongoose)
   * ======================================================================== */
  'backend/package.json': JSON.stringify({
    name: 'qb-backend',
    version: '1.0.0',
    type: 'module',
    main: 'src/server.js',
    scripts: {
      start: 'node src/server.js',
      dev: 'node --watch src/server.js',
      'seed:admin': 'node scripts/seed-admin.js',
      'audit:db': 'node scripts/audit-existing-db.js'
    },
    dependencies: {
      bcryptjs: '^2.4.3',
      'cookie-parser': '^1.4.6',
      cors: '^2.8.5',
      'csv-parse': '^5.5.6',
      dotenv: '^16.4.5',
      express: '^4.19.2',
      'express-rate-limit': '^7.4.0',
      helmet: '^7.1.0',
      jsonwebtoken: '^9.0.2',
      mammoth: '^1.8.0',
      mongoose: '^8.6.1',
      multer: '^1.4.5-lts.1',
      'pdf-parse': '^1.1.1'
    }
  }, null, 2),

  'backend/.env.example': `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/question_bank
JWT_SECRET=super_secure_jwt_secret_key_change_in_production_2026
CLIENT_ORIGIN=http://localhost:5173
INITIAL_ADMIN_EMAIL=admin@iftikharzahid.me
INITIAL_ADMIN_PASSWORD=Admin@123456
`,

  'backend/.env': `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/question_bank
JWT_SECRET=super_secure_jwt_secret_key_change_in_production_2026
CLIENT_ORIGIN=http://localhost:5173
INITIAL_ADMIN_EMAIL=admin@iftikharzahid.me
INITIAL_ADMIN_PASSWORD=Admin@123456
`,

  'backend/scripts/audit-existing-db.js': `import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

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
    console.log(\`\\nCollection: \${col.name} (Total Documents: \${count})\`);
    if (sample) console.log('Sample Keys:', Object.keys(sample).join(', '));
  }
  await mongoose.disconnect();
}
runAudit().catch(console.error);
`,

  'backend/scripts/seed-admin.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import AdminUser from '../src/models/AdminUser.js';
import Subject from '../src/models/Subject.js';
import Book from '../src/models/Book.js';
import Question from '../src/models/Question.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@iftikharzahid.me').toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';

  let admin = await AdminUser.findOne({ email });
  if (!admin) {
    const passwordHash = await bcrypt.hash(password, 12);
    admin = await AdminUser.create({
      name: 'Super Administrator',
      email,
      passwordHash,
      role: 'super_admin'
    });
    console.log('Created Super Admin:', email);
  } else {
    console.log('Super Admin already exists:', email);
  }

  // Seed initial sample academic subject, book & bilingual MCQs if database is empty
  const existingSubjects = await Subject.countDocuments();
  if (existingSubjects === 0) {
    const automata = await Subject.create({
      name: 'Theory of Automata',
      slug: 'theory-of-automata',
      code: 'CS-301',
      description: 'Formal languages, regular expressions, finite automata, pushdown automata, and Turing machines.',
      programOrClass: 'BS Computer Science',
      semester: '5th Semester',
      academicYear: '2026',
      language: 'en',
      status: 'published'
    });

    const book = await Book.create({
      title: 'Introduction to Computer Theory (Daniel I.A. Cohen)',
      subjectId: automata._id,
      programOrClass: 'BS Computer Science',
      semester: '5th Semester',
      author: 'Daniel I.A. Cohen',
      edition: '2nd Edition',
      academicYear: '2026',
      language: 'en',
      status: 'published',
      chapters: [
        { chapterNumber: 1, title: 'Background & Alphabets', weeks: [{ weekNumber: 1, topic: 'Kleene Closure & Strings' }] },
        { chapterNumber: 2, title: 'Finite Automata', weeks: [{ weekNumber: 2, topic: 'DFA and NFA Transitions' }] }
      ]
    });

    await Question.create([
      {
        question: 'Which operation represents Kleene closure over an alphabet Σ?',
        options: ['Union (+)', 'Concatenation (.)', 'Kleene Star (*)', 'Intersection (∩)'],
        correctAnswer: 2,
        explanation: 'Kleene star (Σ*) represents the set of all possible strings of any length (including the empty string Λ) over Σ.',
        subjectId: automata._id,
        bookId: book._id,
        chapter: 'Chapter 1',
        week: 'Week 1',
        topic: 'Kleene Closure',
        difficulty: 'easy',
        language: 'en',
        status: 'published'
      },
      {
        question: 'In a Deterministic Finite Automaton (DFA), how many transitions are permitted per input symbol from each state?',
        options: ['Zero or more', 'Exactly one', 'At least two', 'Depends on final states'],
        correctAnswer: 1,
        explanation: 'By definition, a DFA must have a unique, deterministic transition for every symbol in the alphabet from every state.',
        subjectId: automata._id,
        bookId: book._id,
        chapter: 'Chapter 2',
        week: 'Week 2',
        topic: 'Deterministic Finite Automata',
        difficulty: 'medium',
        language: 'en',
        status: 'published'
      },
      {
        question: 'پاکستان کا قومی شاعر کون ہے؟ (Sample Urdu RTL Question Support)',
        options: ['مرزا غالب', 'علامہ محمد اقبال', 'فیض احمد فیض', 'احمد فراز'],
        correctAnswer: 1,
        explanation: 'علامہ محمد اقبال پاکستان کے قومی شاعر اور مفکرِ پاکستان ہیں۔',
        subjectId: automata._id,
        bookId: book._id,
        chapter: 'Chapter 1',
        week: 'Week 1',
        topic: 'Urdu RTL Rendering Demo',
        difficulty: 'easy',
        language: 'ur',
        status: 'published'
      }
    ]);
    console.log('Seeded sample Subject, Book, and 3 Bilingual MCQs.');
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
`,

  'backend/src/models/Subject.js': `import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  code: { type: String, trim: true, default: '' },
  description: { type: String, default: '' },
  programOrClass: { type: String, default: 'General', index: true },
  semester: { type: String, default: '' },
  academicYear: { type: String, default: '2026' },
  language: { type: String, enum: ['en', 'ur', 'bilingual'], default: 'en' },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true },
  contentVersion: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
`,

  'backend/src/models/Book.js': `import mongoose from 'mongoose';

const chapterSubSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  weeks: [{ weekNumber: Number, topic: String }]
}, { _id: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  programOrClass: { type: String, default: '' },
  semester: { type: String, default: '' },
  author: { type: String, default: '' },
  edition: { type: String, default: '' },
  academicYear: { type: String, default: '2026' },
  description: { type: String, default: '' },
  language: { type: String, enum: ['en', 'ur', 'bilingual'], default: 'en' },
  chapters: [chapterSubSchema],
  sourceFilename: { type: String, default: '' },
  contentVersion: { type: Number, default: 1, index: true },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true }
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', bookSchema);
`,

  'backend/src/models/Question.js': `import mongoose from 'mongoose';
import crypto from 'crypto';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least 2 options are required.']
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (val) {
        return Array.isArray(this.options) && val >= 0 && val < this.options.length;
      },
      message: 'correctAnswer index must correspond to an existing option.'
    }
  },
  explanation: { type: String, default: '' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', index: true },
  chapter: { type: String, default: '', index: true },
  week: { type: String, default: '', index: true },
  topic: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
  language: { type: String, enum: ['en', 'ur'], default: 'en' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true },
  fingerprint: { type: String, unique: true, sparse: true, index: true },
  contentVersion: { type: Number, default: 1, index: true }
}, { timestamps: true });

questionSchema.pre('validate', function (next) {
  if (this.question && this.subjectId) {
    const normalizedText = this.question.trim().toLowerCase().replace(/\\s+/g, ' ');
    const normalizedOpts = (this.options || []).map(o => String(o).trim().toLowerCase()).join('|');
    this.fingerprint = crypto
      .createHash('sha256')
      .update(\`\${this.subjectId.toString()}::\${normalizedText}::\${normalizedOpts}\`)
      .digest('hex');
  }
  next();
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
`,

  'backend/src/models/ExamAttempt.js': `import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  studentName: { type: String, default: 'Student Candidate' },
  durationMinutes: { type: Number, required: true },
  passingPercentage: { type: Number, default: 50 },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  status: { type: String, enum: ['in_progress', 'submitted', 'expired'], default: 'in_progress' },
  items: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: Number, default: null },
    isCorrect: { type: Boolean, default: false }
  }],
  summary: {
    totalQuestions: Number,
    answered: Number,
    unanswered: Number,
    correct: Number,
    incorrect: Number,
    obtainedMarks: Number,
    percentage: Number,
    accuracyRate: Number,
    passed: Boolean,
    grade: String
  }
}, { timestamps: true });

export default mongoose.models.ExamAttempt || mongoose.model('ExamAttempt', examAttemptSchema);
`,

  'backend/src/models/AdminUser.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'content_manager', 'teacher'], default: 'content_manager' },
  isActive: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });

adminUserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
`,

  'backend/src/middlewares/auth.js': `import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.qb_admin_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AdminUser.findById(decoded.sub).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or deactivated account' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
};
`,

  'backend/src/services/importService.js': `import { parse } from 'csv-parse/sync';
import mammoth from 'mammoth';
import Subject from '../models/Subject.js';

export function normalizeQuestionRecord(raw, index) {
  const questionText = String(raw.question || raw.text || raw.q || '').trim();
  let options = raw.options || [raw.optionA, raw.optionB, raw.optionC, raw.optionD].filter(Boolean);
  if (typeof options === 'string') {
    options = options.split('|').map(s => s.trim());
  }

  let correctAnswer = raw.correctAnswer ?? raw.answer ?? raw.correctIndex;
  if (typeof correctAnswer === 'string' && /^[A-D]$/i.test(correctAnswer.trim())) {
    correctAnswer = correctAnswer.trim().toUpperCase().charCodeAt(0) - 65;
  } else {
    correctAnswer = Number(correctAnswer);
  }

  const errors = [];
  if (!questionText) errors.push(\`Row \${index + 1}: Missing question text.\`);
  if (!Array.isArray(options) || options.length < 2) errors.push(\`Row \${index + 1}: At least 2 options required.\`);
  if (Number.isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= (options?.length || 0)) {
    errors.push(\`Row \${index + 1}: correctAnswer (\${raw.correctAnswer}) out of bounds.\`);
  }

  const isUrdu = /[\\u0600-\\u06FF]/.test(questionText);

  return {
    valid: errors.length === 0,
    errors,
    data: {
      question: questionText,
      options: (options || []).map(o => String(o).trim()),
      correctAnswer,
      explanation: String(raw.explanation || '').trim(),
      chapter: String(raw.chapter || '').trim(),
      week: String(raw.week || '').trim(),
      topic: String(raw.topic || '').trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(String(raw.difficulty).toLowerCase())
        ? String(raw.difficulty).toLowerCase()
        : 'medium',
      language: raw.language || (isUrdu ? 'ur' : 'en')
    }
  };
}

export function parseRawTextBlocks(text) {
  const blocks = text.split(/\\n(?=(?:Q\\d*[:.]|\\d+[.)])\\s+)/i).map(b => b.trim()).filter(Boolean);
  const extracted = [];
  for (const block of blocks) {
    const qMatch = block.match(/^(?:Q\\d*[:.]|\\d+[.)])\\s*(.+?)(?=\\n\\s*[A-D][).])/is);
    const optMatches = [...block.matchAll(/^[ \\t]*([A-D])[).]\\s*(.+)$/gim)];
    const ansMatch = block.match(/Answer\\s*[:=-]\\s*([A-D0-3])/i);
    const expMatch = block.match(/Explanation\\s*[:=-]\\s*(.+)$/is);
    if (qMatch && optMatches.length >= 2 && ansMatch) {
      extracted.push({
        question: qMatch[1].trim(),
        options: optMatches.map(m => m[2].trim()),
        correctAnswer: ansMatch[1].trim(),
        explanation: expMatch ? expMatch[1].trim() : ''
      });
    }
  }
  return extracted;
}

export async function parseUploadedFile(fileBuffer, mimeType, originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  if (ext === 'json' || mimeType === 'application/json') {
    const parsed = JSON.parse(fileBuffer.toString('utf-8'));
    const list = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    return { rawQuestions: list, requiresDraftReview: false };
  }
  if (ext === 'csv' || mimeType === 'text/csv') {
    const records = parse(fileBuffer.toString('utf-8'), { columns: true, skip_empty_lines: true });
    return { rawQuestions: records, requiresDraftReview: false };
  }
  if (ext === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
    return { rawQuestions: parseRawTextBlocks(value), requiresDraftReview: true };
  }
  throw new Error(\`Unsupported format (\${ext}). Upload .json, .csv, or .docx\`);
}

export async function resolveSubjectMatch(subjectName, programOrClass) {
  if (!subjectName) return { status: 'missing' };
  const normalizedSlug = subjectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const exactMatch = await Subject.findOne({
    $or: [{ slug: normalizedSlug }, { name: new RegExp(\`^\${subjectName.trim()}$\`, 'i') }]
  });

  if (exactMatch) {
    if (programOrClass && exactMatch.programOrClass && exactMatch.programOrClass.toLowerCase() !== programOrClass.toLowerCase()) {
      return {
        status: 'ambiguous_program',
        message: \`Subject "\${exactMatch.name}" already exists under "\${exactMatch.programOrClass}". Reuse it or create a separate subject for "\${programOrClass}"?\`,
        candidate: exactMatch
      };
    }
    return { status: 'exact_match', subject: exactMatch };
  }
  return { status: 'new_subject' };
}
`,

  'backend/src/routes/api.js': `import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Subject from '../models/Subject.js';
import Book from '../models/Book.js';
import Question from '../models/Question.js';
import ExamAttempt from '../models/ExamAttempt.js';
import AdminUser from '../models/AdminUser.js';
import { requireAuth } from '../middlewares/auth.js';
import { parseUploadedFile, normalizeQuestionRecord, resolveSubjectMatch } from '../services/importService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// 1. Preserved Legacy & Student Routes
router.get('/status', async (req, res) => {
  const [subjects, books, questions, exams, draftQuestions] = await Promise.all([
    Subject.countDocuments({ status: 'published' }),
    Book.countDocuments({ status: 'published' }),
    Question.countDocuments({ status: 'published' }),
    ExamAttempt.countDocuments({ status: 'submitted' }),
    Question.countDocuments({ status: 'draft' })
  ]);
  res.json({
    status: 'online',
    database: 'connected',
    timestamp: new Date().toISOString(),
    stats: { subjects, books, questions, exams, draftQuestions }
  });
});

router.get('/subjects', async (req, res) => {
  const { search, program, language } = req.query;
  const filter = { status: 'published' };
  if (program) filter.programOrClass = program;
  if (language) filter.language = language;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const subjects = await Subject.find(filter).sort({ updatedAt: -1 }).lean();
  const enriched = await Promise.all(subjects.map(async (sub) => {
    const [questionCount, bookCount] = await Promise.all([
      Question.countDocuments({ subjectId: sub._id, status: 'published' }),
      Book.countDocuments({ subjectId: sub._id, status: 'published' })
    ]);
    return { ...sub, questionCount, bookCount };
  }));
  res.json({ success: true, data: enriched });
});

router.get('/subjects/:id', async (req, res) => {
  const subject = await Subject.findById(req.params.id).lean();
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
  const books = await Book.find({ subjectId: subject._id, status: 'published' }).lean();
  const questionCount = await Question.countDocuments({ subjectId: subject._id, status: 'published' });
  res.json({ success: true, data: { ...subject, books, questionCount } });
});

router.get('/books', async (req, res) => {
  const { subjectId, search } = req.query;
  const filter = { status: 'published' };
  if (subjectId) filter.subjectId = subjectId;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const books = await Book.find(filter).populate('subjectId', 'name slug programOrClass').sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(books.map(async (b) => {
    const questionCount = await Question.countDocuments({ bookId: b._id, status: 'published' });
    return { ...b, questionCount };
  }));
  res.json({ success: true, data: enriched });
});

router.get('/questions', async (req, res) => {
  const { subjectId, bookId, chapter, difficulty, language, search, page = 1, limit = 50 } = req.query;
  const filter = { status: 'published' };
  if (subjectId) filter.subjectId = subjectId;
  if (bookId) filter.bookId = bookId;
  if (chapter) filter.chapter = chapter;
  if (difficulty) filter.difficulty = difficulty;
  if (language) filter.language = language;
  if (search) filter.question = { $regex: search, $options: 'i' };

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate('subjectId', 'name slug')
      .populate('bookId', 'title')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Question.countDocuments(filter)
  ]);

  res.json({
    success: true,
    questions,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
  });
});

// 2. Examination & Authoritative Grading Routes
router.post('/exams/start', async (req, res) => {
  const { subjectId, bookId, questionCount = 10, durationMinutes = 15, passingPercentage = 50, studentName } = req.body;
  const matchStage = { status: 'published' };
  if (subjectId) matchStage.subjectId = new Subject.base.Types.ObjectId(subjectId);
  if (bookId) matchStage.bookId = new Book.base.Types.ObjectId(bookId);

  const sampledQuestions = await Question.aggregate([
    { $match: matchStage },
    { $sample: { size: Math.min(Number(questionCount), 100) } }
  ]);

  if (sampledQuestions.length === 0) {
    return res.status(400).json({ success: false, message: 'No published questions found for this selection.' });
  }

  const subject = await Subject.findById(sampledQuestions[0].subjectId);
  const attempt = await ExamAttempt.create({
    title: \`\${subject ? subject.name : 'Academic'} Examination\`,
    subjectId: sampledQuestions[0].subjectId,
    bookId: bookId || null,
    studentName: studentName || 'Candidate',
    durationMinutes: Number(durationMinutes),
    passingPercentage: Number(passingPercentage),
    items: sampledQuestions.map(q => ({ questionId: q._id, selectedOption: null, isCorrect: false }))
  });

  const clientSafeQuestions = sampledQuestions.map(q => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
    language: q.language,
    chapter: q.chapter
  }));

  res.status(201).json({
    success: true,
    attemptId: attempt._id,
    startedAt: attempt.startedAt,
    durationMinutes: attempt.durationMinutes,
    questions: clientSafeQuestions
  });
});

router.post('/exams/:attemptId/submit', async (req, res) => {
  const { answers = {} } = req.body;
  const attempt = await ExamAttempt.findById(req.params.attemptId).populate('items.questionId');
  if (!attempt) return res.status(404).json({ success: false, message: 'Exam session not found' });

  let correct = 0;
  let answered = 0;

  attempt.items = attempt.items.map(item => {
    const qId = item.questionId._id.toString();
    const userSelection = answers[qId] !== undefined && answers[qId] !== null ? Number(answers[qId]) : null;
    const isCorrect = userSelection !== null && userSelection === item.questionId.correctAnswer;
    if (userSelection !== null) answered++;
    if (isCorrect) correct++;
    return { questionId: item.questionId._id, selectedOption: userSelection, isCorrect };
  });

  const totalQuestions = attempt.items.length;
  const unanswered = totalQuestions - answered;
  const incorrect = answered - correct;
  const percentage = totalQuestions > 0 ? Number(((correct / totalQuestions) * 100).toFixed(2)) : 0;
  const accuracyRate = answered > 0 ? Number(((correct / answered) * 100).toFixed(2)) : 0;
  const passed = percentage >= attempt.passingPercentage;
  const grade = percentage >= 85 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 65 ? 'B' : percentage >= 50 ? 'C' : 'F';

  attempt.status = 'submitted';
  attempt.submittedAt = new Date();
  attempt.summary = { totalQuestions, answered, unanswered, correct, incorrect, obtainedMarks: correct, percentage, accuracyRate, passed, grade };
  await attempt.save();

  const populatedResult = await ExamAttempt.findById(attempt._id)
    .populate('subjectId', 'name code programOrClass')
    .populate('bookId', 'title')
    .populate('items.questionId');

  res.json({ success: true, data: populatedResult });
});

router.get('/exams/recent', async (req, res) => {
  const recent = await ExamAttempt.find({ status: 'submitted' })
    .populate('subjectId', 'name')
    .sort({ submittedAt: -1 })
    .limit(10)
    .lean();
  res.json({ success: true, data: recent });
});

// 3. Admin Panel Protected Routes
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await AdminUser.findOne({ email: String(email).toLowerCase() });
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.cookie('qb_admin_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600 * 1000 });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/admin/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post('/admin/logout', (req, res) => {
  res.clearCookie('qb_admin_token');
  res.json({ success: true });
});

router.post('/admin/subjects', requireAuth, async (req, res) => {
  const { name, code, description, programOrClass, semester, language } = req.body;
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const existing = await Subject.findOne({ slug });
  if (existing) {
    return res.status(409).json({ success: false, message: 'A subject with this name/slug already exists.', existing });
  }
  const created = await Subject.create({ name, slug, code, description, programOrClass, semester, language });
  res.status(201).json({ success: true, data: created });
});

router.post('/admin/books', requireAuth, async (req, res) => {
  const { title, subjectId, author, edition, programOrClass, semester, language } = req.body;
  const book = await Book.create({ title, subjectId, author, edition, programOrClass, semester, language, status: 'published' });
  res.status(201).json({ success: true, data: book });
});

router.post('/admin/questions', requireAuth, async (req, res) => {
  const norm = normalizeQuestionRecord(req.body, 0);
  if (!norm.valid) return res.status(400).json({ success: false, message: norm.errors.join(' ') });
  const created = await Question.create({
    ...norm.data,
    subjectId: req.body.subjectId,
    bookId: req.body.bookId || undefined,
    status: 'published'
  });
  res.status(201).json({ success: true, data: created });
});

router.post('/admin/imports/preview', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { subjectName, programOrClass } = req.body;
    const { rawQuestions, requiresDraftReview } = await parseUploadedFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const subjectResolution = await resolveSubjectMatch(subjectName, programOrClass);
    const validatedRecords = rawQuestions.map((q, idx) => normalizeQuestionRecord(q, idx));
    const validQuestions = validatedRecords.filter(r => r.valid).map(r => r.data);
    const errorReport = validatedRecords.filter(r => !r.valid).flatMap(r => r.errors);

    let duplicateCount = 0;
    if (subjectResolution.subject) {
      const sId = subjectResolution.subject._id.toString();
      const fingerprints = validQuestions.map(q =>
        crypto.createHash('sha256')
          .update(\`\${sId}::\${q.question.trim().toLowerCase().replace(/\\s+/g, ' ')}::\${q.options.map(o => o.toLowerCase()).join('|')}\`)
          .digest('hex')
      );
      duplicateCount = await Question.countDocuments({ fingerprint: { $in: fingerprints } });
    }

    res.json({
      success: true,
      preview: {
        filename: req.file.originalname,
        totalParsed: rawQuestions.length,
        validCount: validQuestions.length,
        invalidCount: errorReport.length,
        duplicateCount,
        requiresDraftReview,
        subjectResolution,
        errors: errorReport.slice(0, 30),
        stagedPayload: validQuestions
      }
    });
  } catch (err) {
    res.status(422).json({ success: false, message: err.message });
  }
});

router.post('/upload', requireAuth, async (req, res) => {
  const { subjectId, createNewSubject, bookTitle, questions = [], publishImmediately = true } = req.body;
  let targetSubjectId = subjectId;

  if (!targetSubjectId && createNewSubject?.name) {
    const slug = createNewSubject.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const createdSub = await Subject.create({
      name: createNewSubject.name.trim(),
      slug: \`\${slug}-\${Date.now().toString().slice(-4)}\`,
      programOrClass: createNewSubject.programOrClass || 'General',
      status: 'published'
    });
    targetSubjectId = createdSub._id;
  }

  let targetBook = null;
  if (bookTitle && targetSubjectId) {
    targetBook = await Book.findOneAndUpdate(
      { title: bookTitle.trim(), subjectId: targetSubjectId },
      { $setOnInsert: { title: bookTitle.trim(), subjectId: targetSubjectId, status: 'published' }, $inc: { contentVersion: 1 } },
      { upsert: true, new: true }
    );
  }

  let insertedCount = 0;
  let skippedDuplicates = 0;
  for (const rawQ of questions) {
    const norm = normalizeQuestionRecord(rawQ, 0);
    if (!norm.valid) continue;
    try {
      await Question.create({
        ...norm.data,
        subjectId: targetSubjectId,
        bookId: targetBook ? targetBook._id : undefined,
        status: publishImmediately ? 'published' : 'draft'
      });
      insertedCount++;
    } catch (err) {
      if (err.code === 11000) skippedDuplicates++;
    }
  }

  res.status(201).json({
    success: true,
    summary: { subjectId: targetSubjectId, bookId: targetBook?._id, insertedCount, skippedDuplicates, status: publishImmediately ? 'published' : 'draft' }
  });
});

// 4. Future Android App Sync Endpoint
router.get('/v1/sync/manifest', async (req, res) => {
  const sinceDate = req.query.since ? new Date(req.query.since) : new Date(0);
  const deltaFilter = { status: 'published', updatedAt: { $gt: sinceDate } };
  const [subjects, books, questions] = await Promise.all([
    Subject.find(deltaFilter).lean(),
    Book.find(deltaFilter).lean(),
    Question.find(deltaFilter).lean()
  ]);
  res.json({
    success: true,
    syncCursor: new Date().toISOString(),
    counts: { subjects: subjects.length, books: books.length, questions: questions.length },
    delta: { subjects, books, questions }
  });
});

export default router;
`,

  'backend/src/server.js': `import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dns from 'dns';
import apiRoutes from './routes/api.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server override failed:', dnsErr.message);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(cookieParser());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(\`Question Bank API Server running on http://localhost:\${PORT}\`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
`,

  /* ==========================================================================
   * FRONTEND FILES (React + Vite + Tailwind CSS + Lucide Icons)
   * ======================================================================== */
  'frontend/package.json': JSON.stringify({
    name: 'qb-frontend',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'lucide-react': '^0.446.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-router-dom': '^6.26.2'
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.3.1',
      autoprefixer: '^10.4.20',
      postcss: '^8.4.47',
      tailwindcss: '^3.4.13',
      vite: '^5.4.8'
    }
  }, null, 2),

  'frontend/vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/qb/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
`,

  'frontend/tailwind.config.js': `export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A8A',
          navyDark: '#172554',
          gold: '#F59E0B',
          goldHover: '#D97706',
          surface: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', 'serif']
      }
    }
  },
  plugins: []
};
`,

  'frontend/postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`,

  'frontend/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Academic Question Bank & Examination Portal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-[#1E3A8A] selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,

  'frontend/src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@media print {
  body {
    background: #ffffff !important;
  }
}
`,

  'frontend/src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/qb">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`,

  'frontend/src/components/QuestionCard.jsx': `import React from 'react';
import { Bookmark, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function QuestionCard({
  index,
  questionObj,
  selectedOption,
  onSelectOption,
  showFeedback = false,
  isBookmarked = false,
  onToggleBookmark
}) {
  const isUrdu = questionObj.language === 'ur' || /[\\u0600-\\u06FF]/.test(questionObj.question);

  return (
    <article
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100" dir="ltr">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-brand-navy/10 text-brand-navy">
            Q #{index + 1}
          </span>
          {questionObj.difficulty && (
            <span className={\`px-2.5 py-1 text-xs font-semibold rounded-md capitalize \${
              questionObj.difficulty === 'hard'
                ? 'bg-red-50 text-red-700'
                : questionObj.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }\`}>
              {questionObj.difficulty}
            </span>
          )}
          {questionObj.chapter && (
            <span className="text-xs text-slate-500 font-medium">{questionObj.chapter}</span>
          )}
        </div>

        {onToggleBookmark && (
          <button
            type="button"
            onClick={() => onToggleBookmark(questionObj._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-gold"
            title="Bookmark Question"
          >
            <Bookmark className={\`w-5 h-5 \${isBookmarked ? 'fill-brand-gold text-brand-gold' : ''}\`} />
          </button>
        )}
      </div>

      <h3 className={\`text-lg font-semibold text-slate-900 mb-5 \${
        isUrdu ? 'font-urdu leading-[2.3] text-right text-xl' : 'leading-relaxed'
      }\`}>
        {questionObj.question}
      </h3>

      <div className="space-y-3">
        {questionObj.options.map((optionText, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = questionObj.correctAnswer === optIdx;

          let optionStyle = 'border-slate-200 hover:border-brand-navy/60 bg-slate-50/70';
          if (showFeedback) {
            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-red-500 bg-red-50 text-red-900';
            }
          } else if (isSelected) {
            optionStyle = 'border-brand-navy bg-brand-navy/5 ring-2 ring-brand-navy/20';
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={showFeedback}
              onClick={() => onSelectOption(optIdx)}
              className={\`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all \${optionStyle} \${
                isUrdu ? 'flex-row-reverse text-right font-urdu leading-loose' : ''
              }\`}
            >
              <div className={\`flex items-center gap-3 \${isUrdu ? 'flex-row-reverse' : ''}\`}>
                <span className={\`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 \${
                  isSelected ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'
                }\`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  {optionText}
                </span>
              </div>

              {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {showFeedback && questionObj.explanation && (
        <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1" dir="ltr">
            <HelpCircle className="w-4 h-4" />
            <span>Explanation</span>
          </div>
          <p className={isUrdu ? 'font-urdu leading-loose text-right' : ''}>
            {questionObj.explanation}
          </p>
        </div>
      )}
    </article>
  );
}
`,

  'frontend/src/App.jsx': `import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, GraduationCap, LayoutDashboard, UploadCloud, CheckCircle2,
  Clock, Printer, ShieldCheck, Search, Play, Award, PlusCircle, LogOut
} from 'lucide-react';
import QuestionCard from './components/QuestionCard.jsx';

/* ==========================================================================
 * NAVBAR COMPONENT
 * ======================================================================== */
function Navbar() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-30 bg-brand-navy text-white shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-brand-gold text-slate-950 flex items-center justify-center font-extrabold">
            QB
          </div>
          <div>
            <span>Academic Question Bank</span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 font-medium">
              Portal & Exam Engine
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3 text-sm font-medium">
          <Link
            to="/"
            className={\`px-3 py-2 rounded-lg transition \${location.pathname === '/' ? 'bg-white/15 text-brand-gold' : 'hover:bg-white/10'}\`}
          >
            Home
          </Link>
          <Link
            to="/catalog"
            className={\`px-3 py-2 rounded-lg transition \${location.pathname.startsWith('/catalog') ? 'bg-white/15 text-brand-gold' : 'hover:bg-white/10'}\`}
          >
            Subjects & Books
          </Link>
          <Link
            to="/practice"
            className={\`px-3 py-2 rounded-lg transition \${location.pathname.startsWith('/practice') ? 'bg-white/15 text-brand-gold' : 'hover:bg-white/10'}\`}
          >
            Practice
          </Link>
          <Link
            to="/exam"
            className={\`px-3 py-2 rounded-lg transition \${location.pathname.startsWith('/exam') ? 'bg-white/15 text-brand-gold' : 'hover:bg-white/10'}\`}
          >
            Examination
          </Link>
          <Link
            to="/admin"
            className="ml-2 px-3.5 py-2 rounded-xl bg-brand-gold text-slate-950 font-bold hover:bg-brand-goldHover transition"
          >
            Admin Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ==========================================================================
 * 1. STUDENT HOMEPAGE
 * ======================================================================== */
function HomePage() {
  const [status, setStatus] = useState({ stats: { subjects: 0, books: 0, questions: 0, exams: 0 } });
  const [subjects, setSubjects] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {});
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d.data || [])).catch(() => {});
    fetch('/api/exams/recent').then(r => r.json()).then(d => setRecentExams(d.data || [])).catch(() => {});
  }, []);

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.programOrClass || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-brand-navy to-brand-navyDark text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
              Verified Academic Repository
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Master Your Coursework with Interactive MCQs & Timed Examinations
            </h1>
            <p className="text-slate-200 text-base max-w-2xl">
              Browse structured university books, practice chapter-by-chapter with instant explanations in English and Urdu, or generate official printable examination transcripts.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/practice')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-gold text-slate-950 font-bold hover:bg-brand-goldHover"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Practice Mode
              </button>
              <button
                onClick={() => navigate('/exam')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 border border-white/20"
              >
                <Clock className="w-4 h-4" />
                Launch Timed Exam
              </button>
            </div>
          </div>

          {/* Live Backend Statistics */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-[18px] p-5">
              <span className="text-xs uppercase text-slate-300 font-semibold">Total Available MCQs</span>
              <p className="text-3xl font-extrabold text-brand-gold mt-1">{status.stats?.questions || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-[18px] p-5">
              <span className="text-xs uppercase text-slate-300 font-semibold">Active Subjects</span>
              <p className="text-3xl font-extrabold text-white mt-1">{status.stats?.subjects || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-[18px] p-5">
              <span className="text-xs uppercase text-slate-300 font-semibold">Reference Books</span>
              <p className="text-3xl font-extrabold text-white mt-1">{status.stats?.books || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-[18px] p-5">
              <span className="text-xs uppercase text-slate-300 font-semibold">Exams Completed</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">{status.stats?.exams || 0}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subjects & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Academic Subjects</h2>
            <p className="text-sm text-slate-500">Select a subject to practice or launch a randomized assessment</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject or program..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-brand-navy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map(sub => (
            <div key={sub._id} className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm flex flex-col justify-between hover:border-brand-navy/50 transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-navy/10 text-brand-navy">
                    {sub.programOrClass || 'Academic'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {sub.questionCount || 0} MCQs • {sub.bookCount || 0} Books
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{sub.name}</h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {sub.description || 'Comprehensive question bank covering key syllabus chapters and weekly topics.'}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(\`/practice?subjectId=\${sub._id}\`)}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark"
                >
                  Practice MCQs
                </button>
                <button
                  onClick={() => navigate(\`/exam?subjectId=\${sub._id}\`)}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25"
                >
                  Start Exam
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Exam Results */}
        {recentExams.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Examination Submissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentExams.map(ex => (
                    <tr key={ex._id}>
                      <td className="py-2.5 px-3 font-medium">{ex.studentName}</td>
                      <td className="py-2.5 px-3">{ex.subjectId?.name || ex.title}</td>
                      <td className="py-2.5 px-3">{ex.summary?.obtainedMarks}/{ex.summary?.totalQuestions}</td>
                      <td className="py-2.5 px-3 font-bold">{ex.summary?.percentage}%</td>
                      <td className="py-2.5 px-3">
                        <span className={\`px-2 py-0.5 rounded text-xs font-bold \${ex.summary?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}\`}>
                          {ex.summary?.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
 * 2. SUBJECTS & BOOKS CATALOG PAGE
 * ======================================================================== */
function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d.data || []));
    fetch('/api/books').then(r => r.json()).then(d => setBooks(d.data || []));
  }, []);

  const visibleBooks = selectedSubject
    ? books.filter(b => b.subjectId?._id === selectedSubject)
    : books;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Books & Course Catalog</h1>
          <p className="text-sm text-slate-500">Filter by subject to practice book-specific chapters and weeks</p>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium"
        >
          <option value="">All Subjects ({books.length} Books)</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.programOrClass})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleBooks.map(book => (
          <div key={book._id} className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-navy mb-2">
                <span>{book.subjectId?.name || 'Subject'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {book.questionCount || 0} MCQs
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{book.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Author: <strong>{book.author || 'Academic Faculty'}</strong> • {book.programOrClass} {book.semester}
              </p>
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate(\`/practice?bookId=\${book._id}\`)}
                className="flex-1 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark"
              >
                Practice Book MCQs
              </button>
              <button
                onClick={() => navigate(\`/exam?bookId=\${book._id}\`)}
                className="flex-1 py-2 rounded-xl border border-brand-navy text-brand-navy text-xs font-bold hover:bg-brand-navy/5"
              >
                Take Book Exam
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
 * 3. INTERACTIVE PRACTICE MODE
 * ======================================================================== */
function PracticePage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qb_bookmarks') || '[]'); } catch { return []; }
  });
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    fetch(\`/api/questions?\${params.toString()}\`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions || []);
        setCurrentIndex(0);
      });
  }, [location.search]);

  const toggleBookmark = (qId) => {
    const next = bookmarks.includes(qId) ? bookmarks.filter(id => id !== qId) : [...bookmarks, qId];
    setBookmarks(next);
    localStorage.setItem('qb_bookmarks', JSON.stringify(next));
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <p className="text-lg font-semibold text-slate-700">No published questions found for this filter.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = answers[currentQ._id];
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(q => answers[q._id] === q.correctAnswer).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-[18px] p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-brand-navy">Interactive Practice Session</span>
          <p className="text-sm font-semibold text-slate-700">
            Question {currentIndex + 1} of {questions.length} • Score: {correctCount}/{answeredCount}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={instantFeedback}
            onChange={(e) => setInstantFeedback(e.target.checked)}
            className="rounded text-brand-navy"
          />
          Show Instant Answer & Explanation
        </label>
      </div>

      <QuestionCard
        index={currentIndex}
        questionObj={currentQ}
        selectedOption={selected}
        onSelectOption={(optIdx) => setAnswers(prev => ({ ...prev, [currentQ._id]: optIdx }))}
        showFeedback={instantFeedback && selected !== undefined}
        isBookmarked={bookmarks.includes(currentQ._id)}
        onToggleBookmark={toggleBookmark}
      />

      <div className="flex items-center justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex(i => i + 1)}
          className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold disabled:opacity-40"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 4. TIMED EXAMINATION & PRINTABLE A4 TRANSCRIPT
 * ======================================================================== */
function ExamPage() {
  const [subjects, setSubjects] = useState([]);
  const [config, setConfig] = useState({ subjectId: '', studentName: '', questionCount: 10, durationMinutes: 15 });
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => {
      const list = d.data || [];
      setSubjects(list);
      if (list[0]) setConfig(c => ({ ...c, subjectId: list[0]._id }));
    });
  }, []);

  useEffect(() => {
    if (!session || transcript) return;
    if (secondsLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [session, secondsLeft, transcript]);

  const startExam = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/exams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (data.success) {
      setSession(data);
      setAnswers({});
      setSecondsLeft(data.durationMinutes * 60);
    } else {
      alert(data.message || 'Could not start examination');
    }
  };

  const handleSubmitExam = async () => {
    if (!session) return;
    const res = await fetch(\`/api/exams/\${session.attemptId}/submit\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    if (data.success) setTranscript(data.data);
  };

  if (transcript) {
    const { summary, items, subjectId } = transcript;
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold">Official Examination Transcript</h1>
          <div className="flex gap-3">
            <button
              onClick={() => { setTranscript(null); setSession(null); }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
            >
              New Exam
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-navy text-white text-sm font-bold"
            >
              <Printer className="w-4 h-4" />
              Print A4 PDF
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[18px] p-8 shadow-sm print:border-black">
          <div className="flex justify-between items-start border-b-2 border-brand-navy pb-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase text-brand-navy">Academic Examination Transcript</span>
              <h2 className="text-2xl font-bold mt-1">{transcript.title}</h2>
              <p className="text-sm text-slate-600">Candidate: <strong>{transcript.studentName}</strong> • Subject: {subjectId?.name}</p>
            </div>
            <div className="text-right">
              <span className={\`px-3 py-1 rounded-full text-xs font-bold \${summary.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}\`}>
                {summary.passed ? 'PASSED' : 'FAILED'} • Grade {summary.grade}
              </span>
              <p className="text-xs text-slate-500 mt-1">{new Date(transcript.submittedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Marks</span>
              <p className="text-xl font-bold text-brand-navy">{summary.obtainedMarks}/{summary.totalQuestions}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Percentage</span>
              <p className="text-xl font-bold">{summary.percentage}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Accuracy</span>
              <p className="text-xl font-bold">{summary.accuracyRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Correct / Skipped</span>
              <p className="text-xl font-bold text-emerald-700">{summary.correct} / {summary.unanswered}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 text-sm">
            {items.map((item, idx) => (
              <div key={idx} className="py-3">
                <p className="font-semibold">{idx + 1}. {item.questionId?.question}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Your Answer: <strong>{item.selectedOption !== null ? item.questionId?.options[item.selectedOption] : 'Unanswered'}</strong> |
                  Correct: <strong className="text-emerald-700"> {item.questionId?.options[item.questionId?.correctAnswer]}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="sticky top-16 z-20 bg-white border border-slate-200 rounded-[18px] p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-brand-navy">Live Examination</span>
            <p className="text-sm font-semibold">Answered: {Object.keys(answers).length} / {session.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-mono font-bold text-base">
              {mins}:{secs < 10 ? \`0\${secs}\` : secs}
            </span>
            <button
              onClick={handleSubmitExam}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {session.questions.map((q, idx) => (
            <QuestionCard
              key={q._id}
              index={idx}
              questionObj={q}
              selectedOption={answers[q._id]}
              onSelectOption={(optIdx) => setAnswers(prev => ({ ...prev, [q._id]: optIdx }))}
              showFeedback={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-[18px] p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Configure Timed Examination</h1>
      <p className="text-sm text-slate-500 mb-6"> Randomized questions with authoritative server-side grading.</p>
      <form onSubmit={startExam} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Candidate Full Name</label>
          <input
            type="text"
            required
            value={config.studentName}
            onChange={(e) => setConfig({ ...config, studentName: e.target.value })}
            placeholder="Enter your name for the transcript"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Select Subject</label>
          <select
            value={config.subjectId}
            onChange={(e) => setConfig({ ...config, subjectId: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
          >
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.questionCount} MCQs)</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Number of Questions</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              min="1"
              max="180"
              value={config.durationMinutes}
              onChange={(e) => setConfig({ ...config, durationMinutes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-brand-navy text-white font-bold text-sm hover:bg-brand-navyDark">
          Start Official Examination
        </button>
      </form>
    </div>
  );
}

/* ==========================================================================
 * 5. SECURE ADMIN PANEL (Login, Dashboard, Subject/Book CRUD & Smart Import)
 * ======================================================================== */
function AdminPanel() {
  const [adminUser, setAdminUser] = useState(null);
  const [email, setEmail] = useState('admin@iftikharzahid.me');
  const [password, setPassword] = useState('Admin@123456');
  const [authError, setAuthError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: '', programOrClass: 'BSCS', semester: '5th' });
  const [file, setFile] = useState(null);
  const [importSubject, setImportSubject] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [preview, setPreview] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const refreshData = () => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d.data || []));
  };

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) {
          setAdminUser(d.user);
          refreshData();
        }
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setAdminUser(data.user);
      refreshData();
    } else {
      setAuthError(data.message || 'Login failed');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newSubject)
    });
    const data = await res.json();
    if (data.success) {
      setStatusMsg(\`Subject "\${data.data.name}" created!\`);
      setNewSubject({ name: '', programOrClass: 'BSCS', semester: '5th' });
      refreshData();
    } else {
      alert(data.message);
    }
  };

  const handlePreviewImport = async (e) => {
    e.preventDefault();
    if (!file || !importSubject) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subjectName', importSubject);
    const res = await fetch('/api/admin/imports/preview', { method: 'POST', credentials: 'include', body: fd });
    const data = await res.json();
    if (data.success) setPreview(data.preview);
    else alert(data.message);
  };

  const handleCommitImport = async () => {
    if (!preview) return;
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        subjectId: preview.subjectResolution?.subject?._id || null,
        createNewSubject: !preview.subjectResolution?.subject ? { name: importSubject } : null,
        bookTitle,
        questions: preview.stagedPayload,
        publishImmediately: true
      })
    });
    const data = await res.json();
    if (data.success) {
      setStatusMsg(\`Successfully imported \${data.summary.insertedCount} MCQs (\${data.summary.skippedDuplicates} duplicates skipped).\`);
      setPreview(null);
      refreshData();
    }
  };

  if (!adminUser) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 rounded-[18px] p-8 shadow-sm">
        <div className="flex items-center gap-2 text-brand-navy font-bold text-lg mb-2">
          <ShieldCheck className="w-6 h-6" />
          <span>Administrator Portal Login</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Protected by JWT & HttpOnly Session Cookies</p>
        {authError && <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{authError}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-navy text-white font-bold text-sm">
            Sign In to Admin Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-[18px] p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-xs text-slate-500">Logged in as {adminUser.email} ({adminUser.role})</p>
        </div>
        <button
          onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); setAdminUser(null); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Subject Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[18px] p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-brand-navy" /> Add Academic Subject
          </h2>
          <form onSubmit={handleCreateSubject} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Subject Name (e.g., Operating Systems)"
              value={newSubject.name}
              onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <input
              type="text"
              placeholder="Program / Class (e.g., BSCS)"
              value={newSubject.programOrClass}
              onChange={e => setNewSubject({ ...newSubject, programOrClass: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <input
              type="text"
              placeholder="Semester (e.g., 4th Semester)"
              value={newSubject.semester}
              onChange={e => setNewSubject({ ...newSubject, semester: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-navy text-white text-sm font-bold">
              Create Subject
            </button>
          </form>
        </div>

        {/* Smart File Importer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[18px] p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-navy" /> Smart Book & MCQ File Import (JSON / CSV / DOCX)
          </h2>
          <form onSubmit={handlePreviewImport} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Target Subject Name *"
                value={importSubject}
                onChange={e => setImportSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
              <input
                type="text"
                placeholder="Book Title (Optional)"
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
            </div>
            <input
              type="file"
              accept=".json,.csv,.docx"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-gold text-slate-950 font-bold text-sm">
              Validate & Preview Import
            </button>
          </form>

          {preview && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm">
              <p className="font-bold">
                File: {preview.filename} • Valid MCQs: {preview.validCount} • Duplicates: {preview.duplicateCount}
              </p>
              <p className="text-xs text-slate-600">
                Subject Match Status: <strong>{preview.subjectResolution?.status}</strong>
              </p>
              <button
                onClick={handleCommitImport}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Confirm & Publish MCQs to Database
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}
`
};

console.log('Generating Question Bank Full-Stack Project...');
for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log('Created:', relativePath);
}
console.log('\\nSUCCESS! All project files have been generated.');
console.log('Next steps:');
console.log('1. Run: npm run install:all');
console.log('2. Update backend/.env with your MongoDB Atlas URI');
console.log('3. Run: npm run seed:admin');
console.log('4. Start backend (npm run dev:backend) & frontend (npm run dev:frontend)');