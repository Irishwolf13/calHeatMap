// src/jobSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '../interfaces/interface';

interface JobState {
  currentJob: Job | null;
}

const initialState: JobState = {
  currentJob: null,
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setCurrentJob(state, action: PayloadAction<Job>) {
      state.currentJob = action.payload;
    },
    clearCurrentJob(state) {
      state.currentJob = null;
    },
  },
});

export const { setCurrentJob, clearCurrentJob } = jobSlice.actions;

export default jobSlice.reducer;
