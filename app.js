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

// Your Firebase Configuration
// Live configuration - Firebase initialized and ready
const firebaseConfig = {
  apiKey: "AIzaSyAYMPxkJ6OAkiqJvb3P9HRZVwb1WJQnddQ",
  authDomain: "ai-study-planner-a7a61.firebaseapp.com",
  projectId: "ai-study-planner-a7a61",
  storageBucket: "ai-study-planner-a7a61.firebasestorage.app",
  messagingSenderId: "1040953124583",
  appId: "1:1040953124583:web:62d0d1dc3e4d0578d82442",
  measurementId: "G-ERXM77WNWB"
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
