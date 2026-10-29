import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const startExamThunk = createAsyncThunk(
  'exam/startExamThunk',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/exams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || 'Could not start examination session');
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error starting examination');
    }
  }
);

export const submitExamThunk = createAsyncThunk(
  'exam/submitExamThunk',
  async ({ attemptId, answers }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/exams/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to submit examination');
      }
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error submitting examination');
    }
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState: {
    session: null,
    answers: {},
    currentIndex: 0,
    skippedIds: [],
    secondsLeft: 0,
    transcript: null,
    isExamActive: false,
    status: 'idle',
    error: null
  },
  reducers: {
    setExamOption: (state, action) => {
      const { questionId, optionIndex } = action.payload;
      state.answers[questionId] = optionIndex;
      state.skippedIds = state.skippedIds.filter((id) => id !== questionId);
    },
    skipExamQuestion: (state, action) => {
      const questionId = action.payload;
      if (questionId && state.answers[questionId] === undefined) {
        if (!state.skippedIds.includes(questionId)) {
          state.skippedIds.push(questionId);
        }
      }
      if (state.session?.questions && state.currentIndex < state.session.questions.length - 1) {
        state.currentIndex += 1;
      }
    },
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    nextExamQuestion: (state) => {
      if (state.session?.questions && state.currentIndex < state.session.questions.length - 1) {
        state.currentIndex += 1;
      }
    },
    prevExamQuestion: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    tickTimer: (state) => {
      if (state.secondsLeft > 0) {
        state.secondsLeft -= 1;
      }
    },
    resetExam: (state) => {
      state.session = null;
      state.answers = {};
      state.currentIndex = 0;
      state.skippedIds = [];
      state.secondsLeft = 0;
      state.transcript = null;
      state.isExamActive = false;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Start Exam
      .addCase(startExamThunk.pending, (state) => {
        state.status = 'starting';
        state.error = null;
      })
      .addCase(startExamThunk.fulfilled, (state, action) => {
        state.status = 'active';
        state.session = action.payload;
        state.answers = {};
        state.currentIndex = 0;
        state.skippedIds = [];
        state.secondsLeft = (action.payload.durationMinutes || 20) * 60;
        state.transcript = null;
        state.isExamActive = true;
        state.error = null;
      })
      .addCase(startExamThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to start examination';
      })
      // Submit Exam
      .addCase(submitExamThunk.pending, (state) => {
        state.status = 'submitting';
        state.error = null;
      })
      .addCase(submitExamThunk.fulfilled, (state, action) => {
        state.status = 'completed';
        state.transcript = action.payload;
        state.isExamActive = false;
        state.error = null;
      })
      .addCase(submitExamThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to submit examination';
      });
  }
});

export const {
  setExamOption,
  skipExamQuestion,
  setCurrentIndex,
  nextExamQuestion,
  prevExamQuestion,
  tickTimer,
  resetExam
} = examSlice.actions;

// Selectors
export const selectActiveExamSession = (state) => state.exam.session;
export const selectExamAnswers = (state) => state.exam.answers;
export const selectCurrentExamIndex = (state) => state.exam.currentIndex;
export const selectSkippedIds = (state) => state.exam.skippedIds;
export const selectExamSecondsLeft = (state) => state.exam.secondsLeft;
export const selectExamTranscript = (state) => state.exam.transcript;
export const selectIsExamActive = (state) => state.exam.isExamActive;
export const selectExamStatus = (state) => state.exam.status;
export const selectExamError = (state) => state.exam.error;

export default examSlice.reducer;

