import dns from 'dns';
import mongoose from 'mongoose';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const CLUSTER_NEW = 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

async function fastSync() {
  console.log('Connecting to mcqsbank-db and cluster0...');
  const connNew = await mongoose.createConnection(CLUSTER_NEW).asPromise();
  const connOld = await mongoose.createConnection(CLUSTER_OLD).asPromise();

  const dbNew = connNew.db;
  const dbOld = connOld.db;

  const allQuestions = await dbNew.collection('questions').find({}).toArray();
  console.log(`Fetched ${allQuestions.length} questions from mcqsbank-db.`);

  const existingIds = new Set(
    (await dbOld.collection('questions').find({}, { projection: { _id: 1 } }).toArray())
      .map(q => q._id.toString())
  );
  console.log(`cluster0 currently has ${existingIds.size} questions.`);

  const missing = allQuestions.filter(q => !existingIds.has(q._id.toString()));
  console.log(`Transferring ${missing.length} missing questions to cluster0...`);

  let added = 0;
  for (let i = 0; i < missing.length; i += 200) {
    const batch = missing.slice(i, i + 200);
    try {
      const res = await dbOld.collection('questions').insertMany(batch, { ordered: false });
      added += res.insertedCount;
    } catch (e) {
      if (e.insertedDocs) added += e.insertedDocs.length;
      else if (e.result?.nInserted) added += e.result.nInserted;
    }
    console.log(`Progress: ${Math.min(i + 200, missing.length)} / ${missing.length}`);
  }

  const finalOldCount = await dbOld.collection('questions').countDocuments({});
  console.log(`SUCCESS: cluster0 now has ${finalOldCount} total questions!`);

  await connNew.close();
  await connOld.close();
}

fastSync().catch(console.error);

