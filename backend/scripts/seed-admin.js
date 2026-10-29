import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import AdminUser from '../src/models/AdminUser.js';
import Subject from '../src/models/Subject.js';
import Book from '../src/models/Book.js';
import Question from '../src/models/Question.js';

dotenv.config();

// Fix for Windows / ISP DNS resolvers failing on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if custom DNS cannot be set
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@iftikharzahid.me').toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';

  const passwordHash = await bcrypt.hash(password, 12);
  let admin = await AdminUser.findOne({ email });
  if (!admin) {
    admin = await AdminUser.create({
      name: 'Super Administrator',
      email,
      passwordHash,
      role: 'super_admin',
      isActive: true
    });
    console.log('Created Super Admin:', email);
  } else {
    admin.passwordHash = passwordHash;
    admin.isActive = true;
    admin.role = 'super_admin';
    await admin.save();
    console.log('Updated Super Admin password & status:', email);
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
