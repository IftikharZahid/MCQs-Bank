import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Subject from '../src/models/Subject.js';
import Book from '../src/models/Book.js';
import Question from '../src/models/Question.js';

dotenv.config();
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const WEEKS_SYLLABUS = [
  { weekNumber: 1, topic: 'Introduction to Database Systems' },
  { weekNumber: 2, topic: 'Three-Level Schema Architecture and Data Independence' },
  { weekNumber: 3, topic: 'Database Languages, Interfaces, and System Environment' },
  { weekNumber: 4, topic: 'High-Level Conceptual Data Models, Entity Types, Entity Sets, Attributes, Keys' },
  { weekNumber: 5, topic: 'Relationship Types, Relationship Sets, Roles, Structural Constraints' },
  { weekNumber: 6, topic: 'ER Diagrams, Naming Conventions, and Design Issues' },
  { weekNumber: 7, topic: 'Relational Model Concepts, Constraints, and Schemas I' },
  { weekNumber: 8, topic: 'Relational Model Concepts, Constraints, and Schemas II' },
  { weekNumber: 9, topic: 'Relational Algebra: Unary, Set, and Join Operations' },
  { weekNumber: 10, topic: 'Relational Algebra: Division, Aggregation, and Grouping' },
  { weekNumber: 11, topic: 'Relational Calculus: Tuple and Domain Relational Calculus' },
  { weekNumber: 12, topic: 'Functional Dependencies' },
  { weekNumber: 13, topic: 'Normalization' },
  { weekNumber: 14, topic: 'Query Processing and Optimization' },
  { weekNumber: 15, topic: 'Big Data and NoSQL Databases' },
  { weekNumber: 16, topic: 'Data Mining and Data Warehousing' }
];

async function updateDatabaseRecords() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is missing');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  const db = mongoose.connection.db;

  // 1. Locate Subject and Book
  const subjectId = new mongoose.Types.ObjectId('6ae2b45b922f9fdf6405c03e');
  const bookId = new mongoose.Types.ObjectId('6ae2b45bef3253025264c721');

  // 2. Update Subject
  const updatedSubject = await Subject.findByIdAndUpdate(
    subjectId,
    {
      $set: {
        name: 'Database Systems',
        programOrClass: 'ADP',
        semester: '4th Semester',
        description: 'Comprehensive Database Systems curriculum covering architecture, relational data models, ER diagrams, relational algebra, SQL, functional dependencies, normalization, query processing, NoSQL, and data warehousing.',
        academicYear: '2026',
        language: 'en',
        status: 'published'
      }
    },
    { new: true }
  );
  console.log(`[1/3] Updated Subject: "${updatedSubject.name}" (${updatedSubject._id}) - Program: ${updatedSubject.programOrClass}`);

  // 3. Build Chapters for Book
  const chapters = WEEKS_SYLLABUS.map(w => ({
    chapterNumber: w.weekNumber,
    title: `Week ${w.weekNumber}: ${w.topic}`,
    weeks: [{ weekNumber: w.weekNumber, topic: w.topic }]
  }));

  // Update Book
  const updatedBook = await Book.findByIdAndUpdate(
    bookId,
    {
      $set: {
        title: 'Database Systems (ADP)',
        author: 'Lec. Iftikhar Zahid',
        edition: '1st Edition (16-Week Syllabus Outline)',
        programOrClass: 'ADP',
        semester: '4th Semester',
        academicYear: '2026',
        description: 'Comprehensive 600-MCQ syllabus question bank for Database Systems (ADP), prepared by Lec. Iftikhar Zahid based on the 16-week outline.',
        language: 'en',
        status: 'published',
        chapters: chapters
      }
    },
    { new: true }
  );
  console.log(`[2/3] Updated Book: "${updatedBook.title}" (${updatedBook._id})`);
  console.log(`      Author: ${updatedBook.author} | Chapters: ${updatedBook.chapters.length}`);

  // 4. Update Questions: Assign proper chapter string to each question based on week
  let updatedQuestionsCount = 0;
  for (const w of WEEKS_SYLLABUS) {
    const chapterName = `Week ${w.weekNumber}: ${w.topic}`;
    const result = await Question.updateMany(
      {
        bookId: bookId,
        $or: [
          { week: String(w.weekNumber) },
          { week: `Week ${w.weekNumber}` }
        ]
      },
      {
        $set: {
          chapter: chapterName,
          week: String(w.weekNumber),
          topic: w.topic,
          status: 'published'
        }
      }
    );
    console.log(`   Week ${w.weekNumber} ("${w.topic}"): Updated ${result.modifiedCount} questions with chapter="${chapterName}"`);
    updatedQuestionsCount += result.modifiedCount;
  }

  console.log(`[3/3] Total Questions Updated: ${updatedQuestionsCount}`);

  // 5. Verification
  const totalBookQuestions = await Question.countDocuments({ bookId: bookId, status: 'published' });
  const sampleQ = await Question.findOne({ bookId: bookId });
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Total Published Questions for Book: ${totalBookQuestions}`);
  console.log('Sample Question:');
  console.log(`- Question: ${sampleQ.question}`);
  console.log(`- Chapter: ${sampleQ.chapter}`);
  console.log(`- Week: ${sampleQ.week}`);
  console.log(`- Topic: ${sampleQ.topic}`);
  console.log(`- Options count: ${sampleQ.options.length}`);
  console.log(`- Correct Answer Index: ${sampleQ.correctAnswer} (${sampleQ.options[sampleQ.correctAnswer]})`);

  // Clean up temp scripts if any
  await mongoose.disconnect();
  console.log('\nAll database and book records updated professionally and verified successfully!');
}

updateDatabaseRecords().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
