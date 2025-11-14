import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import '../style.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "ai-study-planner-a7a61.firebaseapp.com",
  projectId: "ai-study-planner-a7a61",
  storageBucket: "ai-study-planner-a7a61.firebasestorage.app",
  messagingSenderId: "104095312458",
  appId: "1:104095312458:web:62d8d1dc3e4d0578d82442",
  measurementId: "G-ERKW77NMNB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadSubjects(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const loadSubjects = async (userId: string) => {
    const q = query(collection(db, 'subjects'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const loadedSubjects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSubjects(loadedSubjects as any);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Login failed: ' + error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Signup failed: ' + error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'subjects'), {
        name: newSubject,
        userId: user.uid,
        createdAt: new Date(),
        progress: 0
      });
      setNewSubject('');
      loadSubjects(user.uid);
    } catch (error) {
      alert('Failed to add subject: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1>StudyFlow - AI-Powered Study Planner</h1>
          <p>Master your studies with AI-powered planning</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <button type="button" onClick={handleSignup}>Sign Up</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>StudyFlow - AI-Powered Study Planner</h1>
        <div>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="main-content">
        <h2>Your Subjects</h2>
        <form onSubmit={handleAddSubject} className="add-subject-form">
          <input
            type="text"
            placeholder="Add new subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button type="submit">Add Subject</button>
        </form>
        
        <div className="subjects-list">
          {subjects.length === 0 ? (
            <p>No subjects yet. Add your first subject above!</p>
          ) : (
            subjects.map((subject: any) => (
              <div key={subject.id} className="subject-card">
                <h3>{subject.name}</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
                <p>{subject.progress}% Complete</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
