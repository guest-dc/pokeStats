
// Global Variables
const DATABASE_URL = "./database.html";
const DMG_SPREADSHEET_URL = "./dmg-spreadsheet.html";
const DOCUMENTATION_URL = "./documentation.html";
const RESOURCES_URL = "./resources.html";

function toggleMenu() {
     var menu = document.querySelector(".menu-dropdown");
     menu.style.display = (menu.style.display === "block") ? "none" : "block";
}