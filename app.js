/*
 * ============================================================================
 * FIREBASE INITIALIZATION TEMPLATE
 * ============================================================================
 * 
 * INSTRUCTIONS FOR USER CONFIGURATION:
 * 1. Include Firebase SDK via CDN in your HTML file (before this script):
 *    
 *    <!-- Firebase App (core Firebase SDK) -->
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>
 *    
 *    <!-- Firebase Authentication -->
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth-compat.js"></script>
 *    
 *    <!-- Firebase Firestore -->
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore-compat.js"></script>
 * 
 * 2. Get your Firebase configuration from:
 *    Firebase Console > Project Settings > General > Your apps > Web app config
 * 
 * 3. Replace the placeholder values below with your actual Firebase config
 * 
 * 4. Uncomment the initialization code when ready to use Firebase
 * 
 * ============================================================================
 */

/*
// Your Firebase Configuration
// Replace these placeholder values with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // Optional: Add if using Realtime Database
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Cloud Firestore
const db = firebase.firestore();

// Example: Authentication State Observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User signed in:', user.uid);
  } else {
    // User is signed out
    console.log('User signed out');
  }
});

// Example: Firestore Operations
// Write data
// db.collection('users').doc(user.uid).set({
//   name: 'Example User',
//   email: user.email,
//   createdAt: firebase.firestore.FieldValue.serverTimestamp()
// });

// Read data
// db.collection('users').doc(user.uid).get().then((doc) => {
//   if (doc.exists) {
//     console.log('User data:', doc.data());
//   }
// });
*/

// ============================================================================
// YOUR APPLICATION CODE STARTS HERE
// ============================================================================

// Firebase Initialization
// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};
// Initialize Firebase (Modular v9+ CDN)
if (!window.firebaseApp) {
  window.firebaseApp = firebase.initializeApp ? firebase.initializeApp(firebaseConfig) : null;
}
// Auth and DB references (compat if loaded)
const auth = firebase.auth ? firebase.auth() : null;
const db = firebase.firestore ? firebase.firestore() : null;
const rtdb = firebase.database ? firebase.database() : null;
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
  const ref = db.collection('users').doc(user.uid);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    await ref.set({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Student',
      createdAt: new Date().toISOString(),
      dailyGoal: userData.dailyGoal,
      pomodoroSettings: userData.pomodoroSettings
    });
  } else {
    await ref.set({
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
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
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
    await auth.signInWithEmailAndPassword(email, password);
    showNotification('Logged in', 'success');
  } catch (err) {
    showNotification(err.message || 'Login failed', 'error');
  }
}
// Logout
async function handleLogout() {
  if (!auth) return;
  try {
    await auth.signOut();
    showNotification('Logged out', 'success');
  } catch (err) {
    showNotification(err.message || 'Logout failed', 'error');
  }
}
// Load/save planner data per user (optional basic example)
async function loadUserData(user) {
  if (!user || !db) return;
  const ref = db.collection('users').doc(user.uid).collection('app').doc('planner');
  const snap = await ref.get();
  if (snap.exists) {
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
  const ref = db.collection('users').doc(user.uid).collection('app').doc('planner');
  await ref.set({ userData, updatedAt: new Date().toISOString() }, { merge: true });
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
  auth.onAuthStateChanged(async (user) => {
    setAuthUIState(user);
    if (user) {
      await saveUserProfile(user);
      await loadUserData(user);
    }
  });
}
// Existing code below...
