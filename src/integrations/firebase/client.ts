// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtYmZmCpvli0RLhX2s4rkzCCBO7dlx678",
  authDomain: "dcejigyasu.firebaseapp.com",
  projectId: "dcejigyasu",
  storageBucket: "dcejigyasu.firebasestorage.app",
  messagingSenderId: "639675046160",
  appId: "1:639675046160:web:727495f3ea3079140aed95",
  measurementId: "G-YCNMRH1Z8L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };