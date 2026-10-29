import { parse } from 'csv-parse/sync';
import mammoth from 'mammoth';
import Subject from '../models/Subject.js';

export function shuffleQuestionOptions(options, correctAnswer) {
  if (!Array.isArray(options) || options.length <= 1) {
    return { options, correctAnswer };
  }
  const indexed = options.map((opt, i) => ({ opt, isCorrect: i === correctAnswer }));
  const lastOpt = String(options[options.length - 1]).trim();
  const keepLast = /all of the above|none of the above/i.test(lastOpt);

  const toShuffle = keepLast ? indexed.slice(0, -1) : [...indexed];
  for (let i = toShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
  }
  const result = keepLast ? [...toShuffle, indexed[indexed.length - 1]] : toShuffle;
  return {
    options: result.map(o => o.opt),
    correctAnswer: result.findIndex(o => o.isCorrect)
  };
}

export function normalizeQuestionRecord(raw, index = 0, { randomize = false } = {}) {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: [`Row ${index + 1}: Invalid question object.`], data: null };
  }

  const questionText = String(raw.question || raw.text || raw.q || raw.title || '').trim();

  // Extract options from various formats
  let options = raw.options;
  if (!options) {
    if (raw.optionA || raw.optionB || raw.optionC || raw.optionD) {
      options = [raw.optionA, raw.optionB, raw.optionC, raw.optionD].filter(v => v !== undefined && v !== null);
    } else if (raw.opt1 || raw.opt2 || raw.opt3 || raw.opt4) {
      options = [raw.opt1, raw.opt2, raw.opt3, raw.opt4].filter(v => v !== undefined && v !== null);
    } else if (raw.choices && Array.isArray(raw.choices)) {
      options = raw.choices;
    }
  } else if (typeof options === 'object' && !Array.isArray(options)) {
    // e.g. { "A": "Apple", "B": "Banana", "C": "Cherry", "D": "Date" }
    options = Object.values(options).filter(v => v !== undefined && v !== null);
  }

  if (typeof options === 'string') {
    options = options.split('|').map(s => s.trim()).filter(Boolean);
  }

  // Normalize array elements to string
  if (Array.isArray(options)) {
    options = options.map(o => (typeof o === 'object' && o !== null ? (o.text || o.value || JSON.stringify(o)) : String(o).trim()));
  }

  // Extract correct answer
  let correctAnswer = raw.correctAnswer ?? raw.answer ?? raw.correctIndex ?? raw.correctOpt ?? raw.correct;
  if (typeof correctAnswer === 'string') {
    const trimmed = correctAnswer.trim();
    if (/^[A-D]$/i.test(trimmed)) {
      correctAnswer = trimmed.toUpperCase().charCodeAt(0) - 65;
    } else if (/^[0-9]+$/.test(trimmed)) {
      const num = Number(trimmed);
      // If 1-based index like 1, 2, 3, 4 and options length is 4, test if 0-based or 1-based
      if (num >= 1 && num === options?.length && options?.length > 1) {
        correctAnswer = num - 1;
      } else {
        correctAnswer = num;
      }
    } else if (Array.isArray(options)) {
      // Direct text matching if correctAnswer is the option string
      const matchIdx = options.findIndex(o => o.toLowerCase() === trimmed.toLowerCase());
      if (matchIdx !== -1) {
        correctAnswer = matchIdx;
      } else {
        correctAnswer = Number(trimmed);
      }
    }
  } else if (typeof correctAnswer === 'number') {
    correctAnswer = Math.floor(correctAnswer);
  }

  const errors = [];
  if (!questionText) errors.push(`Item ${index + 1}: Missing question text.`);
  if (!Array.isArray(options) || options.length < 2) errors.push(`Item ${index + 1}: At least 2 options required.`);
  if (Number.isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= (options?.length || 0)) {
    errors.push(`Item ${index + 1}: Correct answer (${raw.correctAnswer ?? raw.answer}) is invalid or out of bounds.`);
  }

  let finalOptions = (options || []).map(o => String(o).trim());
  let finalCorrectAnswer = Number.isNaN(correctAnswer) ? 0 : correctAnswer;

  // Automatically randomize option positions if enabled
  if (errors.length === 0 && randomize && finalOptions.length > 1) {
    const shuffled = shuffleQuestionOptions(finalOptions, finalCorrectAnswer);
    finalOptions = shuffled.options;
    finalCorrectAnswer = shuffled.correctAnswer;
  }

  const isUrdu = /[\u0600-\u06FF]/.test(questionText);

  return {
    valid: errors.length === 0,
    errors,
    data: {
      question: questionText,
      options: finalOptions,
      correctAnswer: finalCorrectAnswer,
      explanation: String(raw.explanation || raw.desc || '').trim(),
      chapter: String(raw.chapter || '').trim(),
      week: String(raw.week || '').trim(),
      topic: String(raw.topic || '').trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(String(raw.difficulty).toLowerCase())
        ? String(raw.difficulty).toLowerCase()
        : 'medium',
      language: raw.language || (isUrdu ? 'ur' : 'en'),
      book: String(raw.book || raw.bookTitle || raw.bookName || raw.Book || '').trim(),
      subject: String(raw.subject || raw.subjectName || raw.course || raw.Subject || '').trim()
    }
  };
}

export function parseRawTextBlocks(text) {
  const blocks = text.split(/\n(?=(?:Q\d*[:.]|\d+[.)])\s+)/i).map(b => b.trim()).filter(Boolean);
  const extracted = [];
  for (const block of blocks) {
    const qMatch = block.match(/^(?:Q\d*[:.]|\d+[.)])\s*(.+?)(?=\n\s*[A-D][).])/is);
    const optMatches = [...block.matchAll(/^[ \t]*([A-D])[).]\s*(.+)$/gim)];
    const ansMatch = block.match(/Answer\s*[:=-]\s*([A-D0-3])/i);
    const expMatch = block.match(/Explanation\s*[:=-]\s*(.+)$/is);
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

export function parseJsonContent(content, originalName = '') {
  const parsed = typeof content === 'string' ? JSON.parse(content) : content;
  let rawQuestions = [];
  let metadata = {};

  if (Array.isArray(parsed)) {
    rawQuestions = parsed;
    const firstWithBook = parsed.find(item => item && (item.book || item.bookTitle || item.bookName || item.Book));
    const firstWithSubject = parsed.find(item => item && (item.subject || item.subjectName || item.course || item.Subject));
    const firstWithProgram = parsed.find(item => item && (item.programOrClass || item.program || item.Program));
    const firstWithSemester = parsed.find(item => item && (item.semester || item.Semester));
    metadata = {
      subject: firstWithSubject ? (firstWithSubject.subject || firstWithSubject.subjectName || firstWithSubject.course || firstWithSubject.Subject) : null,
      book: firstWithBook ? (firstWithBook.book || firstWithBook.bookTitle || firstWithBook.bookName || firstWithBook.Book) : null,
      programOrClass: firstWithProgram ? (firstWithProgram.programOrClass || firstWithProgram.program || firstWithProgram.Program) : null,
      semester: firstWithSemester ? (firstWithSemester.semester || firstWithSemester.Semester) : null
    };
  } else if (typeof parsed === 'object' && parsed !== null) {
    rawQuestions = parsed.questions || parsed.mcqs || parsed.data || parsed.items || [];
    metadata = {
      subject: parsed.subject || parsed.subjectName || parsed.course || null,
      book: parsed.book || parsed.bookTitle || parsed.bookName || null,
      programOrClass: parsed.programOrClass || parsed.program || null,
      semester: parsed.semester || null
    };
  }

  // If no explicit book in metadata, check if filename implies a book name
  if (!metadata.book && originalName) {
    const cleanFileName = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
    if (cleanFileName && !cleanFileName.toLowerCase().includes('mcq') && !cleanFileName.toLowerCase().includes('backup')) {
      metadata.book = cleanFileName;
    }
  }

  return { rawQuestions, metadata, requiresDraftReview: false };
}

export async function parseUploadedFile(fileBuffer, mimeType, originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  if (ext === 'json' || mimeType === 'application/json') {
    return parseJsonContent(fileBuffer.toString('utf-8'), originalName);
  }
  if (ext === 'csv' || mimeType === 'text/csv') {
    const records = parse(fileBuffer.toString('utf-8'), { columns: true, skip_empty_lines: true });
    const firstWithBook = records.find(item => item && (item.book || item.bookTitle || item.bookName || item.Book));
    const firstWithSubject = records.find(item => item && (item.subject || item.subjectName || item.course || item.Subject));
    const firstWithProgram = records.find(item => item && (item.programOrClass || item.program || item.Program));
    const metadata = {
      book: firstWithBook ? (firstWithBook.book || firstWithBook.bookTitle || firstWithBook.bookName || firstWithBook.Book) : null,
      subject: firstWithSubject ? (firstWithSubject.subject || firstWithSubject.subjectName || firstWithSubject.course || firstWithSubject.Subject) : null,
      programOrClass: firstWithProgram ? (firstWithProgram.programOrClass || firstWithProgram.program || firstWithProgram.Program) : null
    };
    return { rawQuestions: records, metadata, requiresDraftReview: false };
  }
  if (ext === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
    return { rawQuestions: parseRawTextBlocks(value), metadata: {}, requiresDraftReview: true };
  }
  throw new Error(`Unsupported format (.${ext}). Upload .json, .csv, or .docx`);
}

export async function resolveSubjectMatch(subjectName, programOrClass) {
  if (!subjectName) return { status: 'missing' };
  const normalizedSlug = subjectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const exactMatch = await Subject.findOne({
    $or: [{ slug: normalizedSlug }, { name: new RegExp(`^${subjectName.trim()}$`, 'i') }]
  });

  if (exactMatch) {
    if (programOrClass && exactMatch.programOrClass && exactMatch.programOrClass.toLowerCase() !== programOrClass.toLowerCase()) {
      return {
        status: 'ambiguous_program',
        message: `Subject "${exactMatch.name}" already exists under "${exactMatch.programOrClass}". Reuse it or create a separate subject for "${programOrClass}"?`,
        candidate: exactMatch
      };
    }
    return { status: 'exact_match', subject: exactMatch };
  }
  return { status: 'new_subject' };
}
