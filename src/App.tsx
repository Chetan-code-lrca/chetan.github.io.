import React, { useState } from 'react';
import '../style.css';

function App() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim()) {
      setSubjects([...subjects, newSubject]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          animation: 'fadeIn 0.8s ease-in'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            📚 StudyFlow
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '300'
          }}>
            Organize your learning journey
          </p>
        </div>

        {/* Add Subject Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.6s ease-out'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#333',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Add New Subject
          </h2>
          <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name (e.g., Mathematics, Physics)"
              style={{
                flex: 1,
                padding: '15px 20px',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="submit"
              style={{
                padding: '15px 35px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              Add Subject
            </button>
          </form>
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 style={{
            fontSize: '1.8rem',
            color: 'white',
            marginBottom: '20px',
            fontWeight: '700'
          }}>
            My Subjects ({subjects.length})
          </h2>
          
          {subjects.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '60px 20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px dashed rgba(255,255,255,0.3)'
            }}>
              <p style={{
                fontSize: '1.3rem',
                color: 'white',
                marginBottom: '10px'
              }}>
                🎯 No subjects yet
              </p>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                Add your first subject above to get started!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              animation: 'fadeIn 0.5s ease-in'
            }}>
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '25px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                    position: 'relative',
                    animation: `slideUp 0.4s ease-out ${index * 0.1}s backwards`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      fontSize: '2rem'
                    }}>
                      📖
                    </span>
                    <button
                      onClick={() => handleRemoveSubject(index)}
                      style={{
                        background: '#ff4757',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff3838';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ff4757';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title="Remove subject"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    color: '#333',
                    marginBottom: '10px',
                    fontWeight: '600',
                    wordWrap: 'break-word'
                  }}>
                    {subject}
                  </h3>
                  <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '2px',
                    marginTop: '15px'
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.9rem'
        }}>
          <p>Built with ❤️ using React + Vite | StudyFlow © 2025</p>
        </div>
      </div>

      <style>{
        `@keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }`
      }</style>
    </div>
  );
}

export default App;
