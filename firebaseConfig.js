import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
   apiKey: "AIzaSyBDmBVYHDItC_ICYEh9Km4vbGAGEgHSzXk",
  authDomain: "suara-kami-1c6a6.firebaseapp.com",
  databaseURL: "https://suara-kami-1c6a6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "suara-kami-1c6a6",
  storageBucket: "suara-kami-1c6a6.firebasestorage.app",
  messagingSenderId: "387556807842",
  appId: "1:387556807842:web:6e419b8aa6ce3caed5b3fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);