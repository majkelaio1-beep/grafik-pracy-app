import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// WAŻNE: Podmień poniższy obiekt na swój własny z konsoli Firebase!
// Wejdź na: Project Settings -> General -> Your apps -> SDK setup and configuration
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCoykfW3oVqiSBt-DV-M9uxpqtsXs_b35M",  authDomain: "grafik-pracy-app-2d9ad.firebaseapp.com",
  projectId: "grafik-pracy-app-2d9ad",
  storageBucket: "grafik-pracy-app-2d9ad.firebasestorage.app",
  messagingSenderId: "876289612078",
  appId: "1:876289612078:web:de9d9610d7fae2defbc2bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
