import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from '../src/models/Subject.js';
import Book from '../src/models/Book.js';
import Question from '../src/models/Question.js';

dotenv.config({ path: 'backend/.env' });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const WEEKS_SYLLABUS = [
  { weekNumber: 1, topic: 'Introduction to Visual Programming and the .NET Platform' },
  { weekNumber: 2, topic: 'Event-Driven Programming, Windows Forms GUI, Controls, Properties, Methods and Delegates' },
  { weekNumber: 3, topic: 'Events of UI Controls and Event Handlers' },
  { weekNumber: 4, topic: 'Structure of a C# Windows Application, Partial Classes, Designer Code and Dialogs' },
  { weekNumber: 5, topic: 'Common Windows Forms Controls: Label, TextBox, Multiline TextBox, Button, AutoComplete, RadioButton and CheckBox' },
  { weekNumber: 6, topic: 'ComboBox, ListBox, PictureBox, Timer and Third-Party Controls' },
  { weekNumber: 7, topic: 'Database Connectivity with C#, ADO.NET, ODBC, OLE DB, Connections, Commands, DataReader, DataAdapter and DataSet' },
  { weekNumber: 9, topic: 'CRUD Operations in Windows Forms and Debugging Database Applications' },
  { weekNumber: 10, topic: 'Resources, String Resources, Connection Strings and DataGridView CRUD' },
  { weekNumber: 11, topic: 'Windows Forms Dialogs: FontDialog, ColorDialog, OpenFileDialog and SaveFileDialog' },
  { weekNumber: 12, topic: 'Master-Detail Forms and One-to-Many CRUD Using ListView — Parts 1 and 2' },
  { weekNumber: 13, topic: 'MDI Parent Forms, Menus, Login-Based Access and XML Data' },
  { weekNumber: 14, topic: 'DLL Files, Setup Projects, Marshaling by Value and Reference, Threading and Synchronization — Part 1' },
  { weekNumber: 15, topic: 'Threading and Synchronization in C# — Part 2' }
];

const OPTION_MAP = { A: 0, B: 1, C: 2, D: 3 };

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  const jsonPath = path.resolve('backend/data/Visual_Programming_504_Normalized_MCQ_Bank_Lec_Iftikhar_Zahid.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`ERROR: JSON file not found at ${jsonPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const rawQuestions = raw.questions || [];
  console.log(`Loaded JSON with ${rawQuestions.length} questions.`);

  if (rawQuestions.length !== 504) {
    console.warn(`WARNING: Expected 504 questions, found ${rawQuestions.length}`);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected successfully!');

  const subjectId = new mongoose.Types.ObjectId('6ad2e9faf4302e6a145fd6f3');
  const bookId = new mongoose.Types.ObjectId('6ad2f5eee1dac5c428c6d8ef');

  // 1. Update/Upsert Subject
  console.log('\n[1/4] Updating Subject "Visual Programming"...');
  const subjectDoc = await Subject.findByIdAndUpdate(
    subjectId,
    {
      $set: {
        name: 'Visual Programming',
        slug: 'visual-programming',
        code: 'CS-311',
        programOrClass: 'Affiliated Colleges / Undergraduate',
        semester: '5th Semester',
        description: 'Comprehensive C# and .NET Windows Forms curriculum covering event-driven architecture, form controls, ADO.NET database connectivity, CRUD operations, dialogs, MDI parent forms, XML, and multithreading.',
        academicYear: '2026',
        language: 'en',
        status: 'published'
      },
      $inc: { contentVersion: 1 }
    },
    { new: true, upsert: true }
  );
  console.log(`✓ Subject configured: "${subjectDoc.name}" [${subjectDoc._id}] (slug: ${subjectDoc.slug})`);

  // 2. Build Chapters and Update/Upsert Book
  console.log('\n[2/4] Building 14 chapters and updating Book "Visual Programming"...');
  const chapters = WEEKS_SYLLABUS.map(w => ({
    chapterNumber: w.weekNumber,
    title: `Week ${w.weekNumber}: ${w.topic}`,
    weeks: [{ weekNumber: w.weekNumber, topic: w.topic }]
  }));

  const bookDoc = await Book.findByIdAndUpdate(
    bookId,
    {
      $set: {
        title: 'Visual Programming (C# & .NET Windows Forms)',
        subjectId: subjectId,
        author: 'Lec. Iftikhar Zahid',
        edition: '1st Edition (14-Week Syllabus Outline • 504 MCQs)',
        programOrClass: 'Affiliated Colleges / Undergraduate',
        semester: '5th Semester',
        academicYear: '2026',
        description: 'Comprehensive 504-MCQ syllabus question bank for Visual Programming (C# and .NET Windows Forms) with theory & lab coverage, prepared by Lec. Iftikhar Zahid.',
        language: 'en',
        status: 'published',
        chapters: chapters
      },
      $inc: { contentVersion: 1 }
    },
    { new: true, upsert: true }
  );
  console.log(`✓ Book configured: "${bookDoc.title}" [${bookDoc._id}] with ${bookDoc.chapters.length} chapters.`);

  // 3. Clear existing questions for Visual Programming
  console.log('\n[3/4] Purging obsolete questions for Visual Programming...');
  const deleteResult = await Question.deleteMany({
    $or: [{ subjectId: subjectId }, { bookId: bookId }]
  });
  console.log(`✓ Purged ${deleteResult.deletedCount} outdated/corrupted questions.`);

  // 4. Transform and Insert all 504 Questions
  console.log('\n[4/4] Transforming and inserting 504 MCQs...');
  const docsToInsert = rawQuestions.map(q => {
    const opts = [
      String(q.options.A || '').trim(),
      String(q.options.B || '').trim(),
      String(q.options.C || '').trim(),
      String(q.options.D || '').trim()
    ];

    const correctIdx = OPTION_MAP[q.correct_option];
    if (correctIdx === undefined) {
      throw new Error(`Invalid correct_option "${q.correct_option}" on question ID ${q.id}`);
    }

    const normText = String(q.question || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normOpts = opts.map(o => o.toLowerCase()).join('|');
    const fp = crypto
      .createHash('sha256')
      .update(`${subjectId.toString()}::${normText}::${normOpts}`)
      .digest('hex');

    return {
      question: String(q.question || '').trim(),
      options: opts,
      correctAnswer: correctIdx,
      explanation: String(q.explanation || '').trim(),
      subjectId: subjectId,
      bookId: bookId,
      chapter: `Week ${q.week}: ${q.topic}`,
      week: String(q.week),
      topic: String(q.topic || '').trim(),
      difficulty: 'medium',
      language: 'en',
      status: 'published',
      normalizedQuestion: normText,
      fingerprint: fp,
      contentVersion: 1
    };
  });

  const insertResult = await Question.insertMany(docsToInsert, { ordered: true });
  console.log(`✓ Successfully inserted ${insertResult.length} questions!`);

  // Verification checks
  console.log('\n--- VERIFICATION CHECKS ---');
  const countInDB = await Question.countDocuments({ subjectId: subjectId, bookId: bookId });
  console.log(`Questions in DB with subjectId and bookId: ${countInDB} (Expected: 504)`);

  const distinctWeeks = await Question.distinct('week', { subjectId: subjectId });
  console.log(`Distinct weeks covered: ${distinctWeeks.sort((a,b) => Number(a) - Number(b)).join(', ')} (${distinctWeeks.length} weeks)`);

  for (const w of distinctWeeks) {
    const weekCount = await Question.countDocuments({ subjectId: subjectId, week: w });
    console.log(`  Week ${w}: ${weekCount} questions`);
  }

  await mongoose.disconnect();
  console.log('\nDatabase import finished successfully!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

