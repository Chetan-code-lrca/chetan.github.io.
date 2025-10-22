/*
 * ============================================================================
 * FIREBASE v9+ ES MODULE IMPORTS (Browser-only)
 * ============================================================================
 * 
 * This code uses Firebase v9+ modular SDK with direct CDN ES module imports.
 * For browser-only use with <script type="module"> in your HTML.
 * 
 * INSTRUCTIONS:
 * 1. Include this in your HTML file with type="module":
 *    <script type="module" src="app.js"></script>
 * 
 * 2. The Firebase SDK will be imported directly from CDN (no separate script tags needed)
 * 
 * 3. This replaces the old compat/namespace Firebase syntax
 * 
 * ============================================================================
 */

// Import Firebase v9+ modular SDK from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Your Firebase Configuration
// IMPORTANT: API key has been revoked for security. Please configure with a new valid API key.
// See: https://console.firebase.google.com/project/ai-study-planner-a7a61/settings/general
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",  // REMOVED: Previous key was revoked due to public exposure
  authDomain: "ai-study-planner-a7a61.firebaseapp.com",
  projectId: "ai-study-planner-a7a61",
  storageBucket: "ai-study-planner-a7a61.firebasestorage.app",
  messagingSenderId: "1040953124583",
  appId: "1:1040953124583:web:62d0d1dc3e4d0578d82442",
  measurementId: "G-ERXM77WNWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Example: Authentication State Observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log('User signed in:', user.uid);
  } else {
    // User is signed out
    console.log('User signed out');
  }
});

// Example: Firestore Operations (v9+ modular syntax)

// Write data
// const userRef = doc(db, 'users', user.uid);
// await setDoc(userRef, {
//   name: 'Example User',
//   email: user.email,
//   createdAt: serverTimestamp()
// });

// Read data
// const userRef = doc(db, 'users', user.uid);
// const docSnap = await getDoc(userRef);
// if (docSnap.exists()) {
//   console.log('User data:', docSnap.data());
// }

// ============================================================================
// YOUR APPLICATION CODE STARTS HERE
// ============================================================================

// Auth UI wiring helpers
function setAuthUIState(user) {
  const authedEls = document.querySelectorAll('[data-auth="signed-in"]');
  const anonEls = document.querySelectorAll('[data-auth="signed-out"]');
  authedEls.forEach(el => el.style.display = user ? '' : 'none');
  anonEls.forEach(el => el.style.display = user ? 'none' : '');
  const userEmailEl = document.getElementById('user-email-display');
  if (userEmailEl) userEmailEl.textContent = user ? (user.email || user.uid) : '';
}

// Save minimal user profile after sign up / first sign in
async function saveUserProfile(user) {
  if (!user || !db) return;
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Student',
      createdAt: new Date().toISOString(),
      dailyGoal: userData.dailyGoal,
      pomodoroSettings: userData.pomodoroSettings
    });
  } else {
    await setDoc(ref, {
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  }
}

// Email/password sign up
async function handleEmailSignUp(e) {
  e.preventDefault();
  if (!auth) return showNotification('Auth not available', 'error');
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('signup-name')?.value.trim() || 'Student';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await saveUserProfile(cred.user);
    showNotification('Account created successfully', 'success');
  } catch (err) {
    showNotification(err.message || 'Sign up failed', 'error');
  }
}

// Email/password login
async function handleEmailLogin(e) {
  e.preventDefault();
  if (!auth) return showNotification('Auth not available', 'error');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showNotification('Logged in', 'success');
  } catch (err) {
    showNotification(err.message || 'Login failed', 'error');
  }
}

// Logout
async function handleLogout() {
  if (!auth) return;
  try {
    await signOut(auth);
    showNotification('Logged out', 'success');
  } catch (err) {
    showNotification(err.message || 'Logout failed', 'error');
  }
}

// Load/save planner data per user (optional basic example)
async function loadUserData(user) {
  if (!user || !db) return;
  const ref = doc(db, 'users', user.uid, 'app', 'planner');
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    if (data && data.userData) {
      userData = { ...userData, ...data.userData };
      updateDashboard();
      updateProgressTracker();
      generateCalendar();
      updateStudyPlansList();
      loadSettings();
    }
  }
}

async function persistUserData(user) {
  if (!user || !db) return;
  const ref = doc(db, 'users', user.uid, 'app', 'planner');
  await setDoc(ref, { userData, updatedAt: new Date().toISOString() }, { merge: true });
}

// Hook persistence to key actions
const persistHooks = ['handleStudyPlanSubmit','handleAddSession','deleteSubject','deleteSession','clearAllData'];
const originalFns = {};
persistHooks.forEach(fnName => {
  if (typeof window[fnName] === 'function') {
    originalFns[fnName] = window[fnName];
    window[fnName] = async function(...args) {
      const res = originalFns[fnName].apply(this, args);
      try {
        const user = auth?.currentUser || null;
        await persistUserData(user);
      } catch (e) {}
      return res;
    }
  }
});

// Auth state listener
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    setAuthUIState(user);
    if (user) {
      await saveUserProfile(user);
      await loadUserData(user);
    }
  });
}

// Existing code below...
