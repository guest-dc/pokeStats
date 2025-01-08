// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.getAuth(app);
const db = firebase.firestore();
// const analytics = firebase.getAnalytics(app);

// export { auth };