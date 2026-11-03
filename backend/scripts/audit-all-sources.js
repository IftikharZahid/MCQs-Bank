import dns from 'dns';
import mongoose from 'mongoose';
import fs from 'fs';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const CLUSTER_NEW = 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

async function auditAllSources() {
  const connNew = await mongoose.createConnection(CLUSTER_NEW).asPromise();
  const connOld = await mongoose.createConnection(CLUSTER_OLD).asPromise();

  console.log('=== SUBJECTS IN MCQS BANK (NEW) ===');
  const subsNew = await connNew.db.collection('subjects').find({}).toArray();
  for (const s of subsNew) {
    const qCount = await connNew.db.collection('questions').countDocuments({
      $or: [{ subjectId: s._id }, { subject: s.name }]
    });
    console.log(`NEW: ${s._id} | "${s.name}" | ${qCount} questions`);
  }

  console.log('\n=== SUBJECTS IN CLUSTER0 (OLD) ===');
  const subsOld = await connOld.db.collection('subjects').find({}).toArray();
  for (const s of subsOld) {
    const qCount = await connOld.db.collection('questions').countDocuments({
      $or: [{ subjectId: s._id }, { subject: s.name }]
    });
    console.log(`OLD: ${s._id} | "${s.name}" | ${qCount} questions`);
  }

  // Check local files
  console.log('\n=== LOCAL FILES AUDIT ===');
  const files = [
    'backend/data/Visual_Programming_504_Normalized_MCQ_Bank_Lec_Iftikhar_Zahid.json',
    'backend/scripts/backup-questions.json',
    'D:/Development/MCQs-Bank/sample-data/questions.json',
    'D:/Development/MCQs-Bank/sample-data/user_sample_week1.json',
    'D:/Development/MCQs Mobile App/app/src/main/assets/mongodb_mcqs.json'
  ];

  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
        const list = Array.isArray(raw) ? raw : (raw.questions || []);
        console.log(`File: ${f} -> ${list.length} questions`);
      } catch (e) {
        console.log(`File: ${f} -> Error reading: ${e.message}`);
      }
    } else {
      console.log(`File: ${f} -> NOT FOUND`);
    }
  }

  await connNew.close();
  await connOld.close();
}

auditAllSources().catch(console.error);

