import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  studentName: { type: String, default: 'Student Candidate' },
  durationMinutes: { type: Number, required: true },
  passingPercentage: { type: Number, default: 50 },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  status: { type: String, enum: ['in_progress', 'submitted', 'expired'], default: 'in_progress' },
  items: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: Number, default: null },
    isCorrect: { type: Boolean, default: false }
  }],
  summary: {
    totalQuestions: Number,
    answered: Number,
    unanswered: Number,
    correct: Number,
    incorrect: Number,
    obtainedMarks: Number,
    percentage: Number,
    accuracyRate: Number,
    passed: Boolean,
    grade: String
  }
}, { timestamps: true });

export default mongoose.models.ExamAttempt || mongoose.model('ExamAttempt', examAttemptSchema);
