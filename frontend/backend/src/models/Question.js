import mongoose from 'mongoose';
import crypto from 'crypto';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least 2 options are required.']
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (val) {
        return Array.isArray(this.options) && val >= 0 && val < this.options.length;
      },
      message: 'correctAnswer index must correspond to an existing option.'
    }
  },
  explanation: { type: String, default: '' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', index: true },
  chapter: { type: String, default: '', index: true },
  week: { type: String, default: '', index: true },
  topic: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
  language: { type: String, enum: ['en', 'ur'], default: 'en' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true },
  fingerprint: { type: String, unique: true, sparse: true, index: true },
  normalizedQuestion: { type: String, default: '' },
  contentVersion: { type: Number, default: 1, index: true }
}, { timestamps: true });

questionSchema.pre('validate', function (next) {
  if (this.question && this.subjectId) {
    const normalizedText = this.question.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedOpts = (this.options || []).map(o => String(o).trim().toLowerCase()).join('|');
    this.fingerprint = crypto
      .createHash('sha256')
      .update(`${this.subjectId.toString()}::${normalizedText}::${normalizedOpts}`)
      .digest('hex');
    this.normalizedQuestion = normalizedText;
  }
  next();
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
