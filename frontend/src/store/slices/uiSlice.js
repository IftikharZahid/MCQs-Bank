import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isAppModalOpen: false,
    isStudentModalOpen: false,
    isInstalled: false,
    dbAlertDismissed: false
  },
  reducers: {
    setAppModalOpen: (state, action) => {
      state.isAppModalOpen = Boolean(action.payload);
    },
    setStudentModalOpen: (state, action) => {
      state.isStudentModalOpen = Boolean(action.payload);
    },
    setIsInstalled: (state, action) => {
      state.isInstalled = Boolean(action.payload);
    },
    setDbAlertDismissed: (state, action) => {
      state.dbAlertDismissed = Boolean(action.payload);
    }
  }
});

export const {
  setAppModalOpen,
  setStudentModalOpen,
  setIsInstalled,
  setDbAlertDismissed
} = uiSlice.actions;

export const selectIsAppModalOpen = (state) => state.ui.isAppModalOpen;
export const selectIsStudentModalOpen = (state) => state.ui.isStudentModalOpen;
export const selectIsInstalled = (state) => state.ui.isInstalled;
export const selectDbAlertDismissed = (state) => state.ui.dbAlertDismissed;

export default uiSlice.reducer;

