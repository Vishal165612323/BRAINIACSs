// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyB_UjSLiTFca7sEs6Xjo3KJt3gv7irm4yM",
  authDomain: "last-try-e2368.firebaseapp.com",
  projectId: "last-try-e2368",
  storageBucket: "last-try-e2368.appspot.com",
  messagingSenderId: "96302628355",
  appId: "1:96302628355:web:a87f636cec98c89d2f9836"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const usernameInput = document.getElementById("usernameInput");
const addUsernameBtn = document.getElementById("addUsernameBtn");
const usernameSelect = document.getElementById("usernameSelect");
const userListUl = document.getElementById("userListUl");
const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const confirmBtn = document.getElementById("confirmBtn");

// Add a new username to Firestore
async function addUserToFirestore(username) {
  try {
    const userRef = doc(db, "users", username);
    await setDoc(userRef, { exp: 0 });
    console.log(`User ${username} added to Firestore.`);
    alert(`User ${username} added successfully!`);
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    alert("An error occurred while adding the user.");
  }
}

// Add username to dropdown and user list
function addUserToList(username, exp = 0) {
  const option = document.createElement("option");
  option.value = username;
  option.textContent = username;
  usernameSelect.appendChild(option);

  const listItem = document.createElement("li");
  listItem.textContent = `${username} (EXP: ${exp})`;
  userListUl.appendChild(listItem);
}

// Load user data from Firestore
async function loadUserData() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      const username = doc.id;
      const exp = doc.data().exp || 0;
      addUserToList(username, exp);
    });
    console.log("User data loaded successfully.");
  } catch (error) {
    console.error("Error loading user data:", error);
    alert("An error occurred while loading user data.");
  }
}

// Update EXP based on study time (hours and minutes)
confirmBtn.addEventListener("click", async function () {
  const username = usernameSelect.value;
  const hours = parseInt(hoursInput.value);
  const minutes = parseInt(minutesInput.value);

  if (!username) {
    console.log("Username is missing.");
    alert("Please select a username.");
    return;
  }

  if (isNaN(hours) || isNaN(minutes)) {
    console.log("Invalid hours or minutes input.");
    alert("Please enter valid hours and minutes.");
    return;
  }

  try {
    const totalMinutes = hours * 60 + minutes;
    const addedExp = Math.floor(totalMinutes / 60) * 2 + Math.floor((totalMinutes % 60) / 30);

    console.log(`Total minutes: ${totalMinutes}, Added EXP: ${addedExp}`);

    const userRef = doc(db, "users", username);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentExp = userDoc.data().exp || 0;
      const updatedExp = currentExp + addedExp;

      // Update EXP in Firestore
      await updateDoc(userRef, { exp: updatedExp });

      // Update UI
      updateUserInList(username, updatedExp);
      alert(`EXP updated! Added ${addedExp} EXP.`);
      console.log(`Updated ${username} with ${addedExp} EXP.`);
    } else {
      console.log("User not found in Firestore.");
      alert("User not found in Firestore.");
    }
  } catch (error) {
    console.error("Error updating EXP:", error);
    alert("An error occurred while updating EXP.");
  }
});

// Update a user in the list after updating EXP
function updateUserInList(username, newExp) {
  const userListItems = document.querySelectorAll("li");
  userListItems.forEach(item => {
    if (item.textContent.includes(username)) {
      item.textContent = `${username} (EXP: ${newExp})`;
    }
  });
}

// Handle "Add Username" button click
addUsernameBtn.addEventListener("click", async function () {
  const username = usernameInput.value.trim();

  if (username === "") {
    console.log("Username is empty.");
    alert("Username cannot be empty.");
    return;
  }

  const existingUsernames = [...usernameSelect.options].map(option => option.value);
  if (existingUsernames.includes(username)) {
    console.log("Username already exists.");
    alert("This username already exists.");
    return;
  }

  await addUserToFirestore(username);
  addUserToList(username);
  usernameInput.value = "";
});

// Load user data on page load
document.addEventListener("DOMContentLoaded", async function () {
  await loadUserData();
});
