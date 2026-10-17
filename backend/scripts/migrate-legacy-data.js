import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import crypto from 'crypto';
import Subject from '../src/models/Subject.js';
import Book from '../src/models/Book.js';
import Question from '../src/models/Question.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas for legacy data migration...');

  const db = mongoose.connection.db;

  // 1. Ensure Object-Oriented Programming subject has all modern fields
  let subject = await Subject.findOne({ name: /Object-Oriented Programming/i });
  if (!subject) {
    // If not found by name, check raw collection
    const rawSub = await db.collection('subjects').findOne({ name: /Object-Oriented Programming/i });
    if (rawSub) {
      await db.collection('subjects').updateOne(
        { _id: rawSub._id },
        {
          $set: {
            slug: 'object-oriented-programming',
            code: 'CS-201',
            description: 'Core concepts of OOP: Encapsulation, Inheritance, Polymorphism, and Abstraction.',
            programOrClass: 'BS Computer Science',
            semester: '3rd Semester',
            academicYear: '2026',
            language: 'en',
            status: 'published',
            contentVersion: 1
          }
        }
      );
      subject = await Subject.findById(rawSub._id);
    } else {
      subject = await Subject.create({
        name: 'Object-Oriented Programming',
        slug: 'object-oriented-programming',
        code: 'CS-201',
        description: 'Core concepts of OOP: Encapsulation, Inheritance, Polymorphism, and Abstraction.',
        programOrClass: 'BS Computer Science',
        semester: '3rd Semester',
        academicYear: '2026',
        language: 'en',
        status: 'published'
      });
    }
  } else {
    subject.slug = subject.slug || 'object-oriented-programming';
    subject.status = 'published';
    subject.programOrClass = subject.programOrClass || 'BS Computer Science';
    subject.semester = subject.semester || '3rd Semester';
    subject.academicYear = subject.academicYear || '2026';
    subject.language = subject.language || 'en';
    await subject.save();
  }
  console.log(`Updated/Verified Subject: ${subject.name} (${subject._id})`);

  // 2. Ensure a Book exists for this subject
  let book = await Book.findOne({ subjectId: subject._id });
  if (!book) {
    book = await Book.create({
      title: 'Object-Oriented Programming (Concepts & Practical MCQs)',
      subjectId: subject._id,
      programOrClass: subject.programOrClass,
      semester: subject.semester,
      academicYear: '2026',
      language: 'en',
      status: 'published',
      chapters: [
        { chapterNumber: 1, title: 'Week 1: Objects & Classes', weeks: [{ weekNumber: 1, topic: 'Classes & Objects' }] },
        { chapterNumber: 2, title: 'Week 2: Encapsulation & Constructors', weeks: [{ weekNumber: 2, topic: 'Constructors' }] },
        { chapterNumber: 3, title: 'Week 3: Inheritance', weeks: [{ weekNumber: 3, topic: 'Inheritance Types' }] },
        { chapterNumber: 4, title: 'Week 4: Polymorphism & Virtual Functions', weeks: [{ weekNumber: 4, topic: 'Polymorphism' }] }
      ]
    });
    console.log(`Created Book: ${book.title}`);
  } else {
    console.log(`Found Existing Book: ${book.title}`);
  }

  // 3. Migrate raw questions to standard schema
  const rawQuestions = await db.collection('questions').find({}).toArray();
  console.log(`Found ${rawQuestions.length} raw questions in database.`);

  let updatedCount = 0;
  for (const q of rawQuestions) {
    // Check if options is object { A: ..., B: ... } or already array
    let optionsArray = [];
    if (Array.isArray(q.options)) {
      optionsArray = q.options;
    } else if (q.options && typeof q.options === 'object') {
      const keys = ['A', 'B', 'C', 'D'];
      optionsArray = keys.map(k => q.options[k] || '').filter(Boolean);
      if (optionsArray.length < 2) {
        optionsArray = Object.values(q.options);
      }
    }

    // Convert correctAnswer from 'A'/'B'/'C'/'D' to index 0/1/2/3
    let correctIndex = q.correctAnswer;
    if (typeof correctIndex === 'string') {
      const upper = correctIndex.trim().toUpperCase();
      if (/^[A-D]$/.test(upper)) {
        correctIndex = upper.charCodeAt(0) - 65;
      } else {
        const parsed = parseInt(upper, 10);
        correctIndex = Number.isNaN(parsed) ? 0 : parsed;
      }
    }
    if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= optionsArray.length) {
      correctIndex = 0;
    }

    // Fingerprint
    const normalizedText = (q.question || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedOpts = optionsArray.map(o => String(o).trim().toLowerCase()).join('|');
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${subject._id.toString()}::${normalizedText}::${normalizedOpts}`)
      .digest('hex');

    const difficultyLower = String(q.difficulty || 'medium').toLowerCase();
    const validDifficulty = ['easy', 'medium', 'hard'].includes(difficultyLower) ? difficultyLower : 'medium';

    await db.collection('questions').updateOne(
      { _id: q._id },
      {
        $set: {
          question: q.question.trim(),
          options: optionsArray,
          correctAnswer: correctIndex,
          subjectId: subject._id,
          bookId: book._id,
          chapter: q.chapter || 'General',
          week: q.chapter && q.chapter.toLowerCase().includes('week') ? q.chapter : (q.week || ''),
          topic: q.topic || '',
          difficulty: validDifficulty,
          explanation: q.explanation || '',
          language: q.language || 'en',
          status: 'published',
          fingerprint,
          contentVersion: 1
        }
      }
    );
    updatedCount++;
  }

  console.log(`Successfully migrated and published ${updatedCount} questions!`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
