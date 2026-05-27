const pageId = document.body.dataset.pageId || 'dashboard';
const pageTitle = document.body.dataset.pageTitle || 'Dashboard';
const pageSubtitle = document.body.dataset.pageSubtitle || '';

const atViews = /\/views\//.test(window.location.pathname);
const rootRel = atViews ? '../../' : '';

const navItems = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', route: rootRel + 'dashboard.html' },
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
  bookedSessions: []
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
