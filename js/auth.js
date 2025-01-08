// auth.js

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
        await firebase.auth().signInWithEmailAndPassword(email, password);
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});

// Handle Logout
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
    });
});

// Handle Database Update (you can adjust this action to your needs)
updateDatabaseButton.addEventListener('click', async () => {
    // Example: Add a document to your Firestore collection
    const docRef = await db.collection('updates').add({
        update: 'Database updated via admin command',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Database updated!');
});

// Monitor Authentication State
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
    } else {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
    }
});
