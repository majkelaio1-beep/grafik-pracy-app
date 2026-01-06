import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// WAŻNE: Podmień poniższy obiekt na swój własny z konsoli Firebase!
// Wejdź na: Project Settings -> General -> Your apps -> SDK setup and configuration
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "TU_WKLEJ_SWOJE_API_KEY",
  authDomain: "twoj-projekt.firebaseapp.com",
  projectId: "twoj-projekt",
  storageBucket: "twoj-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);