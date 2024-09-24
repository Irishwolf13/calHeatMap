// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './jobSlice';

const store = configureStore({
  reducer: {
    currentJob: jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
