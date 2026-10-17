import mongoose from 'mongoose';

const chapterSubSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  weeks: [{ weekNumber: Number, topic: String }]
}, { _id: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  programOrClass: { type: String, default: '' },
  semester: { type: String, default: '' },
  author: { type: String, default: '' },
  edition: { type: String, default: '' },
  academicYear: { type: String, default: '2026' },
  description: { type: String, default: '' },
  language: { type: String, enum: ['en', 'ur', 'bilingual'], default: 'en' },
  chapters: [chapterSubSchema],
  sourceFilename: { type: String, default: '' },
  contentVersion: { type: Number, default: 1, index: true },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true }
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', bookSchema);
