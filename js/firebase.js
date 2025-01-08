// Import the functions you need from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3dTNtWMPSGh8X8DeaduD3qyQhGl_U6jY",
  authDomain: "poke-stats-b8ae1.firebaseapp.com",
  projectId: "poke-stats-b8ae1",
  storageBucket: "poke-stats-b8ae1.firebasestorage.app",
  messagingSenderId: "453192051366",
  appId: "1:453192051366:web:c6eb48a25f30fea3d96267",
  measurementId: "G-VYNG8DKZMX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Get Firebase Authentication
const db = getFirestore(app);  // Get Firestore

export { auth, db };
