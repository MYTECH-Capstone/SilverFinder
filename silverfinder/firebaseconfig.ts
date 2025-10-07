// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth }  from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDD3goNLnFbeMCgA5qAha1ZoXd15_4fcYQ",
  authDomain: "silverfinder-912b4.firebaseapp.com",
  projectId: "silverfinder-912b4",
  storageBucket: "silverfinder-912b4.firebasestorage.app",
  messagingSenderId: "1055204101863",
  appId: "1:1055204101863:web:db96e456aac05c3165dc42",
  measurementId: "G-CQJV4P4XL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
