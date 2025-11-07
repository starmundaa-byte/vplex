// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0L6TpJCXYRMKF-yaNMmmcKhp6jM9_6bQ",
  authDomain: "vplex-be628.firebaseapp.com",
  projectId: "vplex-be628",
  storageBucket: "vplex-be628.firebasestorage.app",
  messagingSenderId: "842335261841",
  appId: "1:842335261841:web:785ea8383adcb023b41b30",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
