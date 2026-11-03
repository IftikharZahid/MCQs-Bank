const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const CLUSTER_OLD = 'mongodb+srv://tempmaildisk_db_user:UHUvwMPF7C2OzOnD@cluster0.3kgnmwl.mongodb.net/mcq_question_bank?retryWrites=true&w=majority';
const CLUSTER_NEW = process.env.MONGODB_URI;

async function repair() {
  console.log('Connecting to mcqsbank-db and cluster0...');
  const connNew = await mongoose.createConnection(CLUSTER_NEW).asPromise();
  const connOld = await mongoose.createConnection(CLUSTER_OLD).asPromise();
  const dbNew = connNew.db;
  const dbOld = connOld.db;
  console.log('Connected to both clusters.');

  // 1. In cluster0, delete the empty duplicate book '6ae9335012d16cc14e093cf9'
  const delDup = await dbOld.collection('books').deleteOne({ _id: new mongoose.Types.ObjectId('6ae9335012d16cc14e093cf9') });
  console.log('1. Deleted duplicate empty Theory of Automata book in cluster0:', delDup.deletedCount);

  // 2. In cluster0, fix the old Theory of Automata subject
  // Check if subject '6ae98ce56667eb52ff8dd715' exists in cluster0
  const subNewToa = await dbNew.collection('subjects').findOne({ _id: new mongoose.Types.ObjectId('6ae98ce56667eb52ff8dd715') });
  const subOldToa = await dbOld.collection('subjects').findOne({ _id: new mongoose.Types.ObjectId('6ad3c1ce49563198b6eca5f2') });

  if (subOldToa) {
    // Delete old subject from cluster0
    await dbOld.collection('subjects').deleteOne({ _id: subOldToa._id });
    console.log('2a. Removed old Theory of Automata subject document from cluster0');
  }

  // Insert or replace with exact subject from mcqsbank-db
  if (subNewToa) {
    await dbOld.collection('subjects').replaceOne({ _id: subNewToa._id }, subNewToa, { upsert: true });
    console.log('2b. Upserted unified Theory of Automata subject in cluster0');
  }

  // Update any questions in cluster0 that had the old subject ID
  const updQSub = await dbOld.collection('questions').updateMany(
    { subjectId: new mongoose.Types.ObjectId('6ad3c1ce49563198b6eca5f2') },
    { $set: { subjectId: new mongoose.Types.ObjectId('6ae98ce56667eb52ff8dd715') } }
  );
  console.log('2c. Updated questions pointing to old Theory of Automata subject:', updQSub.modifiedCount);

  // 3. Fix questions with null bookId in cluster0
  const updQBookToa = await dbOld.collection('questions').updateMany(
    { subjectId: new mongoose.Types.ObjectId('6ae98ce56667eb52ff8dd715'), $or: [{ bookId: null }, { bookId: { $exists: false } }] },
    { $set: { bookId: new mongoose.Types.ObjectId('6ae98cea6667eb52ff8dd71a') } }
  );
  console.log('3a. Assigned Theory of Automata bookId to null-book questions in cluster0:', updQBookToa.modifiedCount);

  const updQBookSe = await dbOld.collection('questions').updateMany(
    { subjectId: new mongoose.Types.ObjectId('6ad2e9e7f4302e6a145fd6e9'), $or: [{ bookId: null }, { bookId: { $exists: false } }] },
    { $set: { bookId: new mongoose.Types.ObjectId('6ad2f3dee1dac5c428c6d8e7') } }
  );
  console.log('3b. Assigned Software Engineering bookId to null-book questions in cluster0:', updQBookSe.modifiedCount);

  // Also do same for mcqsbank-db
  await dbNew.collection('questions').updateMany(
    { subjectId: new mongoose.Types.ObjectId('6ad2e9e7f4302e6a145fd6e9'), $or: [{ bookId: null }, { bookId: { $exists: false } }] },
    { $set: { bookId: new mongoose.Types.ObjectId('6ad2f3dee1dac5c428c6d8e7') } }
  );

  // 4. Ensure book '6ae98cea6667eb52ff8dd71a' in cluster0 has the proper subjectId
  await dbOld.collection('books').updateOne(
    { _id: new mongoose.Types.ObjectId('6ae98cea6667eb52ff8dd71a') },
    { $set: { subjectId: new mongoose.Types.ObjectId('6ae98ce56667eb52ff8dd715') } }
  );

  // 5. Calculate and store questionCount directly on each Book document in BOTH clusters
  console.log('\n--- 5. Storing questionCount permanently on Books ---');
  for (const [name, db] of [['mcqsbank-db', dbNew], ['cluster0', dbOld]]) {
    const books = await db.collection('books').find({}).toArray();
    console.log(`Updating books in ${name} (total ${books.length}):`);
    for (const b of books) {
      const count = await db.collection('questions').countDocuments({ bookId: b._id, status: 'published' });
      await db.collection('books').updateOne({ _id: b._id }, { $set: { questionCount: count } });
      console.log(`  - Book "${b.title}": ${count} MCQs`);
    }
  }

  // 6. Calculate and store questionCount directly on each Subject document in BOTH clusters
  console.log('\n--- 6. Storing questionCount permanently on Subjects ---');
  for (const [name, db] of [['mcqsbank-db', dbNew], ['cluster0', dbOld]]) {
    const subjects = await db.collection('subjects').find({}).toArray();
    console.log(`Updating subjects in ${name} (total ${subjects.length}):`);
    for (const s of subjects) {
      const count = await db.collection('questions').countDocuments({ subjectId: s._id, status: 'published' });
      await db.collection('subjects').updateOne({ _id: s._id }, { $set: { questionCount: count } });
      console.log(`  - Subject "${s.name}": ${count} MCQs`);
    }
  }

  console.log('\n=== REPAIR & SYNC COMPLETE ===');
  await connNew.close();
  await connOld.close();
}
repair().catch(console.error);

