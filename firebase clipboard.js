// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDmBVYHDItC_ICYEh9Km4vbGAGEgHSzXk",
  authDomain: "suara-kami-1c6a6.firebaseapp.com",
  databaseURL: "https://suara-kami-1c6a6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "suara-kami-1c6a6",
  storageBucket: "suara-kami-1c6a6.firebasestorage.app",
  messagingSenderId: "387556807842",
  appId: "1:387556807842:web:6e419b8aa6ce3caed5b3fb",
  measurementId: "G-8C4RWBHH79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);