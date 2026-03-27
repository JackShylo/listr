import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA9Ua8QhIovudNa2RAFLwPUuyeGWbn0XAs",
  authDomain: "listr-678e1.firebaseapp.com",
  projectId: "listr-678e1",
  storageBucket: "listr-678e1.firebasestorage.app",
  messagingSenderId: "716806697772",
  appId: "1:716806697772:web:24edc8b18bb05dde107289",
  measurementId: "G-LLHD43D9K6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
