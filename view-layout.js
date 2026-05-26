const pageId    = document.body.dataset.pageId       || 'dashboard';
const pageTitle = document.body.dataset.pageTitle    || 'Dashboard';
const pageSubtitle = document.body.dataset.pageSubtitle || '';

const atViews = /\/views\//.test(window.location.pathname);
const rootRel = atViews ? '../../' : '';

const navItems = [
  { id: 'dashboard',  icon: '🏠',  label: 'Dashboard',    route: rootRel + 'dashboard.html' },
  { id: 'ai',         icon: '🤖',  label: 'AI Assistant', route: rootRel + 'views/ai/ai_index.html' },
  { id: 'content',    icon: '📚',  label: 'Content Hub',  route: rootRel + 'views/content/content_index.html' },
  { id: 'flashcards', icon: '🧠',  label: 'Flashcards',   route: rootRel + 'views/flashcards/flashcards_index.html' },
  { id: 'quizzes',    icon: '✏️',  label: 'Quizzes',      route: rootRel + 'views/quizzes/quizzes_index.html' },
  { id: 'planner',    icon: '🗓️',  label: 'Planner',      route: rootRel + 'views/planner/planner_index.html' },
  { id: 'analytics',  icon: '📊',  label: 'Analytics',    route: rootRel + 'views/analytics/analytics_index.html' },
  { id: 'tutors',     icon: '🧑‍🏫', label: 'Tutors',       route: rootRel + 'views/tutors/tutors_index.html' },
];

const appData = {
  pageTitle, pageSubtitle,
  activeNav: pageId,
  navItems,
  userName: 'Alex Chen',
  initials: 'AC',
  stats: [
    { icon: '📈', value: '82%',    label: 'Focus Score',       change: '+8%', bg: '#d9f7e4', color: '#1f7a4c' },
    { icon: '🧠', value: '14',     label: 'Completed Lessons', change: '+2',  bg: '#eef7ff', color: '#1c5db6' },
    { icon: '⏱️', value: '6h 24m', label: 'Study Time',        change: '+1h', bg: '#fff4e6', color: '#b25f11' },
  ],
  quickActions: [
    { icon: '📝', name: 'Write Notes',  desc: 'Capture quick ideas from class.' },
    { icon: '⚡', name: 'Skill Drills', desc: 'Practice short review sessions.' },
    { icon: '📅', name: 'Plan Study',   desc: 'Schedule tasks for the week.' },
  ],
  quizzes: [
    { id: 'bio-5',     title: 'Biology — Chapter 5', desc: 'Cell structure and function', questions: 10, time: '10m', difficulty: 'Medium' },
    { id: 'chem-1',    title: 'Chemistry — Basics',  desc: 'Atoms, molecules, bonds',     questions: 12, time: '12m', difficulty: 'Easy'   },
    { id: 'math-quiz', title: 'Algebra Practice',    desc: 'Linear equations',            questions:  8, time:  '8m', difficulty: 'Hard'   },
  ],
  activity: [
    { icon: '✅', title: 'Finished Chapter 3 Quiz', sub: '10 min ago', time: '10m', bg: '#edf7f0' },
    { icon: '🔔', title: 'New tutor message',       sub: '30 min ago', time: '30m', bg: '#f3f5ff' },
    { icon: '📌', title: 'Study plan updated',      sub: '1 hour ago', time: '1h',  bg: '#fff3f0' },
  ],
  upcoming: [
    { name: 'Biology Quiz',      date: 'Today · 5:00 PM',     tag: 'Due',  dotColor: '#d92d20', badgeBg: '#ffe5e1' },
    { name: 'Essay Draft',       date: 'Tomorrow · 11:00 AM', tag: 'Soon', dotColor: '#f59e0b', badgeBg: '#fff4db' },
    { name: 'Flashcards Review', date: 'Friday · 9:00 AM',    tag: 'Plan', dotColor: '#1d4ed8', badgeBg: '#e0e7ff' },
  ],
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
};

function mountViewApp() {
  const { createApp } = Vue;

  const mainTemplate = pageTemplates[pageId] || pageTemplates.default;

  const app = createApp({
    components: { SidebarComponent },
    data() { return appData; },
    methods: {
      logout()         { window.location.href = rootRel + 'index.html'; },
      startQuiz(id)    { window.location.href = rootRel + 'views/quizzes/quiz.html#' + id; },
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
