import fs from 'fs';
import path from 'path';

const candidateDirs = [
  'C:/Users/USER/Downloads/BS - 4',
  'C:/Users/USER/Downloads/BS-2',
  'C:/Users/USER/Downloads/mongodb_mcqs.json',
  'D:/Development/MCQs Bank/backend/data',
  'D:/Development/MCQs-Bank/sample-data',
  'D:/Development/MCQs Mobile App/app/src/main/assets'
];

function findJsonFiles(dirOrFile) {
  if (!fs.existsSync(dirOrFile)) return [];
  const stat = fs.statSync(dirOrFile);
  if (!stat.isDirectory()) {
    return dirOrFile.endsWith('.json') ? [dirOrFile] : [];
  }
  let results = [];
  const list = fs.readdirSync(dirOrFile);
  for (const item of list) {
    const full = path.join(dirOrFile, item);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      results = results.concat(findJsonFiles(full));
    } else if (item.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

const allJson = [];
for (const c of candidateDirs) {
  allJson.push(...findJsonFiles(c));
}

console.log(`Found ${allJson.length} candidate JSON files.\n`);

for (const file of allJson) {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    let questions = [];
    if (Array.isArray(raw)) {
      questions = raw;
    } else if (Array.isArray(raw.questions)) {
      questions = raw.questions;
    } else if (raw.items && Array.isArray(raw.items)) {
      questions = raw.items;
    }

    if (questions.length > 0) {
      const sample = questions[0];
      const qText = sample.question || sample.questionText || sample.text || sample.title;
      console.log(`[MCQ FILE] ${file}`);
      console.log(`  Count: ${questions.length}`);
      console.log(`  Sample Subject: ${sample.subject || sample.subjectTitle || raw.subject || raw.title || 'N/A'}`);
      console.log(`  Sample Question: ${(qText || '').substring(0, 60)}...`);
      console.log(`  Sample Options: ${sample.options ? (Array.isArray(sample.options) ? sample.options.length : Object.keys(sample.options)) : (sample.optionA ? 'A,B,C,D' : 'None')}`);
      console.log(`  Correct: ${sample.correctAnswer ?? sample.correctOption ?? sample.answer ?? 'N/A'}\n`);
    } else {
      console.log(`[NON-MCQ JSON] ${file} (no questions array)\n`);
    }
  } catch (err) {
    console.log(`[ERROR] ${file}: ${err.message}\n`);
  }
}

