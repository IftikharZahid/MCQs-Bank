import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from './slices/catalogSlice.js';
import examReducer from './slices/examSlice.js';
import studentReducer from './slices/studentSlice.js';
import uiReducer from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    exam: examReducer,
    student: studentReducer,
    ui: uiReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;

