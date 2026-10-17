import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  code: { type: String, trim: true, default: '' },
  description: { type: String, default: '' },
  programOrClass: { type: String, default: 'General', index: true },
  semester: { type: String, default: '' },
  academicYear: { type: String, default: '2026' },
  language: { type: String, enum: ['en', 'ur', 'bilingual'], default: 'en' },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true },
  contentVersion: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
