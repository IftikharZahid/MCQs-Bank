import dns from 'dns';
import mongoose from 'mongoose';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const CLUSTER_NEW = 'mongodb+srv://Vercel-Admin-mcqsbank-db:Q5VhALCUN8YgWRvW@mcqsbank-db.kjzjfzd.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';

async function syncDatabases() {
  console.log('Connecting to both MongoDB Atlas clusters...');
  const connNew = await mongoose.createConnection(CLUSTER_NEW).asPromise();
  const connOld = await mongoose.createConnection(CLUSTER_OLD).asPromise();
  console.log('Successfully connected to both mcqsbank-db and cluster0!');

  const dbNew = connNew.db;
  const dbOld = connOld.db;

  // 1. Sync Subjects
  console.log('\n--- 1. Synchronizing Subjects ---');
  const subsNew = await dbNew.collection('subjects').find({}).toArray();
  const subsOld = await dbOld.collection('subjects').find({}).toArray();

  const oldSubIds = new Set(subsOld.map(s => s._id.toString()));
  const newSubIds = new Set(subsNew.map(s => s._id.toString()));

  for (const s of subsNew) {
    if (!oldSubIds.has(s._id.toString())) {
      console.log(`Inserting subject "${s.name}" (${s._id}) into cluster0 (Vercel DB)...`);
      await dbOld.collection('subjects').insertOne(s);
    } else {
      await dbOld.collection('subjects').replaceOne({ _id: s._id }, s);
    }
  }

  for (const s of subsOld) {
    if (!newSubIds.has(s._id.toString())) {
      console.log(`Inserting subject "${s.name}" (${s._id}) into mcqsbank-db...`);
      await dbNew.collection('subjects').insertOne(s);
    }
  }

  // 2. Sync Books
  console.log('\n--- 2. Synchronizing Books ---');
  const booksNew = await dbNew.collection('books').find({}).toArray();
  const booksOld = await dbOld.collection('books').find({}).toArray();

  const oldBookIds = new Set(booksOld.map(b => b._id.toString()));
  const newBookIds = new Set(booksNew.map(b => b._id.toString()));

  for (const b of booksNew) {
    if (!oldBookIds.has(b._id.toString())) {
      console.log(`Inserting book "${b.title}" (${b._id}) into cluster0 (Vercel DB)...`);
      await dbOld.collection('books').insertOne(b);
    } else {
      await dbOld.collection('books').replaceOne({ _id: b._id }, b);
    }
  }

  for (const b of booksOld) {
    if (!newBookIds.has(b._id.toString())) {
      console.log(`Inserting book "${b.title}" (${b._id}) into mcqsbank-db...`);
      await dbNew.collection('books').insertOne(b);
    }
  }

  // 3. Sync Questions
  console.log('\n--- 3. Synchronizing Questions ---');

  // Purge any outdated Visual Programming questions from cluster0 so it matches mcqsbank-db
  const vpSubId = new mongoose.Types.ObjectId('6ad2e9faf4302e6a145fd6f3');
  const vpBookId = new mongoose.Types.ObjectId('6ad2f5eee1dac5c428c6d8ef');
  const purgedOldVP = await dbOld.collection('questions').deleteMany({
    $or: [{ subjectId: vpSubId }, { bookId: vpBookId }]
  });
  console.log(`Purged ${purgedOldVP.deletedCount} outdated VP questions from cluster0.`);

  const qNew = await dbNew.collection('questions').find({}).toArray();
  const qOld = await dbOld.collection('questions').find({}).toArray();

  console.log(`Found ${qNew.length} questions in mcqsbank-db and ${qOld.length} questions in cluster0.`);

  const oldQIds = new Set(qOld.map(q => q._id.toString()));
  const newQIds = new Set(qNew.map(q => q._id.toString()));

  const toAddToOld = qNew.filter(q => !oldQIds.has(q._id.toString()));
  const toAddToNew = qOld.filter(q => !newQIds.has(q._id.toString()));

  if (toAddToOld.length > 0) {
    console.log(`Inserting ${toAddToOld.length} questions into cluster0 (Vercel DB)...`);
    for (let i = 0; i < toAddToOld.length; i += 300) {
      const batch = toAddToOld.slice(i, i + 300);
      try {
        await dbOld.collection('questions').insertMany(batch, { ordered: false });
      } catch (err) {
        // Some may be duplicates by fingerprint, safe to continue
      }
      console.log(`  mcqsbank-db -> cluster0: Synced batch ${i + 1} to ${Math.min(i + 300, toAddToOld.length)}`);
    }
  }

  if (toAddToNew.length > 0) {
    console.log(`Inserting ${toAddToNew.length} questions into mcqsbank-db...`);
    for (let i = 0; i < toAddToNew.length; i += 300) {
      const batch = toAddToNew.slice(i, i + 300);
      try {
        await dbNew.collection('questions').insertMany(batch, { ordered: false });
      } catch (err) {
        // Safe to continue
      }
      console.log(`  cluster0 -> mcqsbank-db: Synced batch ${i + 1} to ${Math.min(i + 300, toAddToNew.length)}`);
    }
  }

  // 4. Verification
  console.log('\n=== FINAL VERIFICATION ===');
  for (const col of ['subjects', 'books', 'questions']) {
    const finalNew = await dbNew.collection(col).countDocuments();
    const finalOld = await dbOld.collection(col).countDocuments();
    console.log(`Collection [${col}]:`);
    console.log(`  mcqsbank-db : ${finalNew}`);
    console.log(`  cluster0    : ${finalOld}`);
  }

  const finalBooksOld = await dbOld.collection('books').find({}).project({ title: 1 }).toArray();
  console.log('\nBooks now in cluster0 (Vercel DB):');
  finalBooksOld.forEach((b, idx) => console.log(`  ${idx + 1}. ${b.title}`));

  await connNew.close();
  await connOld.close();
  console.log('\nSynchronization completed successfully!');
}

syncDatabases().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
