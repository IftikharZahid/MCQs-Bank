import { createSlice } from '@reduxjs/toolkit';

const USER_STORAGE_KEY = 'academic_student_user';
const PROGRESS_STORAGE_KEY = 'academic_student_progress';

function getStoredStudentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function getStoredStudentProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    questionsSolved: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    subjectStats: {},
    recentSessions: [],
    examHistory: []
  };
}

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    user: getStoredStudentUser(),
    progress: getStoredStudentProgress()
  },
  reducers: {
    saveStudentUser: (state, action) => {
      state.user = action.payload;
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload));
      } catch (_) {}
    },
    logoutStudent: (state) => {
      state.user = null;
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (_) {}
    },
    recordQuestionSolved: (state, action) => {
      const { subjectId, isCorrect } = action.payload;
      state.progress.questionsSolved = (state.progress.questionsSolved || 0) + 1;
      if (isCorrect) {
        state.progress.correctAnswers = (state.progress.correctAnswers || 0) + 1;
      } else {
        state.progress.wrongAnswers = (state.progress.wrongAnswers || 0) + 1;
      }

      if (subjectId) {
        if (!state.progress.subjectStats[subjectId]) {
          state.progress.subjectStats[subjectId] = { solved: 0, correct: 0, wrong: 0 };
        }
        const s = state.progress.subjectStats[subjectId];
        s.solved += 1;
        if (isCorrect) s.correct += 1;
        else s.wrong += 1;
      }

      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state.progress));
      } catch (_) {}
    },
    recordExamAttempt: (state, action) => {
      const attempt = {
        id: 'exam_' + Date.now(),
        date: new Date().toISOString(),
        ...action.payload
      };
      if (!Array.isArray(state.progress.examHistory)) {
        state.progress.examHistory = [];
      }
      state.progress.examHistory.unshift(attempt);
      if (state.progress.examHistory.length > 30) {
        state.progress.examHistory = state.progress.examHistory.slice(0, 30);
      }
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state.progress));
      } catch (_) {}
    },
    recordRecentActivity: (state, action) => {
      const session = {
        id: 'act_' + Date.now(),
        date: new Date().toISOString(),
        ...action.payload
      };
      if (!Array.isArray(state.progress.recentSessions)) {
        state.progress.recentSessions = [];
      }
      state.progress.recentSessions.unshift(session);
      if (state.progress.recentSessions.length > 20) {
        state.progress.recentSessions = state.progress.recentSessions.slice(0, 20);
      }
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state.progress));
      } catch (_) {}
    }
  }
});

export const {
  saveStudentUser,
  logoutStudent,
  recordQuestionSolved,
  recordExamAttempt,
  recordRecentActivity
} = studentSlice.actions;

export const selectStudentUser = (state) => state.student.user;
export const selectStudentProgress = (state) => state.student.progress;

export default studentSlice.reducer;

