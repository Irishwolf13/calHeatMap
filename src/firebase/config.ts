// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const VITE_DEV_API_KEY = import.meta.env.VITE_DEV_API_KEY
const VITE_DEV_AUTH_DOMAIN = import.meta.env.VITE_DEV_AUTH_DOMAIN
const VITE_DEV_PROJECT_ID = import.meta.env.VITE_DEV_PROJECT_ID
const VITE_DEV_STORAGE_BUCKET = import.meta.env.VITE_DEV_STORAGE_BUCKET
const VITE_DEV_MESSAGING_SENDER_ID = import.meta.env.VITE_DEV_MESSAGING_SENDER_ID
const VITE_DEV_APP_ID = import.meta.env.VITE_DEV_APP_ID
const VITE_DEV_MEASUREMENT_ID = import.meta.env.VITE_DEV_MEASUREMENT_ID
const firebaseDevConfig = {
  apiKey:VITE_DEV_API_KEY,
  authDomain:VITE_DEV_AUTH_DOMAIN,
  projectId:VITE_DEV_PROJECT_ID,
  storageBucket:VITE_DEV_STORAGE_BUCKET,
  messagingSenderId:VITE_DEV_MESSAGING_SENDER_ID,
  appId:VITE_DEV_APP_ID,
  measurementId:VITE_DEV_MEASUREMENT_ID
};

export const app = initializeApp(firebaseDevConfig);
export const auth = getAuth();
export const imageDB = getStorage (app);
export const db = getFirestore(app)
export const analytics = getAnalytics(app);