const pageId = document.body.dataset.pageId || 'dashboard';
const pageTitle = document.body.dataset.pageTitle || 'Dashboard';
const pageSubtitle = document.body.dataset.pageSubtitle || '';

const atViews = /\/views\//.test(window.location.pathname);
const rootRel = atViews ? '../../' : '';

const navItems = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', route: rootRel + 'dashboard.html' },
  { id: 'admins', icon: '🔒', label: 'Admins', route: rootRel + 'views/admins/admins_index.html' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant', route: rootRel + 'views/ai/ai_index.html' },
  { id: 'content', icon: '📚', label: 'Content Hub', route: rootRel + 'views/content/content_index.html' },
  { id: 'flashcards', icon: '🧠', label: 'Flashcards', route: rootRel + 'views/flashcards/flashcards_index.html' },
  { id: 'quizzes', icon: '✏️', label: 'Quizzes', route: rootRel + 'views/quizzes/quizzes_index.html' },
  { id: 'planner', icon: '🗓️', label: 'Planner', route: rootRel + 'views/planner/planner_index.html' },
  { id: 'analytics', icon: '📊', label: 'Analytics', route: rootRel + 'views/analytics/analytics_index.html' },
  { id: 'tutors', icon: '🧑‍🏫', label: 'Tutors', route: rootRel + 'views/tutors/tutors_index.html' },
];

const appData = {
  pageTitle, pageSubtitle,
  activeNav: pageId,
  navItems,
  rootRel,
  userName: 'Alex Chen',
  initials: 'AC',
  stats: [
    { icon: '📈', value: '82%', label: 'Focus Score', change: '+8%', bg: '#d9f7e4', color: '#1f7a4c' },
    { icon: '🧠', value: '14', label: 'Completed Lessons', change: '+2', bg: '#eef7ff', color: '#1c5db6' },
    { icon: '⏱️', value: '6h 24m', label: 'Study Time', change: '+1h', bg: '#fff4e6', color: '#b25f11' },
  ],
  quickActions: [
    { icon: '📝', name: 'Write Notes', desc: 'Capture quick ideas from class.' },
    { icon: '⚡', name: 'Skill Drills', desc: 'Practice short review sessions.' },
    { icon: '📅', name: 'Plan Study', desc: 'Schedule tasks for the week.' },
  ],
  quizzes: [
    { id: 'bio-5', title: 'Biology — Chapter 5', desc: 'Cell structure and function', questions: 10, time: '10m', difficulty: 'Medium' },
    { id: 'chem-1', title: 'Chemistry — Basics', desc: 'Atoms, molecules, bonds', questions: 12, time: '12m', difficulty: 'Easy' },
    { id: 'math-quiz', title: 'Algebra Practice', desc: 'Linear equations', questions: 8, time: '8m', difficulty: 'Hard' },
  ],
  activity: [
    { icon: '✅', title: 'Finished Chapter 3 Quiz', sub: '10 min ago', time: '10m', bg: '#edf7f0' },
    { icon: '🔔', title: 'New tutor message', sub: '30 min ago', time: '30m', bg: '#f3f5ff' },
    { icon: '📌', title: 'Study plan updated', sub: '1 hour ago', time: '1h', bg: '#fff3f0' },
  ],
  upcoming: [
    { name: 'Biology Quiz', date: 'Today · 5:00 PM', tag: 'Due', dotColor: '#d92d20', badgeBg: '#ffe5e1' },
    { name: 'Essay Draft', date: 'Tomorrow · 11:00 AM', tag: 'Soon', dotColor: '#f59e0b', badgeBg: '#fff4db' },
    { name: 'Flashcards Review', date: 'Friday · 9:00 AM', tag: 'Plan', dotColor: '#1d4ed8', badgeBg: '#e0e7ff' },
  ],
  tutors: [
    {
      id: 'tutor-1',
      name: 'Dr. Sarah Jenkins',
      avatar: 'assets/tutor-sarah.png',
      status: 'available',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.9,
      reviewsCount: 42,
      rate: 45,
      bio: 'Former university professor with 10+ years teaching science courses.'
    },
    {
      id: 'tutor-2',
      name: 'Prof. James Miller',
      avatar: 'assets/tutor-james.png',
      status: 'available',
      subjects: ['Mathematics', 'Physics'],
      rating: 4.8,
      reviewsCount: 38,
      rate: 50,
      bio: 'Passionate about making calculus and physics intuitive and visual.'
    },
    {
      id: 'tutor-3',
      name: 'Mrs. Emily Chen',
      avatar: 'assets/tutor-emily.png',
      status: 'busy',
      subjects: ['English Literature', 'History'],
      rating: 4.7,
      reviewsCount: 29,
      rate: 40,
      bio: "Dedicated to improving students' essay writing and critical analysis skills."
    },
    {
      id: 'tutor-4',
      name: 'Mr. David Kross',
      avatar: 'assets/tutor-david.png',
      status: 'available',
      subjects: ['Computer Science', 'Mathematics'],
      rating: 5.0,
      reviewsCount: 15,
      rate: 55,
      bio: 'Software engineer teaching algorithms and high school geometry.'
    }
  ],
  tutorSearchQuery: '',
  tutorSelectedSubject: 'All',
  tutorSelectedStatus: 'All',
  bookingTutor: null,
  bookingDate: '',
  bookingTime: '',
  bookingDuration: 1,
  bookedSessions: [],
  // Admin Page State
  adminActiveTab: 'tutors',
  adminSearchQuery: '',
  showAddTutorModal: false,
  showEditTutorModal: false,
  adminTutorForm: {
    name: '',
    rate: 30,
    subjects: '',
    status: 'available',
    bio: ''
  },
  editingTutorId: null
};

// ── Sidebar component (fully self-contained template string) ──────────────
const SidebarComponent = {
  props: ['navItems', 'activeNav', 'userName', 'initials'],
  emits: ['update:activeNav', 'logout'],
  template: `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">📚</div>
        <div>
          <div class="sidebar-brand-name">PrepPal</div>
          <div class="sidebar-brand-sub">AI Study Assistant</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <a v-for="item in navItems" :key="item.id"
           :href="item.route"
           class="nav-item"
           :class="{ active: activeNav === item.id }">
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </nav>
      <div class="tip-box">
        <div class="tip-title">💡 Study Tip</div>
        <div class="tip-text">Take breaks every 25 minutes for better retention.</div>
      </div>
      <div class="sidebar-user">
        <div class="avatar">{{ initials }}</div>
        <div>
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">Student</div>
        </div>
        <button class="logout-btn" @click="$emit('logout')" title="Sign out">⏻</button>
      </div>
    </aside>
  `,
};

// ── Per-page main content templates ──────────────────────────────────────
const pageTemplates = {
  default: `
    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>
    <div class="card">
      <p>Use the sidebar to navigate between features.</p>
    </div>
  `,
  dashboard: `
    <div class="topbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search notes, quizzes, flashcards…" />
      </div>
      <div class="notif-btn">🔔<span class="notif-dot"></span></div>
      <div class="topbar-avatar">{{ initials }}</div>
    </div>
    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>
    <div class="stats-row">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-top">
          <div class="stat-icon" :style="{ background: s.bg }">{{ s.icon }}</div>
          <span class="stat-badge" :style="{ background: s.bg, color: s.color }">{{ s.change }}</span>
        </div>
        <div class="stat-val">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>
    <div class="section-title">Quick Actions</div>
    <div class="quick-actions">
      <div class="qa-card" v-for="q in quickActions" :key="q.name">
        <div class="qa-icon">{{ q.icon }}</div>
        <div class="qa-name">{{ q.name }}</div>
        <div class="qa-desc">{{ q.desc }}</div>
      </div>
    </div>
    <div class="bottom-grid">
      <div class="card">
        <div class="section-title">Recent Activity</div>
        <div class="activity-list">
          <div class="activity-item" v-for="a in activity" :key="a.title">
            <div class="act-icon" :style="{ background: a.bg }">{{ a.icon }}</div>
            <div>
              <div class="act-title">{{ a.title }}</div>
              <div class="act-sub">{{ a.sub }}</div>
            </div>
            <div class="act-time">{{ a.time }}</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Upcoming Deadlines</div>
        <div class="upcoming-list">
          <div class="upcoming-item" v-for="u in upcoming" :key="u.name" :class="u.color">
            <span class="upcoming-dot" :style="{ background: u.dotColor }"></span>
            <div>
              <div class="upcoming-name">{{ u.name }}</div>
              <div class="upcoming-date">{{ u.date }}</div>
            </div>
            <span class="upcoming-badge" :style="{ background: u.badgeBg, color: u.dotColor }">{{ u.tag }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  quizzes: `
    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>
    <div class="section-title">Available Quizzes</div>
    <div class="quick-actions">
      <div class="qa-card" v-for="q in quizzes" :key="q.id">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div style="font-weight:700;margin-bottom:6px;">{{ q.title }}</div>
            <div style="font-size:.86rem;color:var(--muted);">{{ q.desc }} • {{ q.questions }} questions • {{ q.time }}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
            <button class="btn-primary" style="width:auto;padding:8px 18px;" @click="startQuiz(q.id)">Start</button>
            <div style="font-size:.78rem;color:var(--muted);">{{ q.difficulty }}</div>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:18px;" class="card">
      <div class="section-title">Quiz History</div>
      <p style="color:var(--muted);margin-top:8px;">No recent attempts yet — take a quiz to see progress here.</p>
    </div>
  `,
  tutors: `
    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>

    <!-- Tutors Search Bar -->
      <div class="tutors-search-section card">
        <div class="search-input-wrap">
          <input 
            type="text" 
            v-model="tutorSearchQuery" 
            placeholder="Search tutors by name or subject (e.g. Mathematics, Biology)..." 
          />
          <button 
            v-if="tutorSearchQuery" 
            class="clear-search-btn" 
            @click="tutorSearchQuery = ''"
            title="Clear search"
          >
            ×
          </button>
        </div>
      </div>

    <!-- Filters Panel -->
    <div class="filter-panel card">
      <div class="filter-group">
        <span class="filter-label">Filter by Subject:</span>
        <div class="filter-tabs">
          <button 
            v-for="sub in ['All', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'English Literature', 'History', 'Computer Science']" 
            :key="sub"
            class="filter-tab"
            :class="{ active: tutorSelectedSubject === sub }"
            @click="tutorSelectedSubject = sub"
          >
            {{ sub }}
          </button>
        </div>
      </div>
      <!-- disabled filter by status -->
      <!-- <div class="filter-row-secondary">
        <div class="filter-group">
          <span class="filter-label">Filter by Status:</span>
          <div class="filter-tabs">
            <button 
              v-for="status in ['All', 'available', 'busy']" 
              :key="status"
              class="filter-tab-sm"
              :class="{ active: tutorSelectedStatus === status }"
              @click="tutorSelectedStatus = status"
            >
              {{ status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1) }}
            </button>
          </div>
        </div>
      </div> -->
    </div>
    
      <!-- Tutors Grid -->
    <div class="section-title">Available Tutors ({{ filteredTutors.length }})</div>
    
    <div v-if="filteredTutors.length === 0" class="no-tutors-state card">
      <div class="no-tutors-icon">🧑‍🏫</div>
      <h3>No Tutors Found</h3>
      <p>Try adjusting your search filters or check back later.</p>
    </div>

    <div v-else class="tutors-grid">
      <div v-for="tutor in filteredTutors" :key="tutor.id" class="tutor-card" :class="{ 'tutor-busy': tutor.status === 'busy' }">
        <div class="tutor-card-header">
          <span :class="['status-badge', tutor.status]">
            <span class="status-dot"></span>
            {{ tutor.status === 'available' ? 'Available' : 'Busy' }}
          </span>
          <span class="tutor-rate">RM{{ tutor.rate }}/hr</span>
        </div>
        
        <div class="tutor-profile">
          <div class="tutor-avatar-wrap">
            <img :src="rootRel + tutor.avatar" :alt="tutor.name" class="tutor-avatar-img" />
          </div>
          <h3 class="tutor-name">{{ tutor.name }}</h3>
          <div class="tutor-rating">
            <span class="star-icon">⭐</span>
            <span class="rating-val">{{ tutor.rating }}</span>
            <span class="reviews-count">({{ tutor.reviewsCount }} reviews)</span>
          </div>
        </div>

        <p class="tutor-bio">{{ tutor.bio }}</p>

        <div class="tutor-subjects">
          <span v-for="sub in tutor.subjects" :key="sub" class="subject-tag">{{ sub }}</span>
        </div>

        <div class="tutor-card-actions">
          <button 
            class="btn-primary tutor-book-btn" 
            :disabled="tutor.status === 'busy'" 
            @click="openBookingModal(tutor)"
          >
            {{ tutor.status === 'available' ? 'Book Session' : 'Fully Booked' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Booked Sessions Section -->
    <div v-if="bookedSessions.length > 0" class="card booked-sessions-card" style="margin-top:32px;">
      <div class="section-title" style="margin-bottom:16px;">Your Booked Sessions</div>
      <div class="booked-sessions-list">
        <div v-for="session in bookedSessions" :key="session.id" class="booked-session-item">
          <div class="session-avatar-wrap">
            <img :src="rootRel + session.tutor.avatar" class="session-tutor-avatar" />
          </div>
          <div class="session-details">
            <div class="session-tutor-name">{{ session.tutor.name }}</div>
            <div class="session-meta">
              <span>📅 {{ session.date }}</span>
              <span>⏰ {{ session.time }} ({{ session.duration }}h)</span>
              <span>💰 RM{{ session.totalCost }}</span>
            </div>
            <div class="session-subjects">
              <span v-for="sub in session.tutor.subjects" class="subject-tag-xs">{{ sub }}</span>
            </div>
          </div>
          <span class="session-status-badge">Confirmed</span>
        </div>
      </div>
    </div>

    <!-- Booking Confirmation Modal -->
    <div v-if="bookingTutor" class="booking-modal-overlay" @click.self="bookingTutor = null">
      <div class="booking-modal card">
        <div class="modal-header">
          <h3>Book Study Session</h3>
          <button class="modal-close-btn" @click="bookingTutor = null">×</button>
        </div>
        <div class="modal-tutor-summary">
          <img :src="rootRel + bookingTutor.avatar" class="modal-tutor-avatar" />
          <div>
            <div class="modal-tutor-name">{{ bookingTutor.name }}</div>
            <div class="modal-tutor-rate">\${{ bookingTutor.rate }}/hr · Study Session</div>
          </div>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Select Date</label>
            <input type="date" v-model="bookingDate" required />
          </div>
          <div class="field">
            <label>Select Start Time</label>
            <input type="time" v-model="bookingTime" required />
          </div>
          <div class="field">
            <label>Duration (Hours)</label>
            <select v-model.number="bookingDuration" class="modal-select">
              <option :value="1">1 Hour</option>
              <option :value="2">2 Hours</option>
              <option :value="3">3 Hours</option>
              <option :value="4">4 Hours</option>
            </select>
          </div>
          <div class="cost-summary">
            <div class="cost-row">
              <span>Rate</span>
              <span>\${{ bookingTutor.rate }} / hr</span>
            </div>
            <div class="cost-row">
              <span>Duration</span>
              <span>{{ bookingDuration }} hr(s)</span>
            </div>
            <hr class="cost-divider" />
            <div class="cost-row total-row">
              <span>Total Cost</span>
              <span class="total-price">\${{ bookingTutor.rate * bookingDuration }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" style="width: auto; padding: 12px 24px;" @click="bookingTutor = null">Cancel</button>
          <button class="btn-primary" style="width: auto; padding: 12px 24px;" @click="confirmBooking">Confirm Booking</button>
        </div>
      </div>
    </div>
  `,
  planner: `
<div class="topbar">
  <div class="search-wrap">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="Search notes, quizzes, flashcards…" />
  </div>
  <div class="notif-btn">🔔<span class="notif-dot"></span></div>
  <div class="topbar-avatar">{{ initials }}</div>
</div>

<div class="greeting">
  <h1>{{ pageTitle }}</h1>
  <p>{{ pageSubtitle }}</p>
</div>

<div class="bottom-grid">

  <div class="card">
    <div class="section-title">📅 Study Planner</div>

    <div class="activity-list">

      <div class="activity-item">
        <div class="act-icon">📘</div>
        <div>
          <div class="act-title">Mathematics Revision</div>
          <div class="act-sub">Deadline: May 10</div>
        </div>
        <div class="act-time">Pending</div>
      </div>

      <div class="activity-item">
        <div class="act-icon">🧬</div>
        <div>
          <div class="act-title">Biology Assignment</div>
          <div class="act-sub">Deadline: May 12</div>
        </div>
        <div class="act-time">In Progress</div>
      </div>

      <div class="activity-item">
        <div class="act-icon">📝</div>
        <div>
          <div class="act-title">Chemistry Quiz Prep</div>
          <div class="act-sub">Deadline: May 15</div>
        </div>
        <div class="act-time">Pending</div>
      </div>

    </div>
  </div>

  <div class="card">
    <div class="section-title">🤖 AI Study Schedule</div>

    <div class="upcoming-list">

      <div class="upcoming-item">
        <div>
          <div class="upcoming-name">Mon–Tue</div>
          <div class="upcoming-date">Math & Physics</div>
        </div>
        <span class="upcoming-badge">4h/day</span>
      </div>

      <div class="upcoming-item">
        <div>
          <div class="upcoming-name">Wed–Thu</div>
          <div class="upcoming-date">Biology & Chemistry</div>
        </div>
        <span class="upcoming-badge">3.5h/day</span>
      </div>

      <div class="upcoming-item">
        <div>
          <div class="upcoming-name">Friday</div>
          <div class="upcoming-date">Review & Practice</div>
        </div>
        <span class="upcoming-badge">5h</span>
      </div>

      <div class="upcoming-item">
        <div>
          <div class="upcoming-name">Weekend</div>
          <div class="upcoming-date">Mock Tests</div>
        </div>
        <span class="upcoming-badge">3h</span>
      </div>

    </div>

    <button class="btn-primary" style="margin-top:20px;">
      Generate New Plan
    </button>
  </div>

</div>
`,
analytics: `
<div class="topbar">
  <div class="search-wrap">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="Search notes, quizzes, flashcards…" />
  </div>
  <div class="notif-btn">🔔<span class="notif-dot"></span></div>
  <div class="topbar-avatar">{{ initials }}</div>
</div>

<div class="greeting">
  <h1>{{ pageTitle }}</h1>
  <p>{{ pageSubtitle }}</p>
</div>

<div class="stats-row">

  <div class="stat-card">
    <div class="stat-val">26.5 hrs</div>
    <div class="stat-label">Total Study Time</div>
  </div>

  <div class="stat-card">
    <div class="stat-val">92%</div>
    <div class="stat-label">Average Quiz Score</div>
  </div>

  <div class="stat-card">
    <div class="stat-val">85%</div>
    <div class="stat-label">Weekly Goal Completion</div>
  </div>

  <div class="stat-card">
    <div class="stat-val">12</div>
    <div class="stat-label">Study Streak (Days)</div>
  </div>

</div>

<div class="bottom-grid">

  <div class="card">
    <div class="section-title">💪 Strengths</div>

    <div class="activity-list">

      <div class="activity-item">
        <div class="act-icon">🧪</div>
        <div>
          <div class="act-title">Chemistry</div>
          <div class="act-sub">95% average quiz score</div>
        </div>
      </div>

      <div class="activity-item">
        <div class="act-icon">➗</div>
        <div>
          <div class="act-title">Mathematics</div>
          <div class="act-sub">Strong problem-solving skills</div>
        </div>
      </div>

      <div class="activity-item">
        <div class="act-icon">🧬</div>
        <div>
          <div class="act-title">Biology</div>
          <div class="act-sub">Excellent retention rate</div>
        </div>
      </div>

    </div>
  </div>

  <div class="card">
    <div class="section-title">🎯 Areas to Improve</div>

    <div class="activity-list">

      <div class="activity-item">
        <div class="act-icon">📖</div>
        <div>
          <div class="act-title">History</div>
          <div class="act-sub">Needs more active recall practice</div>
        </div>
      </div>

      <div class="activity-item">
        <div class="act-icon">⚛️</div>
        <div>
          <div class="act-title">Physics</div>
          <div class="act-sub">Focus on application questions</div>
        </div>
      </div>

    </div>
  </div>

</div>
`,
  admins: `
    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>

    <!-- Admin Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #eef7ff; color: #1c5db6;">🧑‍🎓</div>
          <span class="stat-badge" style="background: #eef7ff; color: #1c5db6;">+12%</span>
        </div>
        <div class="stat-val">1,280</div>
        <div class="stat-label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #edf7f0; color: #1f7a4c;">🧑‍🏫</div>
          <span class="stat-badge" style="background: #edf7f0; color: #1f7a4c;">+{{ tutors.length - 4 }} New</span>
        </div>
        <div class="stat-val">{{ tutors.length }}</div>
        <div class="stat-label">Active Tutors</div>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #fff4e6; color: #b25f11;">📅</div>
          <span class="stat-badge" style="background: #fff4e6; color: #b25f11;">Active</span>
        </div>
        <div class="stat-val">{{ bookedSessions.length }}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
    </div>

    <!-- Admin Content Tabs & Controls -->
    <div class="admin-controls-card card">
      <div class="admin-controls-header">
        <div class="admin-tabs">
          <button 
            class="admin-tab-btn" 
            :class="{ active: adminActiveTab === 'tutors' }" 
            @click="adminActiveTab = 'tutors'"
          >
            🧑‍🏫 Tutor Directory
          </button>
          <button 
            class="admin-tab-btn" 
            :class="{ active: adminActiveTab === 'bookings' }" 
            @click="adminActiveTab = 'bookings'"
          >
            🗓️ Session Bookings
          </button>
        </div>
        
        <!-- Search Input inside controls card -->
        <div class="admin-search-wrap">
          <span class="admin-search-icon">🔍</span>
          <input 
            type="text" 
            v-model="adminSearchQuery" 
            :placeholder="adminActiveTab === 'tutors' ? 'Search tutors by name or subject...' : 'Search bookings by student or tutor...'" 
          />
        </div>

        <button 
          v-if="adminActiveTab === 'tutors'" 
          class="btn-primary admin-add-btn" 
          @click="openAddTutorModal"
        >
          ➕ Add New Tutor
        </button>
      </div>

      <!-- Tab Content: Tutors Directory -->
      <div v-if="adminActiveTab === 'tutors'" class="admin-tab-content">
        <div v-if="adminFilteredTutors.length === 0" class="admin-empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No tutors match your search</h3>
          <p>Try entering a different name or subject.</p>
        </div>
        <table v-else class="admin-table">
          <thead>
            <tr>
              <th>Tutor Info</th>
              <th>Subjects</th>
              <th>Rate / Hour</th>
              <th>Status</th>
              <th>Rating</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in adminFilteredTutors" :key="t.id">
              <td>
                <div class="admin-tutor-cell">
                  <img :src="rootRel + t.avatar" class="admin-tutor-avatar-img" />
                  <div>
                    <div class="admin-tutor-name-txt">{{ t.name }}</div>
                    <div class="admin-tutor-bio-txt">{{ t.bio }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="admin-subject-badges">
                  <span v-for="s in t.subjects" :key="s" class="subject-tag-xs">{{ s }}</span>
                </div>
              </td>
              <td>
                <span class="admin-rate-txt">RM{{ t.rate }}/hr</span>
              </td>
              <td>
                <span :class="['status-badge', t.status]" style="cursor: pointer;" @click="toggleTutorStatus(t)" title="Click to toggle availability">
                  <span class="status-dot"></span>
                  {{ t.status === 'available' ? 'Available' : 'Busy' }}
                </span>
              </td>
              <td>
                <span class="admin-rating-txt">⭐ {{ t.rating }}</span>
              </td>
              <td style="text-align: right;">
                <div class="admin-action-btns">
                  <button class="btn-edit" @click="openEditTutorModal(t)" title="Edit Tutor">✏️ Edit</button>
                  <button class="btn-delete" @click="deleteTutor(t.id)" title="Delete Tutor">🗑️ Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab Content: Session Bookings -->
      <div v-if="adminActiveTab === 'bookings'" class="admin-tab-content">
        <div v-if="adminFilteredBookings.length === 0" class="admin-empty-state">
          <div class="empty-state-icon">📅</div>
          <h3>No bookings logs found</h3>
          <p>Booked sessions will show up here.</p>
        </div>
        <table v-else class="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Tutor</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in adminFilteredBookings" :key="b.id">
              <td>
                <div class="admin-student-cell">
                  <div class="admin-student-avatar">AC</div>
                  <div>
                    <div class="admin-student-name">Alex Chen</div>
                    <div class="admin-student-role">Student</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="admin-tutor-mini-cell">
                  <img :src="rootRel + b.tutor.avatar" class="admin-tutor-mini-img" />
                  <span class="admin-tutor-mini-name">{{ b.tutor.name }}</span>
                </div>
              </td>
              <td>
                <div class="admin-datetime-cell">
                  <div class="admin-date-txt">📅 {{ b.date }}</div>
                  <div class="admin-time-txt">⏰ {{ b.time }}</div>
                </div>
              </td>
              <td>{{ b.duration }} hr(s)</td>
              <td>
                <span class="admin-cost-txt">RM{{ b.totalCost }}</span>
              </td>
              <td>
                <span class="session-status-badge">Confirmed</span>
              </td>
              <td style="text-align: right;">
                <button class="btn-cancel" @click="deleteBooking(b.id)" title="Cancel Booking">❌ Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Add New Tutor -->
    <div v-if="showAddTutorModal" class="booking-modal-overlay" @click.self="showAddTutorModal = false">
      <div class="booking-modal card">
        <div class="modal-header">
          <h3>Add New Tutor</h3>
          <button class="modal-close-btn" @click="showAddTutorModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Full Name</label>
            <input type="text" v-model="adminTutorForm.name" placeholder="e.g. Dr. Sarah Jenkins" required />
          </div>
          <div class="field">
            <label>Hourly Rate (RM/hr)</label>
            <input type="number" v-model.number="adminTutorForm.rate" placeholder="e.g. 45" required />
          </div>
          <div class="field">
            <label>Subjects (Comma-separated)</label>
            <input type="text" v-model="adminTutorForm.subjects" placeholder="e.g. Mathematics, Physics" required />
          </div>
          <div class="field">
            <label>Availability Status</label>
            <select v-model="adminTutorForm.status" class="modal-select">
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
          <div class="field">
            <label>Short Biography</label>
            <textarea v-model="adminTutorForm.bio" placeholder="Provide background information..." class="modal-textarea" rows="3" style="width:100%; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg); transition:border-color .2s; resize:vertical;"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" style="width: auto; padding: 12px 24px;" @click="showAddTutorModal = false">Cancel</button>
          <button class="btn-primary" style="width: auto; padding: 12px 24px;" @click="saveNewTutor">Add Tutor</button>
        </div>
      </div>
    </div>

    <!-- Modal: Edit Tutor -->
    <div v-if="showEditTutorModal" class="booking-modal-overlay" @click.self="showEditTutorModal = false">
      <div class="booking-modal card">
        <div class="modal-header">
          <h3>Edit Tutor Details</h3>
          <button class="modal-close-btn" @click="showEditTutorModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Full Name</label>
            <input type="text" v-model="adminTutorForm.name" placeholder="e.g. Dr. Sarah Jenkins" required />
          </div>
          <div class="field">
            <label>Hourly Rate (RM/hr)</label>
            <input type="number" v-model.number="adminTutorForm.rate" placeholder="e.g. 45" required />
          </div>
          <div class="field">
            <label>Subjects (Comma-separated)</label>
            <input type="text" v-model="adminTutorForm.subjects" placeholder="e.g. Mathematics, Physics" required />
          </div>
          <div class="field">
            <label>Availability Status</label>
            <select v-model="adminTutorForm.status" class="modal-select">
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
          <div class="field">
            <label>Short Biography</label>
            <textarea v-model="adminTutorForm.bio" placeholder="Provide background information..." class="modal-textarea" rows="3" style="width:100%; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg); transition:border-color .2s; resize:vertical;"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" style="width: auto; padding: 12px 24px;" @click="showEditTutorModal = false">Cancel</button>
          <button class="btn-primary" style="width: auto; padding: 12px 24px;" @click="updateTutor">Save Changes</button>
        </div>
      </div>
    </div>
  `
};

function mountViewApp() {
  const { createApp } = Vue;

  const mainTemplate = pageTemplates[pageId] || pageTemplates.default;

  const app = createApp({
    components: { SidebarComponent },
    data() { return appData; },
    computed: {
      filteredTutors() {
        if (!this.tutors) return [];
        return this.tutors.filter(t => {
          const query = (this.tutorSearchQuery || '').trim().toLowerCase();
          const matchesSearch = !query ||
            t.name.toLowerCase().includes(query) ||
            t.subjects.some(s => s.toLowerCase().includes(query));
          const matchesSubject = this.tutorSelectedSubject === 'All' || t.subjects.includes(this.tutorSelectedSubject);
          const matchesStatus = this.tutorSelectedStatus === 'All' || t.status === this.tutorSelectedStatus;
          return matchesSearch && matchesSubject && matchesStatus;
        });
      },
      adminFilteredTutors() {
        if (!this.tutors) return [];
        return this.tutors.filter(t => {
          const query = (this.adminSearchQuery || '').trim().toLowerCase();
          return !query ||
            t.name.toLowerCase().includes(query) ||
            t.subjects.some(s => s.toLowerCase().includes(query)) ||
            t.bio.toLowerCase().includes(query);
        });
      },
      adminFilteredBookings() {
        if (!this.bookedSessions) return [];
        return this.bookedSessions.filter(b => {
          const query = (this.adminSearchQuery || '').trim().toLowerCase();
          return !query ||
            b.tutor.name.toLowerCase().includes(query) ||
            b.tutor.subjects.some(s => s.toLowerCase().includes(query)) ||
            b.date.includes(query);
        });
      }
    },
    methods: {
      logout() { window.location.href = rootRel + 'index.html'; },
      startQuiz(id) { window.location.href = rootRel + 'views/quizzes/quiz.html#' + id; },
      openBookingModal(tutor) {
        this.bookingTutor = tutor;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.bookingDate = tomorrow.toISOString().split('T')[0];
        this.bookingTime = '14:00';
        this.bookingDuration = 1;
      },
      confirmBooking() {
        if (!this.bookingDate || !this.bookingTime) {
          alert('Please select a date and time.');
          return;
        }

        const newSession = {
          id: 'session-' + Date.now(),
          tutor: this.bookingTutor,
          date: this.bookingDate,
          time: this.bookingTime,
          duration: this.bookingDuration,
          totalCost: this.bookingTutor.rate * this.bookingDuration
        };
        this.bookedSessions.push(newSession);

        const index = this.tutors.findIndex(t => t.id === this.bookingTutor.id);
        if (index !== -1) {
          this.tutors[index].status = 'busy';
        }

        this.bookingTutor = null;
      },
      openAddTutorModal() {
        this.adminTutorForm = { name: '', rate: 30, subjects: '', status: 'available', bio: '' };
        this.showAddTutorModal = true;
      },
      saveNewTutor() {
        const form = this.adminTutorForm;
        if (!form.name || !form.subjects) {
          alert('Please fill out Name and Subjects.');
          return;
        }
        const subArray = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
        const avatars = [
          'assets/tutor-sarah.png',
          'assets/tutor-james.png',
          'assets/tutor-emily.png',
          'assets/tutor-david.png'
        ];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        const newTutor = {
          id: 'tutor-' + Date.now(),
          name: form.name,
          avatar: randomAvatar,
          status: form.status,
          subjects: subArray.length ? subArray : ['General'],
          rating: 5.0,
          reviewsCount: 0,
          rate: Number(form.rate) || 30,
          bio: form.bio || 'Experienced academic tutor.'
        };
        this.tutors.push(newTutor);
        this.showAddTutorModal = false;
      },
      openEditTutorModal(tutor) {
        this.editingTutorId = tutor.id;
        this.adminTutorForm = {
          name: tutor.name,
          rate: tutor.rate,
          subjects: tutor.subjects.join(', '),
          status: tutor.status,
          bio: tutor.bio
        };
        this.showEditTutorModal = true;
      },
      updateTutor() {
        const form = this.adminTutorForm;
        const index = this.tutors.findIndex(t => t.id === this.editingTutorId);
        if (index !== -1) {
          if (!form.name || !form.subjects) {
            alert('Please fill out Name and Subjects.');
            return;
          }
          const subArray = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
          this.tutors[index].name = form.name;
          this.tutors[index].rate = Number(form.rate) || 30;
          this.tutors[index].subjects = subArray.length ? subArray : ['General'];
          this.tutors[index].status = form.status;
          this.tutors[index].bio = form.bio || 'Experienced academic tutor.';
          this.showEditTutorModal = false;
          this.editingTutorId = null;
        }
      },
      deleteTutor(id) {
        if (confirm('Are you sure you want to delete this tutor?')) {
          this.tutors = this.tutors.filter(t => t.id !== id);
        }
      },
      toggleTutorStatus(tutor) {
        tutor.status = tutor.status === 'available' ? 'busy' : 'available';
      },
      deleteBooking(id) {
        if (confirm('Are you sure you want to cancel this booking?')) {
          const session = this.bookedSessions.find(b => b.id === id);
          if (session) {
            const tutorIndex = this.tutors.findIndex(t => t.id === session.tutor.id);
            if (tutorIndex !== -1) {
              this.tutors[tutorIndex].status = 'available';
            }
          }
          this.bookedSessions = this.bookedSessions.filter(b => b.id !== id);
        }
      }
    },
    template: `
      <div class="app-shell">
        <sidebar-component
          :nav-items="navItems"
          :active-nav="activeNav"
          :user-name="userName"
          :initials="initials"
          @logout="logout"
        />
        <main class="main">
          ${mainTemplate}
        </main>
      </div>
    `,
  });

  app.mount('#view-app');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountViewApp);
} else {
  mountViewApp();
}
