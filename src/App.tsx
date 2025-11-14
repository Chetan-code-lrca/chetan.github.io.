import React, { useState } from 'react';
import '../style.css';

function App() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    setSubjects([...subjects, newSubject]);
    setNewSubject('');
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>StudyFlow - AI-Powered Study Planner</h1>
        <p>Master your studies with organized planning</p>
      </div>
      
      <div className="main-content">
        <h2>Your Subjects</h2>
        <form onSubmit={handleAddSubject} className="add-subject-form">
          <input
            type="text"
            placeholder="Add new subject (e.g., Data Structures, DBMS)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button type="submit">Add Subject</button>
        </form>
        
        <div className="subjects-list">
          {subjects.length === 0 ? (
            <p className="empty-message">No subjects yet. Add your first subject above!</p>
          ) : (
            subjects.map((subject, index) => (
              <div key={index} className="subject-card">
                <h3>{subject}</h3>
                <button 
                  onClick={() => handleRemoveSubject(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="footer">
        <p>Built with React + Vite | StudyFlow © 2025</p>
      </div>
    </div>
  );
}

export default App;
