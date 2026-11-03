import dns from 'dns';
import mongoose from 'mongoose';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const CLUSTER_NEW = 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

async function checkBoth() {
  console.log('Connecting to mcqsbank-db...');
  const connNew = await mongoose.createConnection(CLUSTER_NEW).asPromise();
  const qNew = await connNew.db.collection('questions').countDocuments();
  const sNew = await connNew.db.collection('subjects').countDocuments();
  const bNew = await connNew.db.collection('books').countDocuments();
  console.log(`mcqsbank-db: ${qNew} questions, ${sNew} subjects, ${bNew} books`);

  console.log('Connecting to cluster0 (old/backup)...');
  const connOld = await mongoose.createConnection(CLUSTER_OLD).asPromise();
  const qOld = await connOld.db.collection('questions').countDocuments();
  const sOld = await connOld.db.collection('subjects').countDocuments();
  const bOld = await connOld.db.collection('books').countDocuments();
  console.log(`cluster0: ${qOld} questions, ${sOld} subjects, ${bOld} books`);

  await connNew.close();
  await connOld.close();
}
checkBoth().catch(console.error);

