import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";


const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const adminPanel = document.getElementById('admin');
const loginSection = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const updateDatabaseButton = document.getElementById('update-database');

// Handle Login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);  // Use the correct method from Firebase
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});

// Handle Logout
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {  // Use the correct method from Firebase
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
    });
});

// Handle Database Update (you can adjust this action to your needs)
updateDatabaseButton.addEventListener('click', async () => {
    const docRef = await addDoc(collection(db, "updates"), {
        update: 'Database updated via admin command',
        timestamp: serverTimestamp()  // Use the correct method from Firebase
    });
    alert('Database updated!');
});

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {  // Use the correct method from Firebase
    if (user) {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
    } else {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
    }
});
