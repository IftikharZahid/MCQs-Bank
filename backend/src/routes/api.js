import express from 'express';
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

// Lightweight High-Performance In-Memory Server Cache
const SERVER_CACHE = {
  status: { data: null, expiresAt: 0 },
  subjects: { data: null, expiresAt: 0 },
  books: { data: null, expiresAt: 0 },
  invalidate() {
    this.status = { data: null, expiresAt: 0 };
    this.subjects = { data: null, expiresAt: 0 };
    this.books = { data: null, expiresAt: 0 };
  }
};

// Health Check Endpoint for Vercel / Uptime Monitoring
router.get('/health', async (req, res) => {
  const mongoose = (await import('mongoose')).default;
  const state = mongoose.connection.readyState;
  const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: state === 1 ? 'healthy' : 'degraded',
    database: stateNames[state] || 'unknown',
    databaseName: mongoose.connection.name || 'mcq_question_bank',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server'
  });
});

// 1. Preserved Legacy & Student Routes
router.get('/status', async (req, res) => {
  try {
    const isDbConnected = req.app.get('mongooseReady') || (await import('mongoose')).default.connection.readyState === 1;
    let stats = { subjects: 0, books: 0, questions: 0, exams: 0, draftQuestions: 0 };
    if (isDbConnected) {
      const [subjects, books, questions, exams, draftQuestions] = await Promise.all([
        Subject.countDocuments({ status: 'published' }).catch(() => 0),
        Book.countDocuments({ status: 'published' }).catch(() => 0),
        Question.countDocuments({ status: 'published' }).catch(() => 0),
        ExamAttempt.countDocuments({ status: 'submitted' }).catch(() => 0),
        Question.countDocuments({ status: 'draft' }).catch(() => 0)
      ]);
      stats = { subjects, books, questions, exams, draftQuestions };
    }
    res.json({
      status: 'online',
      database: isDbConnected ? 'connected' : 'connecting',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (err) {
    res.json({
      status: 'online',
      database: 'connecting',
      timestamp: new Date().toISOString(),
      stats: { subjects: 0, books: 0, questions: 0, exams: 0, draftQuestions: 0 },
      error: err.message
    });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const { search, program, language } = req.query;
    const filter = { status: 'published' };
    if (program) filter.programOrClass = program;
    if (language) filter.language = language;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [subjects, qCounts, bCounts] = await Promise.all([
      Subject.find(filter).sort({ updatedAt: -1 }).lean(),
      Question.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$subjectId', count: { $sum: 1 } } }
      ]).catch(() => []),
      Book.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$subjectId', count: { $sum: 1 } } }
      ]).catch(() => [])
    ]);

    const qCountMap = new Map(qCounts.map(item => [String(item._id), item.count]));
    const bCountMap = new Map(bCounts.map(item => [String(item._id), item.count]));

    const enriched = subjects.map(sub => ({
      ...sub,
      questionCount: qCountMap.get(String(sub._id)) || 0,
      bookCount: bCountMap.get(String(sub._id)) || 0
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error fetching subjects:', err.message);
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

router.get('/subjects/:id', async (req, res) => {
  const subject = await Subject.findById(req.params.id).lean();
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
  const [books, questionCount] = await Promise.all([
    Book.find({ subjectId: subject._id, status: 'published' }).lean(),
    Question.countDocuments({ subjectId: subject._id, status: 'published' }).catch(() => 0)
  ]);
  res.json({ success: true, data: { ...subject, books, questionCount } });
});

router.get('/books', async (req, res) => {
  try {
    const { subjectId, search } = req.query;
    const filter = { status: 'published' };
    if (subjectId) filter.subjectId = subjectId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [books, qCounts] = await Promise.all([
      Book.find(filter).populate('subjectId', 'name slug programOrClass').sort({ createdAt: -1 }).lean(),
      Question.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$bookId', count: { $sum: 1 } } }
      ]).catch(() => [])
    ]);

    const qCountMap = new Map(qCounts.map(item => [String(item._id), item.count]));
    const enriched = books.map(b => ({
      ...b,
      questionCount: qCountMap.get(String(b._id)) || 0
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error fetching books:', err.message);
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
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
  const {
    subjectId,
    bookId,
    questionCount = 10,
    durationMinutes = 15,
    passingPercentage = 50,
    studentName,
    studentClass,
    studentRollNo,
    studentInstitution
  } = req.body;
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
    title: `${subject ? subject.name : 'Academic'} Examination`,
    subjectId: sampledQuestions[0].subjectId,
    bookId: bookId || null,
    studentName: studentName || 'Candidate',
    studentClass: studentClass || '',
    studentRollNo: studentRollNo || '',
    studentInstitution: studentInstitution || '',
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
  const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('qb_admin_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/admin/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post('/admin/logout', (req, res) => {
  res.clearCookie('qb_admin_token');
  res.json({ success: true });
});

// Admin Stats
router.get('/admin/stats', requireAuth, async (req, res) => {
  const [
    totalSubjects,
    publishedSubjects,
    totalBooks,
    totalQuestions,
    publishedQuestions,
    draftQuestions,
    totalExams,
    recentExams
  ] = await Promise.all([
    Subject.countDocuments(),
    Subject.countDocuments({ status: 'published' }),
    Book.countDocuments(),
    Question.countDocuments(),
    Question.countDocuments({ status: 'published' }),
    Question.countDocuments({ status: 'draft' }),
    ExamAttempt.countDocuments({ status: 'submitted' }),
    ExamAttempt.find({ status: 'submitted' }).sort({ submittedAt: -1 }).limit(5).populate('subjectId', 'name')
  ]);

  // Aggregate questions per subject
  const subjectAgg = await Question.aggregate([
    { $group: { _id: '$subjectId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  const subjectsWithNames = await Promise.all(
    subjectAgg.map(async item => {
      const s = item._id ? await Subject.findById(item._id).select('name code programOrClass') : null;
      return { subject: s ? s.name : 'Unassigned', count: item.count, code: s?.code || '' };
    })
  );

  res.json({
    success: true,
    stats: {
      totalSubjects,
      publishedSubjects,
      totalBooks,
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      totalExams,
      subjectBreakdown: subjectsWithNames,
      recentExams
    }
  });
});

// Admin Subjects: List All (including drafts/archived)
router.get('/admin/subjects', requireAuth, async (req, res) => {
  const { search, program, status } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (program && program !== 'all') filter.programOrClass = program;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { programOrClass: { $regex: search, $options: 'i' } }
    ];
  }

  const subjects = await Subject.find(filter).sort({ updatedAt: -1 }).lean();
  const enriched = await Promise.all(subjects.map(async (sub) => {
    const [questionCount, bookCount] = await Promise.all([
      Question.countDocuments({ subjectId: sub._id }),
      Book.countDocuments({ subjectId: sub._id })
    ]);
    return { ...sub, questionCount, bookCount };
  }));

  res.json({ success: true, data: enriched });
});

// Admin Subjects: Create New
router.post('/admin/subjects', requireAuth, async (req, res) => {
  const { name, code, description, programOrClass, semester, academicYear, language, status } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Subject name is required.' });
  }
  const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let slug = baseSlug;
  const existing = await Subject.findOne({ slug });
  if (existing) {
    slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }
  const created = await Subject.create({
    name: name.trim(),
    slug,
    code: code ? code.trim() : '',
    description: description || '',
    programOrClass: programOrClass || 'General',
    semester: semester || '',
    academicYear: academicYear || '2026',
    language: language || 'en',
    status: status || 'published'
  });
  SERVER_CACHE.invalidate();
  res.status(201).json({ success: true, data: created });
});

// Admin Subjects: Update Any Subject
router.put('/admin/subjects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, programOrClass, semester, academicYear, language, status } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    if (name && name.trim() && name.trim() !== subject.name) {
      subject.name = name.trim();
      const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const collision = await Subject.findOne({ slug: baseSlug, _id: { $ne: id } });
      subject.slug = collision ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    }

    if (code !== undefined) subject.code = code.trim();
    if (description !== undefined) subject.description = description.trim();
    if (programOrClass !== undefined) subject.programOrClass = programOrClass.trim();
    if (semester !== undefined) subject.semester = semester.trim();
    if (academicYear !== undefined) subject.academicYear = academicYear.trim();
    if (language !== undefined) subject.language = language;
    if (status !== undefined) subject.status = status;

    subject.contentVersion = (subject.contentVersion || 1) + 1;
    await subject.save();
    SERVER_CACHE.invalidate();

    res.json({ success: true, message: 'Subject updated successfully', data: subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Subjects: Delete Subject
router.delete('/admin/subjects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteQuestions, cascade, force, archiveOnly } = req.query;

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    const questionCount = await Question.countDocuments({ subjectId: id });
    const bookCount = await Book.countDocuments({ subjectId: id });

    // Explicit archive-only request
    if (archiveOnly === 'true' || archiveOnly === true) {
      subject.status = 'archived';
      await subject.save();
      return res.json({
        success: true,
        archived: true,
        message: `Subject "${subject.name}" has been archived.`
      });
    }

    // Permanent delete (cascading any orphaned records)
    await Promise.all([
      Question.deleteMany({ subjectId: id }),
      Book.deleteMany({ subjectId: id }),
      Subject.findByIdAndDelete(id)
    ]);
    SERVER_CACHE.invalidate();

    res.json({
      success: true,
      deleted: true,
      message: `Subject "${subject.name}" successfully deleted (${bookCount} books and ${questionCount} questions removed).`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Books: List All
router.get('/admin/books', requireAuth, async (req, res) => {
  const { subjectId, search } = req.query;
  const filter = {};
  if (subjectId) filter.subjectId = subjectId;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const books = await Book.find(filter).populate('subjectId', 'name code programOrClass').sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(books.map(async b => {
    const questionCount = await Question.countDocuments({ bookId: b._id });
    return { ...b, questionCount };
  }));
  res.json({ success: true, data: enriched });
});

// Admin Books: Create
router.post('/admin/books', requireAuth, async (req, res) => {
  const { title, subjectId, author, edition, programOrClass, semester, language, status, description } = req.body;
  if (!title || !title.trim() || !subjectId) {
    return res.status(400).json({ success: false, message: 'Book title and subject are required.' });
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return res.status(404).json({ success: false, message: 'Selected subject not found.' });
  }

  const cleanTitle = title.trim();
  const escapedTitle = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existing = await Book.findOne({
    subjectId,
    title: new RegExp(`^${escapedTitle}$`, 'i')
  });

  if (existing) {
    return res.status(400).json({ success: false, message: `A book titled "${cleanTitle}" already exists for this subject.` });
  }

  const book = await Book.create({
    title: cleanTitle,
    subjectId,
    author: author ? author.trim() : (subject.name ? `${subject.name} Faculty` : 'Academic Faculty'),
    edition: edition ? edition.trim() : 'Standard Edition',
    programOrClass: programOrClass || subject.programOrClass || 'General',
    semester: semester || subject.semester || '',
    academicYear: subject.academicYear || '2026',
    language: language || subject.language || 'en',
    status: status || 'published',
    description: description ? description.trim() : ''
  });
  SERVER_CACHE.invalidate();
  res.status(201).json({ success: true, message: `Book "${book.title}" created successfully.`, data: book });
});

// Admin Books: Update
router.put('/admin/books/:id', requireAuth, async (req, res) => {
  try {
    const { title, subjectId, author, edition, programOrClass, semester, language, status, description } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (title && title.trim()) book.title = title.trim();
    if (subjectId) book.subjectId = subjectId;
    if (author !== undefined) book.author = author.trim();
    if (edition !== undefined) book.edition = edition.trim();
    if (programOrClass !== undefined) book.programOrClass = programOrClass.trim();
    if (semester !== undefined) book.semester = semester.trim();
    if (language !== undefined) book.language = language;
    if (status !== undefined) book.status = status;
    if (description !== undefined) book.description = description.trim();
    book.contentVersion = (book.contentVersion || 1) + 1;

    await book.save();
    SERVER_CACHE.invalidate();
    res.json({ success: true, message: `Book "${book.title}" updated successfully.`, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Books: Delete
router.delete('/admin/books/:id', requireAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    await Question.updateMany({ bookId: req.params.id }, { $unset: { bookId: 1 } });
    SERVER_CACHE.invalidate();
    res.json({ success: true, message: `Book "${book.title}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Questions: List All with Filters
router.get('/admin/questions', requireAuth, async (req, res) => {
  const { subjectId, bookId, status, difficulty, language, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (subjectId) filter.subjectId = subjectId;
  if (bookId) filter.bookId = bookId;
  if (status && status !== 'all') filter.status = status;
  if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
  if (language && language !== 'all') filter.language = language;
  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { chapter: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } }
    ];
  }

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate('subjectId', 'name code')
      .populate('bookId', 'title')
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Question.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: questions,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
  });
});

// Admin Questions: Create Single
router.post('/admin/questions', requireAuth, async (req, res) => {
  const norm = normalizeQuestionRecord(req.body, 0);
  if (!norm.valid) return res.status(400).json({ success: false, message: norm.errors.join(' ') });
  const created = await Question.create({
    ...norm.data,
    subjectId: req.body.subjectId,
    bookId: req.body.bookId || undefined,
    status: req.body.status || 'published'
  });
  SERVER_CACHE.invalidate();
  res.status(201).json({ success: true, data: created });
});

// Admin Questions: Update Single
router.put('/admin/questions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Question.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Question not found' });

    const norm = normalizeQuestionRecord({ ...existing.toObject(), ...req.body }, 0);
    if (!norm.valid) return res.status(400).json({ success: false, message: norm.errors.join(' ') });

    Object.assign(existing, norm.data);
    if (req.body.subjectId) existing.subjectId = req.body.subjectId;
    if (req.body.bookId !== undefined) existing.bookId = req.body.bookId || null;
    if (req.body.status) existing.status = req.body.status;
    existing.contentVersion = (existing.contentVersion || 1) + 1;

    await existing.save();
    SERVER_CACHE.invalidate();
    res.json({ success: true, data: existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Questions: Delete Single
router.delete('/admin/questions/:id', requireAuth, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    SERVER_CACHE.invalidate();
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Imports: File Preview (JSON, CSV, DOCX)
router.post('/admin/imports/preview', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { subjectName, programOrClass } = req.body;
    const { rawQuestions, metadata = {}, requiresDraftReview } = await parseUploadedFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    const effectiveSubject = subjectName || metadata.subject;
    const effectiveProgram = programOrClass || metadata.programOrClass;
    const subjectResolution = await resolveSubjectMatch(effectiveSubject, effectiveProgram);
    const validatedRecords = rawQuestions.map((q, idx) => normalizeQuestionRecord(q, idx));
    const validQuestions = validatedRecords.filter(r => r.valid).map(r => r.data);
    const errorReport = validatedRecords.filter(r => !r.valid).flatMap(r => r.errors);

    let duplicateCount = 0;
    if (subjectResolution.subject) {
      const sId = subjectResolution.subject._id.toString();
      const fingerprints = validQuestions.map(q =>
        crypto.createHash('sha256')
          .update(`${sId}::${q.question.trim().toLowerCase().replace(/\s+/g, ' ')}::${q.options.map(o => o.toLowerCase()).join('|')}`)
          .digest('hex')
      );
      duplicateCount = await Question.countDocuments({ fingerprint: { $in: fingerprints } });
    }

    res.json({
      success: true,
      preview: {
        filename: req.file.originalname,
        metadata,
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

// Admin Imports: Direct Raw JSON Payload Preview
router.post('/admin/imports/json', requireAuth, async (req, res) => {
  try {
    const { jsonContent, subjectName, programOrClass } = req.body;
    if (!jsonContent) return res.status(400).json({ success: false, message: 'No JSON content provided.' });

    let parsedData;
    if (typeof jsonContent === 'string') {
      parsedData = JSON.parse(jsonContent);
    } else {
      parsedData = jsonContent;
    }

    let rawQuestions = [];
    let metadata = {};
    if (Array.isArray(parsedData)) {
      rawQuestions = parsedData;
      const firstWithBook = parsedData.find(item => item && (item.book || item.bookTitle || item.bookName || item.Book));
      const firstWithSubject = parsedData.find(item => item && (item.subject || item.subjectName || item.course || item.Subject));
      const firstWithProgram = parsedData.find(item => item && (item.programOrClass || item.program || item.Program));
      const firstWithSemester = parsedData.find(item => item && (item.semester || item.Semester));
      metadata = {
        subject: firstWithSubject ? (firstWithSubject.subject || firstWithSubject.subjectName || firstWithSubject.course || firstWithSubject.Subject) : null,
        book: firstWithBook ? (firstWithBook.book || firstWithBook.bookTitle || firstWithBook.bookName || firstWithBook.Book) : null,
        programOrClass: firstWithProgram ? (firstWithProgram.programOrClass || firstWithProgram.program || firstWithProgram.Program) : null,
        semester: firstWithSemester ? (firstWithSemester.semester || firstWithSemester.Semester) : null
      };
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      rawQuestions = parsedData.questions || parsedData.mcqs || parsedData.data || parsedData.items || [];
      metadata = {
        subject: parsedData.subject || parsedData.subjectName || parsedData.course || null,
        book: parsedData.book || parsedData.bookTitle || parsedData.bookName || null,
        programOrClass: parsedData.programOrClass || parsedData.program || null,
        semester: parsedData.semester || null
      };
    }

    const effectiveSubject = subjectName || metadata.subject;
    const effectiveProgram = programOrClass || metadata.programOrClass;
    const subjectResolution = await resolveSubjectMatch(effectiveSubject, effectiveProgram);
    const validatedRecords = rawQuestions.map((q, idx) => normalizeQuestionRecord(q, idx));
    const validQuestions = validatedRecords.filter(r => r.valid).map(r => r.data);
    const errorReport = validatedRecords.filter(r => !r.valid).flatMap(r => r.errors);

    let duplicateCount = 0;
    if (subjectResolution.subject) {
      const sId = subjectResolution.subject._id.toString();
      const fingerprints = validQuestions.map(q =>
        crypto.createHash('sha256')
          .update(`${sId}::${q.question.trim().toLowerCase().replace(/\s+/g, ' ')}::${q.options.map(o => o.toLowerCase()).join('|')}`)
          .digest('hex')
      );
      duplicateCount = await Question.countDocuments({ fingerprint: { $in: fingerprints } });
    }

    res.json({
      success: true,
      preview: {
        filename: 'direct-json-payload.json',
        metadata,
        totalParsed: rawQuestions.length,
        validCount: validQuestions.length,
        invalidCount: errorReport.length,
        duplicateCount,
        requiresDraftReview: false,
        subjectResolution,
        errors: errorReport.slice(0, 30),
        stagedPayload: validQuestions
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: `JSON Parse Error: ${err.message}` });
  }
});

// Admin Upload / Commit MCQs to Database
router.post('/upload', requireAuth, async (req, res) => {
  const {
    subjectId,
    createNewSubject,
    bookId,
    bookTitle,
    bookAuthor,
    bookEdition,
    questions = [],
    publishImmediately = true,
    randomizeOptions = true
  } = req.body;

  let targetSubjectId = subjectId;

  if (!targetSubjectId && createNewSubject?.name) {
    const slug = createNewSubject.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const createdSub = await Subject.create({
      name: createNewSubject.name.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      code: createNewSubject.code || '',
      programOrClass: createNewSubject.programOrClass || 'General',
      semester: createNewSubject.semester || '',
      academicYear: createNewSubject.academicYear || '2026',
      language: createNewSubject.language || 'en',
      status: 'published'
    });
    targetSubjectId = createdSub._id;
  }

  if (!targetSubjectId) {
    return res.status(400).json({ success: false, message: 'Please select an existing subject or provide a new subject name.' });
  }

  const targetSubject = await Subject.findById(targetSubjectId);
  if (!targetSubject) {
    return res.status(404).json({ success: false, message: 'Target subject could not be found.' });
  }

  // 1. Resolve Target Book
  let targetBook = null;
  if (bookId) {
    targetBook = await Book.findById(bookId);
  }

  const cleanBookTitle = (bookTitle && typeof bookTitle === 'string') ? bookTitle.trim() : '';

  if (!targetBook && cleanBookTitle) {
    const escapedTitle = cleanBookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    targetBook = await Book.findOne({
      subjectId: targetSubjectId,
      title: new RegExp(`^${escapedTitle}$`, 'i')
    });

    if (!targetBook) {
      targetBook = await Book.create({
        title: cleanBookTitle,
        subjectId: targetSubjectId,
        author: bookAuthor ? bookAuthor.trim() : (targetSubject.name ? `${targetSubject.name} Faculty` : 'Academic Faculty'),
        edition: bookEdition ? bookEdition.trim() : 'Standard Edition',
        programOrClass: targetSubject.programOrClass || 'General',
        semester: targetSubject.semester || '',
        academicYear: targetSubject.academicYear || '2026',
        language: targetSubject.language || 'en',
        status: 'published'
      });
    } else {
      targetBook.status = 'published';
      if (bookAuthor && !targetBook.author) targetBook.author = bookAuthor.trim();
      if (bookEdition && !targetBook.edition) targetBook.edition = bookEdition.trim();
      targetBook.contentVersion = (targetBook.contentVersion || 1) + 1;
      await targetBook.save();
    }
  }

  // If still no targetBook, check if questions array contains a book title
  if (!targetBook) {
    const detectedInQuestions = questions.find(q => q && (q.book || q.bookTitle || q.bookName));
    const detectedTitle = detectedInQuestions ? (detectedInQuestions.book || detectedInQuestions.bookTitle || detectedInQuestions.bookName) : '';
    if (detectedTitle && typeof detectedTitle === 'string' && detectedTitle.trim()) {
      const escapedDetected = detectedTitle.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      targetBook = await Book.findOne({
        subjectId: targetSubjectId,
        title: new RegExp(`^${escapedDetected}$`, 'i')
      });
      if (!targetBook) {
        targetBook = await Book.create({
          title: detectedTitle.trim(),
          subjectId: targetSubjectId,
          author: targetSubject.name ? `${targetSubject.name} Faculty` : 'Academic Faculty',
          edition: 'Standard Edition',
          programOrClass: targetSubject.programOrClass || 'General',
          semester: targetSubject.semester || '',
          academicYear: targetSubject.academicYear || '2026',
          language: targetSubject.language || 'en',
          status: 'published'
        });
      }
    }
  }

  // If STILL no targetBook, find existing published book for this subject or auto-create reference syllabus book
  if (!targetBook) {
    targetBook = await Book.findOne({ subjectId: targetSubjectId, status: 'published' });
    if (!targetBook) {
      targetBook = await Book.create({
        title: `${targetSubject.name} Reference Textbook`,
        subjectId: targetSubjectId,
        author: 'Academic Curriculum',
        edition: '2026 Edition',
        programOrClass: targetSubject.programOrClass || 'General',
        semester: targetSubject.semester || '',
        academicYear: targetSubject.academicYear || '2026',
        language: targetSubject.language || 'en',
        status: 'published'
      });
    }
  }

  // 2. Insert questions & link to targetBook
  let insertedCount = 0;
  let skippedDuplicates = 0;
  let linkedExistingCount = 0;

  for (const rawQ of questions) {
    const norm = normalizeQuestionRecord(rawQ, 0, { randomize: Boolean(randomizeOptions) });
    if (!norm.valid) continue;

    const normalizedText = norm.data.question.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedOpts = (norm.data.options || []).map(o => String(o).trim().toLowerCase()).join('|');
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${targetSubjectId.toString()}::${normalizedText}::${normalizedOpts}`)
      .digest('hex');

    try {
      await Question.create({
        ...norm.data,
        subjectId: targetSubjectId,
        bookId: targetBook ? targetBook._id : undefined,
        status: publishImmediately ? 'published' : 'draft',
        fingerprint,
        normalizedQuestion: normalizedText
      });
      insertedCount++;
    } catch (err) {
      if (err.code === 11000) {
        skippedDuplicates++;
        // If question already existed in this subject, link its bookId to targetBook
        if (targetBook) {
          const updateRes = await Question.updateOne(
            { fingerprint },
            { $set: { bookId: targetBook._id, status: publishImmediately ? 'published' : 'draft' } }
          );
          if (updateRes.modifiedCount > 0) {
            linkedExistingCount++;
          }
        }
      }
    }
  }

  SERVER_CACHE.invalidate();

  res.status(201).json({
    success: true,
    summary: {
      subjectId: targetSubjectId,
      bookId: targetBook?._id,
      bookTitle: targetBook?.title,
      insertedCount,
      skippedDuplicates,
      linkedExistingCount,
      totalSubmitted: questions.length,
      status: publishImmediately ? 'published' : 'draft'
    }
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

// 5. Mobile App Download & Metadata Endpoint
const OFFICIAL_APK_DOWNLOAD_URL = 'https://github.com/IftikharZahid/MCQs-Bank/releases/latest/download/app-debug.apk';

router.get('/downloads/mcqs-bank.apk', (req, res) => {
  res.redirect(OFFICIAL_APK_DOWNLOAD_URL);
});

router.get('/downloads/info', (req, res) => {
  res.json({
    success: true,
    appName: 'MCQs Bank',
    packageName: 'com.ZahidCodes.mcqsBank',
    versionName: '1.0',
    versionCode: 2,
    fileSize: '~18.4 MB',
    minSdk: 24,
    targetSdk: 36,
    downloadUrl: OFFICIAL_APK_DOWNLOAD_URL
  });
});

export default router;
