// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC89Uh1pB6-7Xr3WyblV2_v556XttF0tTY",
  authDomain: "codeshashtra-2dc16.firebaseapp.com",
  projectId: "codeshashtra-2dc16",
  storageBucket: "codeshashtra-2dc16.firebasestorage.app",
  messagingSenderId: "285363200158",
  appId: "1:285363200158:web:ebeca10a7dcb9e1db21b8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };