import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert("Logged in successfully!");

    // Check if the user is an admin (e.g., based on a hardcoded admin email)
    if (email === "davisdevice@gmail.com") {
      document.getElementById("admin-button").style.display = "block";
    }
  } catch (error) {
    alert("Error logging in: " + error.message);
  }
});

document.getElementById("admin-button").addEventListener("click", () => {
  alert("Admin functionality is not yet implemented.");
});
