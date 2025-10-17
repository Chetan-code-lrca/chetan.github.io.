// Application State
let userData = {
  name: "Student",
  subjects: [],
  studySessions: [],
  pomodoroSettings: {
    workDuration: 25,
    breakDuration: 5,
    completedToday: 0,
    totalFocusTime: 0
  },
  generatedSchedule: [],
  dailyGoal: 4,
  studyStreak: 0
};

// Timer state
let timerState = {
  isRunning: false,
  currentTime: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  sessionCount: 1,
  isBreak: false,
  interval: null
};

// Calendar state
let calendarState = {
  currentMonth: 9, // October (0-based)
  currentYear: 2025
};

// Motivational quotes
const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Focus on progress, not perfection.",
  "Study hard now, shine forever.",
  "Your future is created by what you do today.",
  "Every expert was once a beginner.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going."
];

// Priority colors for subjects
const priorityColors = {
  'High': '#ef4444',
  'Medium': '#f59e0b', 
  'Low': '#10b981'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupEventListeners();
  updateDashboard();
  updateProgressTracker();
  generateCalendar();
  loadSettings();
  showDailyQuote();
  
  // Set current date for forms
  const today = new Date().toISOString().split('T')[0];
  const sessionDateInput = document.getElementById('session-date');
  const examDateInput = document.getElementById('exam-date');
  
  if (sessionDateInput) sessionDateInput.value = today;
  if (examDateInput) examDateInput.min = today;
}

// Event Listeners Setup
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.getAttribute('data-view');
      switchView(view);
    });
  });
  
  // Study plan form
  document.getElementById('study-plan-form').addEventListener('submit', handleStudyPlanSubmit);
  
  // Pomodoro timer
  document.getElementById('start-pause-btn').addEventListener('click', toggleTimer);
  document.getElementById('reset-btn').addEventListener('click', resetTimer);
  document.getElementById('work-duration').addEventListener('change', updateTimerSettings);
  document.getElementById('break-duration').addEventListener('change', updateTimerSettings);
  
  // Add session form
  document.getElementById('add-session-form').addEventListener('submit', handleAddSession);
  
  // Settings
  document.getElementById('user-name').addEventListener('input', updateUserName);
  document.getElementById('default-work-duration').addEventListener('change', updateDefaultSettings);
  document.getElementById('default-break-duration').addEventListener('change', updateDefaultSettings);
  document.getElementById('daily-goal').addEventListener('change', updateDefaultSettings);
}

// View Management
function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Remove active class from nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected view
  const selectedView = document.getElementById(viewName);
  if (selectedView) {
    selectedView.classList.add('active');
  }
  
  // Add active class to selected nav button
  const selectedNavBtn = document.querySelector(`[data-view="${viewName}"]`);
  if (selectedNavBtn) {
    selectedNavBtn.classList.add('active');
  }
  
  // Update view-specific content
  if (viewName === 'progress') {
    updateProgressTracker();
  } else if (viewName === 'calendar') {
    generateCalendar();
  } else if (viewName === 'study-plan') {
    updateStudyPlansList();
    updateTimerSubjectOptions();
  }
}

// Dashboard Functions
function updateDashboard() {
  // Update user name
  document.getElementById('user-name-display').textContent = userData.name;
  
  // Update stats
  document.getElementById('total-subjects').textContent = userData.subjects.length;
  document.getElementById('upcoming-exams').textContent = getUpcomingExamsCount();
  document.getElementById('study-hours-today').textContent = getTodayStudyHours().toFixed(1);
  document.getElementById('current-streak').textContent = userData.studyStreak;
  
  // Update upcoming exams list
  updateUpcomingExamsList();
}

function getUpcomingExamsCount() {
  const today = new Date();
  return userData.subjects.filter(subject => {
    const examDate = new Date(subject.examDate);
    return examDate >= today;
  }).length;
}

function getTodayStudyHours() {
  const today = new Date().toISOString().split('T')[0];
  return userData.studySessions
    .filter(session => session.date === today)
    .reduce((total, session) => total + (session.duration / 60), 0);
}

function updateUpcomingExamsList() {
  const examList = document.getElementById('exam-list');
  const upcomingExams = userData.subjects
    .filter(subject => new Date(subject.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .slice(0, 5);
  
  if (upcomingExams.length === 0) {
    examList.innerHTML = '<p class="empty-state">No exams scheduled</p>';
    return;
  }
  
  examList.innerHTML = upcomingExams.map(subject => {
    const daysUntil = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    return `
      <div class="exam-item">
        <div>
          <div class="exam-name">${subject.name}</div>
          <div class="exam-date">${formatDate(subject.examDate)}</div>
        </div>
        <div class="exam-countdown">${daysUntil} days</div>
      </div>
    `;
  }).join('');
}

function showDailyQuote() {
  const quoteElement = document.getElementById('daily-quote');
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  quoteElement.textContent = randomQuote;
}

// Study Plan Functions
function addTopicField() {
  const container = document.getElementById('topics-container');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-control topic-input';
  input.placeholder = 'Enter a topic';
  input.required = true;
  
  // Add remove button for additional topics
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.gap = 'var(--space-8)';
  wrapper.style.alignItems = 'center';
  wrapper.appendChild(input);
  
  if (container.children.length > 0) {
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn--outline btn--sm';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => wrapper.remove();
    wrapper.appendChild(removeBtn);
  }
  
  container.appendChild(wrapper);
}

function handleStudyPlanSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const subjectName = document.getElementById('subject-name').value;
  const examDate = document.getElementById('exam-date').value;
  const priority = document.getElementById('priority').value;
  const dailyHours = parseFloat(document.getElementById('daily-hours').value);
  
  // Collect topics
  const topics = Array.from(document.querySelectorAll('.topic-input'))
    .map(input => input.value.trim())
    .filter(topic => topic !== '');
  
  if (topics.length === 0) {
    showNotification('Please add at least one topic', 'error');
    return;
  }
  
  // Create subject object
  const subject = {
    id: Date.now(),
    name: subjectName,
    topics: topics,
    examDate: examDate,
    priority: priority,
    dailyHours: dailyHours,
    completedTopics: [],
    progress: 0
  };
  
  // Add to subjects array
  userData.subjects.push(subject);
  
  // Generate schedule
  generateStudySchedule(subject);
  
  // Update UI
  updateStudyPlansList();
  updateDashboard();
  updateTimerSubjectOptions();
  
  // Reset form
  e.target.reset();
  document.getElementById('topics-container').innerHTML = '<input type="text" class="form-control topic-input" placeholder="Enter a topic" required>';
  
  showNotification('Study plan created successfully!', 'success');
}

function generateStudySchedule(subject) {
  const examDate = new Date(subject.examDate);
  const today = new Date();
  const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 0) {
    showNotification('Exam date must be in the future', 'error');
    return;
  }
  
  // Calculate priority weight
  const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const weight = priorityWeights[subject.priority];
  
  // Calculate sessions per topic
  const totalTopics = subject.topics.length;
  const sessionsPerTopic = Math.ceil((daysUntil * subject.dailyHours) / totalTopics);
  
  // Generate schedule entries
  const schedule = [];
  let currentDate = new Date(today);
  
  subject.topics.forEach((topic, topicIndex) => {
    for (let session = 0; session < sessionsPerTopic && currentDate < examDate; session++) {
      schedule.push({
        id: Date.now() + Math.random(),
        subjectId: subject.id,
        subjectName: subject.name,
        topic: topic,
        date: currentDate.toISOString().split('T')[0],
        duration: Math.min(subject.dailyHours * 60, 120), // Max 2 hours per session
        priority: subject.priority,
        completed: false
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  userData.generatedSchedule = userData.generatedSchedule.concat(schedule);
}

function updateStudyPlansList() {
  const plansList = document.getElementById('plans-list');
  
  if (userData.subjects.length === 0) {
    plansList.innerHTML = '<p class="empty-state">No study plans created yet</p>';
    return;
  }
  
  plansList.innerHTML = userData.subjects.map(subject => {
    const daysUntil = Math.ceil((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    const progress = calculateSubjectProgress(subject);
    
    return `
      <div class="plan-item">
        <div class="plan-header">
          <h4 class="plan-title">${subject.name}</h4>
          <span class="plan-priority ${subject.priority.toLowerCase()}">${subject.priority}</span>
        </div>
        <div class="plan-details">
          <div class="plan-detail">
            <div class="plan-detail-label">Exam Date</div>
            <div class="plan-detail-value">${formatDate(subject.examDate)}</div>
          </div>
          <div class="plan-detail">
            <div class="plan-detail-label">Days Left</div>
            <div class="plan-detail-value">${daysUntil} days</div>
          </div>
          <div class="plan-detail">
            <div class="plan-detail-label">Progress</div>
            <div class="plan-detail-value">${progress}%</div>
          </div>
        </div>
        <div class="plan-topics">
          <strong>Topics:</strong> ${subject.topics.join(', ')}
        </div>
        <div class="plan-actions" style="margin-top: var(--space-16);">
          <button class="btn btn--outline btn--sm" onclick="exportSubjectPlan(${subject.id})">Export</button>
          <button class="btn btn--outline btn--sm" onclick="deleteSubject(${subject.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Pomodoro Timer Functions
function updateTimerSettings() {
  const workDuration = parseInt(document.getElementById('work-duration').value);
  const breakDuration = parseInt(document.getElementById('break-duration').value);
  
  userData.pomodoroSettings.workDuration = workDuration;
  userData.pomodoroSettings.breakDuration = breakDuration;
  
  if (!timerState.isRunning) {
    timerState.currentTime = workDuration * 60;
    timerState.totalTime = workDuration * 60;
    updateTimerDisplay();
  }
}

function toggleTimer() {
  const btn = document.getElementById('start-pause-btn');
  
  if (timerState.isRunning) {
    // Pause timer
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    btn.textContent = 'Start';
  } else {
    // Start timer
    timerState.isRunning = true;
    btn.textContent = 'Pause';
    
    timerState.interval = setInterval(() => {
      timerState.currentTime--;
      updateTimerDisplay();
      
      if (timerState.currentTime <= 0) {
        completeTimerSession();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.isBreak = false;
  timerState.sessionCount = 1;
  
  const workDuration = parseInt(document.getElementById('work-duration').value);
  timerState.currentTime = workDuration * 60;
  timerState.totalTime = workDuration * 60;
  
  updateTimerDisplay();
  document.getElementById('start-pause-btn').textContent = 'Start';
  document.getElementById('session-type').textContent = 'Work Session';
  document.getElementById('session-count').textContent = `Session ${timerState.sessionCount} of ∞`;
}

function completeTimerSession() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  
  if (!timerState.isBreak) {
    // Completed work session
    userData.pomodoroSettings.completedToday++;
    userData.pomodoroSettings.totalFocusTime += userData.pomodoroSettings.workDuration;
    
    // Log session if subject is selected
    const selectedSubject = document.getElementById('timer-subject').value;
    if (selectedSubject) {
      logPomodoroSession(selectedSubject, userData.pomodoroSettings.workDuration);
    }
    
    showNotification('Work session completed! Time for a break.', 'success');
    
    // Switch to break
    timerState.isBreak = true;
    timerState.currentTime = userData.pomodoroSettings.breakDuration * 60;
    timerState.totalTime = userData.pomodoroSettings.breakDuration * 60;
    document.getElementById('session-type').textContent = 'Break Time';
  } else {
    // Completed break
    showNotification('Break completed! Ready for the next session.', 'success');
    
    // Switch back to work
    timerState.isBreak = false;
    timerState.sessionCount++;
    timerState.currentTime = userData.pomodoroSettings.workDuration * 60;
    timerState.totalTime = userData.pomodoroSettings.workDuration * 60;
    document.getElementById('session-type').textContent = 'Work Session';
  }
  
  document.getElementById('session-count').textContent = `Session ${timerState.sessionCount} of ∞`;
  document.getElementById('start-pause-btn').textContent = 'Start';
  
  updateTimerDisplay();
  updatePomodoroStats();
  updateDashboard();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerState.currentTime / 60);
  const seconds = timerState.currentTime % 60;
  
  document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
  
  // Update progress ring
  const progressCircle = document.getElementById('progress-circle');
  const progress = (timerState.totalTime - timerState.currentTime) / timerState.totalTime;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const offset = circumference - (progress * circumference);
  
  progressCircle.style.strokeDashoffset = offset;
}

function updatePomodoroStats() {
  document.getElementById('completed-sessions').textContent = userData.pomodoroSettings.completedToday;
  document.getElementById('total-focus-time').textContent = userData.pomodoroSettings.totalFocusTime;
}

function logPomodoroSession(subjectName, duration) {
  const now = new Date();
  const session = {
    id: Date.now(),
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
    subject: subjectName,
    duration: duration,
    topicsCovered: 'Pomodoro session',
    notes: 'Completed via Pomodoro timer'
  };
  
  userData.studySessions.push(session);
}

// Progress Tracker Functions
function updateProgressTracker() {
  updateSubjectProgress();
  updateSessionsTable();
}

function updateSubjectProgress() {
  const progressContainer = document.getElementById('subject-progress');
  
  if (userData.subjects.length === 0) {
    progressContainer.innerHTML = '<p class="empty-state">No subjects added yet</p>';
    return;
  }
  
  progressContainer.innerHTML = userData.subjects.map(subject => {
    const progress = calculateSubjectProgress(subject);
    const progressClass = progress >= 70 ? 'high' : progress >= 40 ? 'medium' : 'low';
    
    return `
      <div class="subject-progress-item">
        <div class="progress-subject-name">${subject.name}</div>
        <div class="progress-bar">
          <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
        </div>
        <div class="progress-percentage">${progress}%</div>
      </div>
    `;
  }).join('');
}

function calculateSubjectProgress(subject) {
  if (!subject.topics || subject.topics.length === 0) return 0;
  
  const completedTopics = subject.completedTopics || [];
  const progress = (completedTopics.length / subject.topics.length) * 100;
  
  return Math.round(progress);
}

function updateSessionsTable() {
  const tbody = document.getElementById('sessions-tbody');
  
  if (userData.studySessions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No study sessions recorded</td></tr>';
    return;
  }
  
  // Sort sessions by date (newest first)
  const sortedSessions = userData.studySessions.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA;
  });
  
  tbody.innerHTML = sortedSessions.map(session => `
    <tr>
      <td>${formatDate(session.date)} ${session.time}</td>
      <td>${session.subject}</td>
      <td>${session.duration} min</td>
      <td>${session.topicsCovered || '-'}</td>
      <td>${session.notes || '-'}</td>
      <td class="session-actions">
        <button class="btn btn--outline btn--sm" onclick="deleteSession(${session.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Calendar Functions
function generateCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthYearDisplay = document.getElementById('calendar-month-year');
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  monthYearDisplay.textContent = `${monthNames[calendarState.currentMonth]} ${calendarState.currentYear}`;
  
  // Clear existing calendar
  calendarGrid.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    calendarGrid.appendChild(header);
  });
  
  // Get first day of month and number of days
  const firstDay = new Date(calendarState.currentYear, calendarState.currentMonth, 1).getDay();
  const daysInMonth = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0).getDate();
  const today = new Date();
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day other-month';
    calendarGrid.appendChild(emptyDay);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    // Check if it's today
    const currentDate = new Date(calendarState.currentYear, calendarState.currentMonth, day);
    if (currentDate.toDateString() === today.toDateString()) {
      dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Add events for this day
    const dateString = currentDate.toISOString().split('T')[0];
    const dayEvents = getEventsForDate(dateString);
    
    if (dayEvents.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'calendar-events';
      
      dayEvents.slice(0, 2).forEach(event => { // Show max 2 events per day
        const eventElement = document.createElement('div');
        eventElement.className = 'calendar-event';
        eventElement.textContent = event.title;
        eventElement.style.backgroundColor = event.color;
        eventsContainer.appendChild(eventElement);
      });
      
      if (dayEvents.length > 2) {
        const moreElement = document.createElement('div');
        moreElement.className = 'calendar-event';
        moreElement.textContent = `+${dayEvents.length - 2} more`;
        moreElement.style.backgroundColor = '#6b7280';
        eventsContainer.appendChild(moreElement);
      }
      
      dayElement.appendChild(eventsContainer);
    }
    
    calendarGrid.appendChild(dayElement);
  }
  
  updateCalendarLegend();
}

function getEventsForDate(dateString) {
  const events = [];
  
  // Add study sessions
  userData.studySessions.forEach(session => {
    if (session.date === dateString) {
      events.push({
        title: session.subject,
        color: getSubjectColor(session.subject),
        type: 'session'
      });
    }
  });
  
  // Add scheduled study sessions from generated schedule
  userData.generatedSchedule.forEach(schedule => {
    if (schedule.date === dateString) {
      events.push({
        title: `${schedule.subjectName} - ${schedule.topic}`,
        color: getSubjectColor(schedule.subjectName),
        type: 'scheduled'
      });
    }
  });
  
  // Add exams
  userData.subjects.forEach(subject => {
    if (subject.examDate === dateString) {
      events.push({
        title: `📝 ${subject.name} Exam`,
        color: '#ef4444',
        type: 'exam'
      });
    }
  });
  
  return events;
}

function getSubjectColor(subjectName) {
  const subject = userData.subjects.find(s => s.name === subjectName);
  if (subject) {
    return priorityColors[subject.priority];
  }
  return '#6b7280'; // Default gray
}

function updateCalendarLegend() {
  const legendContainer = document.getElementById('calendar-legend');
  const uniqueSubjects = [...new Set(userData.subjects.map(s => s.name))];
  
  if (uniqueSubjects.length === 0) {
    legendContainer.innerHTML = '<p class="empty-state">No subjects to display</p>';
    return;
  }
  
  legendContainer.innerHTML = uniqueSubjects.map(subjectName => {
    const color = getSubjectColor(subjectName);
    return `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${color}"></div>
        <span>${subjectName}</span>
      </div>
    `;
  }).join('');
}

function previousMonth() {
  calendarState.currentMonth--;
  if (calendarState.currentMonth < 0) {
    calendarState.currentMonth = 11;
    calendarState.currentYear--;
  }
  generateCalendar();
}

function nextMonth() {
  calendarState.currentMonth++;
  if (calendarState.currentMonth > 11) {
    calendarState.currentMonth = 0;
    calendarState.currentYear++;
  }
  generateCalendar();
}

// Modal Functions
function showAddSessionModal() {
  const modal = document.getElementById('add-session-modal');
  const subjectSelect = document.getElementById('session-subject');
  
  // Populate subject options
  subjectSelect.innerHTML = '<option value="">Select subject</option>' +
    userData.subjects.map(subject => `<option value="${subject.name}">${subject.name}</option>`).join('');
  
  // Set current date and time
  const now = new Date();
  document.getElementById('session-date').value = now.toISOString().split('T')[0];
  document.getElementById('session-time').value = now.toTimeString().slice(0, 5);
  
  modal.style.display = 'flex';
}

function closeAddSessionModal() {
  const modal = document.getElementById('add-session-modal');
  modal.style.display = 'none';
  document.getElementById('add-session-form').reset();
}

function handleAddSession(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const session = {
    id: Date.now(),
    date: document.getElementById('session-date').value,
    time: document.getElementById('session-time').value,
    subject: document.getElementById('session-subject').value,
    duration: parseInt(document.getElementById('session-duration').value),
    topicsCovered: document.getElementById('session-topics').value || '-',
    notes: document.getElementById('session-notes').value || '-'
  };
  
  userData.studySessions.push(session);
  
  closeAddSessionModal();
  updateProgressTracker();
  updateDashboard();
  generateCalendar();
  
  showNotification('Study session added successfully!', 'success');
}

// Settings Functions
function loadSettings() {
  document.getElementById('user-name').value = userData.name;
  document.getElementById('default-work-duration').value = userData.pomodoroSettings.workDuration;
  document.getElementById('default-break-duration').value = userData.pomodoroSettings.breakDuration;
  document.getElementById('daily-goal').value = userData.dailyGoal;
}

function updateUserName() {
  userData.name = document.getElementById('user-name').value || 'Student';
  updateDashboard();
}

function updateDefaultSettings() {
  userData.pomodoroSettings.workDuration = parseInt(document.getElementById('default-work-duration').value);
  userData.pomodoroSettings.breakDuration = parseInt(document.getElementById('default-break-duration').value);
  userData.dailyGoal = parseFloat(document.getElementById('daily-goal').value);
  
  // Update timer settings if on pomodoro view
  document.getElementById('work-duration').value = userData.pomodoroSettings.workDuration;
  document.getElementById('break-duration').value = userData.pomodoroSettings.breakDuration;
  
  updateTimerSettings();
}

function updateTimerSubjectOptions() {
  const timerSubjectSelect = document.getElementById('timer-subject');
  timerSubjectSelect.innerHTML = '<option value="">No specific subject</option>' +
    userData.subjects.map(subject => `<option value="${subject.name}">${subject.name}</option>`).join('');
}

// Data Management Functions
function exportData() {
  const dataToExport = {
    userData: userData,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `study-planner-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('Data exported successfully!', 'success');
}

function exportSubjectPlan(subjectId) {
  const subject = userData.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  
  const subjectSchedule = userData.generatedSchedule.filter(s => s.subjectId === subjectId);
  const exportData = {
    subject: subject,
    schedule: subjectSchedule,
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `${subject.name.replace(/\s+/g, '-').toLowerCase()}-study-plan.json`;
  link.click();
  
  showNotification(`${subject.name} plan exported successfully!`, 'success');
}

function confirmClearData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    clearAllData();
  }
}

function clearAllData() {
  userData = {
    name: "Student",
    subjects: [],
    studySessions: [],
    pomodoroSettings: {
      workDuration: 25,
      breakDuration: 5,
      completedToday: 0,
      totalFocusTime: 0
    },
    generatedSchedule: [],
    dailyGoal: 4,
    studyStreak: 0
  };
  
  // Reset timer
  resetTimer();
  
  // Update all views
  updateDashboard();
  updateProgressTracker();
  generateCalendar();
  updateStudyPlansList();
  loadSettings();
  
  showNotification('All data cleared successfully!', 'success');
}

// Utility Functions
function deleteSubject(subjectId) {
  if (confirm('Are you sure you want to delete this subject and its study plan?')) {
    userData.subjects = userData.subjects.filter(s => s.id !== subjectId);
    userData.generatedSchedule = userData.generatedSchedule.filter(s => s.subjectId !== subjectId);
    
    updateStudyPlansList();
    updateDashboard();
    updateProgressTracker();
    generateCalendar();
    updateTimerSubjectOptions();
    
    showNotification('Subject deleted successfully!', 'success');
  }
}

function deleteSession(sessionId) {
  if (confirm('Are you sure you want to delete this study session?')) {
    userData.studySessions = userData.studySessions.filter(s => s.id !== sessionId);
    
    updateProgressTracker();
    updateDashboard();
    generateCalendar();
    
    showNotification('Study session deleted successfully!', 'success');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Initialize pomodoro stats on load
document.addEventListener('DOMContentLoaded', function() {
  updatePomodoroStats();
});