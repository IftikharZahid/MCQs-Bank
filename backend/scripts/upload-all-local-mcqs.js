import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mammoth from 'mammoth';

import Subject from '../src/models/Subject.js';
import Book from '../src/models/Book.js';
import Question from '../src/models/Question.js';
import { normalizeQuestionRecord } from '../src/services/importService.js';

dotenv.config({ path: 'backend/.env' });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const CLUSTER_NEW = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

// Helper to upsert a batch of questions using fingerprint deduplication
async function upsertQuestionsBatch(db, questions, subjectId, bookId, defaultTopic, defaultWeek) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < questions.length; i++) {
    const raw = questions[i];
    const normalized = normalizeQuestionRecord(raw, i);
    if (!normalized.valid) {
      skipped++;
      continue;
    }

    const d = normalized.data;
    const qText = d.question;
    const opts = d.options;
    const ans = d.correctAnswer;
    const expl = d.explanation || '';
    const top = d.topic || defaultTopic || '';
    const wk = d.week || defaultWeek || '';
    const chap = d.chapter || '';
    const diff = d.difficulty || 'medium';
    const lang = d.language || 'en';

    const normalizedText = qText.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedOpts = (opts || []).map(o => String(o).trim().toLowerCase()).join('|');
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${subjectId.toString()}::${normalizedText}::${normalizedOpts}`)
      .digest('hex');

    const updateDoc = {
      $set: {
        question: qText,
        options: opts,
        correctAnswer: ans,
        explanation: expl,
        subjectId: subjectId,
        bookId: bookId,
        topic: top,
        week: wk,
        chapter: chap,
        difficulty: diff,
        language: lang,
        status: 'published',
        normalizedQuestion: normalizedText,
        contentVersion: 1
      },
      $setOnInsert: {
        fingerprint: fingerprint,
        createdAt: new Date()
      }
    };

    try {
      const res = await db.collection('questions').updateOne(
        { fingerprint: fingerprint },
        updateDoc,
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    } catch (err) {
      // If duplicate key error on fingerprint, ignore
      skipped++;
    }
  }

  return { inserted, updated, skipped, total: questions.length };
}

async function runUpload() {
  console.log('====================================================');
  console.log('   UPLOADING ALL LOCAL MCQS TO MONGODB ATLAS');
  console.log('====================================================\n');

  console.log('Connecting to Primary MongoDB Atlas (mcqsbank-db)...');
  await mongoose.connect(CLUSTER_NEW);
  console.log('Connected to Primary DB successfully!\n');
  const db = mongoose.connection.db;

  // ----------------------------------------------------
  // 1. THEORY OF AUTOMATA
  // ----------------------------------------------------
  console.log('>>> [1/5] Processing "Theory of Automata"...');
  let automataSubject = await Subject.findOne({ slug: 'theory-of-automata' });
  if (!automataSubject) {
    automataSubject = await Subject.create({
      name: 'Theory of Automata',
      slug: 'theory-of-automata',
      code: 'CS-302',
      programOrClass: 'BS Computer Science',
      semester: '4th Semester',
      description: 'Formal languages, grammars, regular expressions, finite automata (DFA/NFA), transition graphs, Kleene theorem, and pushdown automata.',
      academicYear: '2026',
      language: 'en',
      status: 'published'
    });
    console.log('  Created Subject "Theory of Automata"');
  }

  let automataBook = await Book.findOne({ subjectId: automataSubject._id });
  if (!automataBook) {
    automataBook = await Book.create({
      title: 'Theory of Automata (Formal Languages & Automata Theory)',
      subjectId: automataSubject._id,
      programOrClass: 'BS Computer Science',
      semester: '4th Semester',
      author: 'Lec. Iftikhar Zahid',
      edition: '1st Edition • Comprehensive Normalized MCQ Bank',
      academicYear: '2026',
      language: 'en',
      status: 'published',
      chapters: [
        { chapterNumber: 1, title: 'Week 1: Languages, Alphabet, Strings & Recursive Definitions', weeks: [{ weekNumber: 1, topic: 'Formal Languages & Alphabets' }] },
        { chapterNumber: 2, title: 'Week 2: Regular Expressions & Regular Languages', weeks: [{ weekNumber: 2, topic: 'Regular Expressions & Pattern Matching' }] },
        { chapterNumber: 3, title: 'Week 3: Finite Automata & Kleene\'s Theorem', weeks: [{ weekNumber: 3, topic: 'Deterministic & Non-Deterministic Finite Automata' }] }
      ]
    });
    console.log('  Created Book for Theory of Automata');
  }

  const automataFiles = [
    {
      file: 'C:/Users/USER/Downloads/BS - 4/Lectures/Theory of Automata/Week 01/Theory_of_Automata_Week_01_Normalized_MCQ_Question_Bank_Lec_Iftikhar_Zahid.json',
      week: '1',
      topic: 'Languages, Alphabet, Strings & Recursive Definitions'
    },
    {
      file: 'C:/Users/USER/Downloads/BS - 4/Lectures/Theory of Automata/Week 02/Theory_of_Automata_Week_02_Normalized_MCQ_Question_Bank_Lec_Iftikhar_Zahid.json',
      week: '2',
      topic: 'Regular Expressions & Regular Languages'
    },
    {
      file: 'C:/Users/USER/Downloads/BS - 4/Lectures/Theory of Automata/Week 03/Theory_of_Automata_Week_03_Normalized_MCQ_Question_Bank_Lec_Iftikhar_Zahid.json',
      week: '3',
      topic: 'Finite Automata & Kleene\'s Theorem'
    }
  ];

  for (const item of automataFiles) {
    if (fs.existsSync(item.file)) {
      const data = JSON.parse(fs.readFileSync(item.file, 'utf8'));
      const qList = data.questions || [];
      const res = await upsertQuestionsBatch(db, qList, automataSubject._id, automataBook._id, item.topic, item.week);
      console.log(`  Uploaded Week ${item.week} (${qList.length} MCQs): ${res.inserted} inserted, ${res.updated} updated.`);
    }
  }

  // ----------------------------------------------------
  // 2. COMPUTER NETWORKS (ADP 3rd Semester)
  // ----------------------------------------------------
  console.log('\n>>> [2/5] Processing "Computer Networks" (from local docx banks)...');
  let netSubject = await Subject.findOne({ slug: 'computer-networks' });
  if (!netSubject) {
    netSubject = await Subject.create({
      name: 'Computer Networks',
      slug: 'computer-networks',
      code: 'CS-304',
      programOrClass: 'Associate Degree Program (ADP)',
      semester: '3rd Semester',
      description: 'Data communication, network criteria, physical topologies (mesh, star, bus, ring, hybrid), LAN/MAN/WAN, OSI & TCP/IP models, transmission media, and protocols.',
      academicYear: '2026',
      language: 'en',
      status: 'published'
    });
    console.log('  Created Subject "Computer Networks"');
  }

  let netBook = await Book.findOne({ subjectId: netSubject._id });
  if (!netBook) {
    netBook = await Book.create({
      title: 'Computer Networks (Data Communication & Network Architectures)',
      subjectId: netSubject._id,
      programOrClass: 'Associate Degree Program (ADP)',
      semester: '3rd Semester',
      author: 'Lec. Iftikhar Zahid',
      edition: '1st Edition (Forouzan Aligned • Exam-Oriented Notes)',
      academicYear: '2026',
      language: 'en',
      status: 'published',
      chapters: [
        { chapterNumber: 1, title: 'Week 1: Introduction to Data Communication & Digital Representation', weeks: [{ weekNumber: 1, topic: 'Data Communication, Characteristics, Media, and Flow' }] },
        { chapterNumber: 2, title: 'Week 2: Introduction to Computer Networks & Physical Topologies', weeks: [{ weekNumber: 2, topic: 'Network Criteria, Topologies, LAN/MAN/WAN, and Standards' }] }
      ]
    });
    console.log('  Created Book for Computer Networks');
  }

  // Parse Week 01 Docx
  const netDocx1 = 'C:/Users/USER/Downloads/ADP-3/Computer_Networks_Week_01_ADP_Lecture_and_MCQ_Bank.docx';
  if (fs.existsSync(netDocx1)) {
    const r1 = await mammoth.extractRawText({ path: netDocx1 });
    const text1 = r1.value;

    // Parse answer key
    const keyIdx = text1.indexOf('Correct option');
    const keyMap = {};
    if (keyIdx !== -1) {
      const keyMatches = [...text1.substring(keyIdx).matchAll(/(\d+)\s+([A-D])\./g)];
      for (const m of keyMatches) {
        keyMap[m[1]] = m[2];
      }
    }

    const qMatches1 = [...text1.matchAll(/(\d+)\.\s+([^\n]+(?:\n(?!\s*[A-D]\.)[^\n]+)*)\n\s*A\.\s*([^\n\t]+?)\s{2,}B\.\s*([^\n\t]+?)\s{2,}C\.\s*([^\n\t]+?)\s{2,}D\.\s*([^\n]+)/g)];
    const q1List = [];
    for (const m of qMatches1) {
      const num = m[1];
      const qText = m[2].trim();
      const opts = [m[3].trim(), m[4].trim(), m[5].trim(), m[6].trim()];
      const letter = keyMap[num] || 'A';
      q1List.push({
        question: qText,
        options: opts,
        correctAnswer: letter,
        week: '1',
        topic: 'Introduction to Data Communication'
      });
    }

    const res1 = await upsertQuestionsBatch(db, q1List, netSubject._id, netBook._id, 'Introduction to Data Communication', '1');
    console.log(`  Uploaded Week 1 (${q1List.length} MCQs): ${res1.inserted} inserted, ${res1.updated} updated.`);
  }

  // Parse Week 02 Docx
  const netDocx2 = 'C:/Users/USER/Downloads/ADP-3/Computer_Networks_Week_02_ADP_Lecture_Solved_MCQs.docx';
  if (fs.existsSync(netDocx2)) {
    const r2 = await mammoth.extractRawText({ path: netDocx2 });
    const text2 = r2.value;
    const startIdx2 = text2.indexOf('10. Exam-Oriented MCQ Bank');
    const mcqPart2 = startIdx2 !== -1 ? text2.substring(startIdx2) : text2;

    const pattern2 = /(?:^|\n)\s*(\d+)\.\s+([^\n]+(?:\n(?!\s*[A-D]\.|\s*Correct answer:)[^\n]+)*)\n\s*A\.\s*([^\n\t]+?)\s{2,}B\.\s*([^\n\t]+?)\s{2,}C\.\s*([^\n\t]+?)\s{2,}D\.\s*([^\n\t]+?)\n\s*Correct answer:\s*([A-D])\.\s*([^|\n]+)(?:\s*\|\s*Explanation:\s*([^\n]+))?/gi;
    let match2;
    const q2List = [];
    while ((match2 = pattern2.exec(mcqPart2)) !== null) {
      q2List.push({
        question: match2[2].trim(),
        options: [match2[3].trim(), match2[4].trim(), match2[5].trim(), match2[6].trim()],
        correctAnswer: match2[7].toUpperCase(),
        explanation: match2[9] ? match2[9].trim() : '',
        week: '2',
        topic: 'Network Criteria, Physical Topologies, and Categories'
      });
    }

    const res2 = await upsertQuestionsBatch(db, q2List, netSubject._id, netBook._id, 'Network Criteria & Topologies', '2');
    console.log(`  Uploaded Week 2 (${q2List.length} MCQs): ${res2.inserted} inserted, ${res2.updated} updated.`);
  }

  // ----------------------------------------------------
  // 3. COMPUTER ARCHITECTURE AND ORGANIZATION (Full 600 Bank)
  // ----------------------------------------------------
  console.log('\n>>> [3/5] Processing "Computer Architecture and Organization" (Full 600 MCQs)...');
  const caSub = await Subject.findOne({ name: /COMPUTER ARCHITECTURE AND ORGANIZATION/i });
  const caBook = caSub ? await Book.findOne({ subjectId: caSub._id }) : null;

  const ca600Path = 'C:/Users/USER/Downloads/BS - 4/Lectures/Computer Architecture and Organization/Computer_Architecture_600_MCQ_Syllabus_Aligned_Lec_Iftikhar_Zahid.json';
  if (caSub && caBook && fs.existsSync(ca600Path)) {
    const rawCA = JSON.parse(fs.readFileSync(ca600Path, 'utf8'));
    const caList = rawCA.questions || [];
    const resCA = await upsertQuestionsBatch(db, caList, caSub._id, caBook._id, 'Computer Architecture Syllabus Coverage', '1');
    console.log(`  Uploaded Computer Architecture (${caList.length} MCQs): ${resCA.inserted} inserted, ${resCA.updated} updated.`);
  }

  // ----------------------------------------------------
  // 4. OBJECT-ORIENTED PROGRAMMING (Weeks 1, 2, 3, 4, 5)
  // ----------------------------------------------------
  console.log('\n>>> [4/5] Processing "Object-Oriented Programming" (Weeks 1 to 5)...');
  const oopSub = await Subject.findOne({ name: /Object-Oriented Programming/i });
  const oopBook = oopSub ? await Book.findOne({ subjectId: oopSub._id }) : null;

  if (oopSub && oopBook) {
    const oopFiles = [
      { file: 'C:/Users/USER/Downloads/BS-2/oop_bscs_week01_normalized.json', week: '1', topic: 'Structured vs Object-Oriented Programming' },
      { file: 'C:/Users/USER/Downloads/BS-2/OOP_BSCS_Week_02_MCQs_Normalized.json', week: '2', topic: 'Object-Oriented Analysis & Classes' },
      { file: 'C:/Users/USER/Downloads/BS-2/OOP_BSCS_Week_03_MCQs_Normalized.json', week: '3', topic: 'Classes, Objects, Methods & Encapsulation' },
      { file: 'C:/Users/USER/Downloads/BS-2/OOP_Week_4_MCQs_Question_Bank.json', week: '4', topic: 'Constructors, Destructors & Memory Management' },
      { file: 'C:/Users/USER/Downloads/BS-2/OOP_BSCS_Week_05_MCQs_Normalized.json', week: '5', topic: 'Properties, Access Modifiers & Class Relationships' }
    ];

    for (const item of oopFiles) {
      if (fs.existsSync(item.file)) {
        const raw = JSON.parse(fs.readFileSync(item.file, 'utf8'));
        let qArr = [];
        if (Array.isArray(raw)) qArr = raw;
        else if (raw.questions) qArr = raw.questions;
        else if (raw.questionBank && raw.questionBank.questions) qArr = raw.questionBank.questions;

        const resOOP = await upsertQuestionsBatch(db, qArr, oopSub._id, oopBook._id, item.topic, item.week);
        console.log(`  Uploaded OOP Week ${item.week} (${qArr.length} MCQs): ${resOOP.inserted} inserted, ${resOOP.updated} updated.`);
      }
    }
  }

  // ----------------------------------------------------
  // 5. ENTREPRENEURSHIP (Unit 1)
  // ----------------------------------------------------
  console.log('\n>>> [5/5] Processing "Entrepreneurship"...');
  let entSubject = await Subject.findOne({ slug: 'entrepreneurship' });
  if (!entSubject) {
    entSubject = await Subject.create({
      name: 'Entrepreneurship',
      slug: 'entrepreneurship',
      code: 'MG-401',
      programOrClass: 'Undergraduate / BS',
      semester: '4th Semester',
      description: 'Foundations of entrepreneurship, business opportunity evaluation, startup management, innovation, and venture creation.',
      academicYear: '2026',
      language: 'en',
      status: 'published'
    });
    console.log('  Created Subject "Entrepreneurship"');
  }

  let entBook = await Book.findOne({ subjectId: entSubject._id });
  if (!entBook) {
    entBook = await Book.create({
      title: 'Entrepreneurship (Concepts, Venture Creation & Innovation)',
      subjectId: entSubject._id,
      programOrClass: 'Undergraduate / BS',
      semester: '4th Semester',
      author: 'Lec. Iftikhar Zahid',
      edition: '1st Edition • Normalized Unit-wise Question Bank',
      academicYear: '2026',
      language: 'en',
      status: 'published',
      chapters: [
        { chapterNumber: 1, title: 'Unit 1: Introduction to Entrepreneurship & Business Concept', weeks: [{ weekNumber: 1, topic: 'Venture Creation & Market Analysis' }] }
      ]
    });
    console.log('  Created Book for Entrepreneurship');
  }

  const entFile = 'C:/Users/USER/Downloads/BS - 4/Lectures/Entrepreneurship/Entrepreneurship_Unit_1_MCQs_Normalized.json';
  if (fs.existsSync(entFile)) {
    const rawEnt = JSON.parse(fs.readFileSync(entFile, 'utf8'));
    const entList = rawEnt.questions || [];
    const resEnt = await upsertQuestionsBatch(db, entList, entSubject._id, entBook._id, 'Introduction to Entrepreneurship', '1');
    console.log(`  Uploaded Entrepreneurship (${entList.length} MCQs): ${resEnt.inserted} inserted, ${resEnt.updated} updated.`);
  }

  // ----------------------------------------------------
  // SUMMARY OF FINAL DATABASE STATE
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('         PRIMARY MONGODB FINAL SUMMARY');
  console.log('====================================================');
  const allSubs = await db.collection('subjects').find({}).toArray();
  let grandTotal = 0;
  for (const s of allSubs) {
    const count = await db.collection('questions').countDocuments({ subjectId: s._id });
    grandTotal += count;
    console.log(`• ${s.name} (${s.code || 'N/A'}): ${count} MCQs`);
  }
  const totalB = await db.collection('books').countDocuments();
  console.log(`\nGrand Total: ${grandTotal} Questions across ${allSubs.length} Subjects & ${totalB} Books!`);

  // ----------------------------------------------------
  // SYNCHRONIZE WITH CLUSTER0 (OLD/BACKUP CLUSTER)
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('   SYNCHRONIZING WITH SECONDARY CLUSTER (cluster0)');
  console.log('====================================================');
  try {
    const connOld = await mongoose.createConnection(CLUSTER_OLD).asPromise();
    const dbOld = connOld.db;
    console.log('Connected to secondary cluster0.');

    // Sync subjects
    for (const s of allSubs) {
      await dbOld.collection('subjects').replaceOne({ _id: s._id }, s, { upsert: true });
    }
    console.log(`✓ Synchronized ${allSubs.length} subjects to cluster0.`);

    // Sync books
    const allBooks = await db.collection('books').find({}).toArray();
    for (const b of allBooks) {
      await dbOld.collection('books').replaceOne({ _id: b._id }, b, { upsert: true });
    }
    console.log(`✓ Synchronized ${allBooks.length} books to cluster0.`);

    // Sync questions
    const allQuestions = await db.collection('questions').find({}).toArray();
    console.log(`Transferring ${allQuestions.length} questions to cluster0...`);
    for (let i = 0; i < allQuestions.length; i += 300) {
      const batch = allQuestions.slice(i, i + 300);
      try {
        await dbOld.collection('questions').insertMany(batch, { ordered: false });
      } catch (err) {
        // Safe to ignore duplicate key error
      }
      console.log(`  Synced batch ${i + 1} to ${Math.min(i + 300, allQuestions.length)}`);
    }

    const cluster0Count = await dbOld.collection('questions').countDocuments();
    console.log(`✓ cluster0 now has ${cluster0Count} total questions!`);
    await connOld.close();
  } catch (syncErr) {
    console.warn('Warning during secondary cluster sync:', syncErr.message);
  }

  await mongoose.disconnect();
  console.log('\nAll done successfully!');
}

runUpload().catch(err => {
  console.error('Fatal Upload Error:', err);
  process.exit(1);
});

