const pageId = document.body.dataset.pageId || 'dashboard';
const pageTitle = document.body.dataset.pageTitle || 'Dashboard';
const pageSubtitle = document.body.dataset.pageSubtitle || '';

const atViews = /\/views\//.test(window.location.pathname);
const rootRel = atViews ? '../../' : '';

const navItems = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', route: rootRel + 'views/dashboard/dashboard.html', role: 'Student' },
  { id: 'admins', icon: '📊', label: 'Admin Dashboard', route: rootRel + 'views/admins/admins_index.html', role: 'Admin' },
  { id: 'users', icon: '👥', label: 'User Management', route: rootRel + 'views/admins/user_management_index.html', role: 'Admin' },
  { id: 'moderation', icon: '🛡️', label: 'Content Moderation', route: rootRel + 'views/admins/moderation_index.html', role: 'Admin' },
  { id: 'bookings', icon: '💼', label: 'Bookings & Payments', route: rootRel + 'views/admins/bookings_index.html', role: 'Admin' },
  { id: 'announcements', icon: '📢', label: 'Announcements', route: rootRel + 'views/admins/announcements_index.html', role: 'Admin' },
  { id: 'settings', icon: '⚙️', label: 'System Settings', route: rootRel + 'views/admins/settings_index.html', role: 'Admin' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant', route: rootRel + 'views/ai/ai_index.html', role: 'Student' },
  { id: 'content', icon: '📚', label: 'Content Hub', route: rootRel + 'views/content/content_index.html', role: 'Student' },
  { id: 'flashcards', icon: '🧠', label: 'Flashcards', route: rootRel + 'views/flashcards/flashcards_index.html', role: 'Student' },
  { id: 'quizzes', icon: '✏️', label: 'Quizzes', route: rootRel + 'views/quizzes/quizzes_index.html', role: 'Student' },
  { id: 'planner', icon: '🗓️', label: 'Planner', route: rootRel + 'views/planner/planner_index.html', role: 'Student' },
  { id: 'analytics', icon: '📊', label: 'Analytics', route: rootRel + 'views/analytics/analytics_index.html', role: 'Student' },
  { id: 'tutors', icon: '🧑‍🏫', label: 'Tutors', route: rootRel + 'views/tutors/tutors_index.html', role: 'Student' },
  { id: 'tracker', icon: '⏰', label: 'Exam Tracker', route: rootRel + 'views/tracker/tracker_index.html', role: 'Student' },
];

const defaultProfile = {
  name: 'Alex Chen',
  email: 'alex@school.edu',
  role: 'Student',
  initials: 'AC',
  bio: 'A passionate student eager to learn and improve skills.',
  avatarBg: 'linear-gradient(135deg, var(--indigo), var(--mint))'
};

function getStoredProfile() {
  const stored = localStorage.getItem('preppal_profile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  }
  return defaultProfile;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const activeProfile = getStoredProfile();

const appData = {
  pageTitle, pageSubtitle,
  activeNav: pageId,
  navItems,
  rootRel,
  userName: activeProfile.name,
  userEmail: activeProfile.email,
  userRole: activeProfile.role || 'Student',
  initials: activeProfile.initials || 'AC',
  userBio: activeProfile.bio || '',
  userAvatarBg: activeProfile.avatarBg || 'linear-gradient(135deg, var(--indigo), var(--mint))',

  // Temp form fields
  tempName: activeProfile.name,
  tempEmail: activeProfile.email,
  tempRole: activeProfile.role || 'Student',
  tempPassword: '',
  tempBio: activeProfile.bio || '',
  tempAvatarBg: activeProfile.avatarBg || 'linear-gradient(135deg, var(--indigo), var(--mint))',
  profileSuccessMsg: '',
  profileErrorMsg: '',
  avatarPresets: [
    { name: 'Indigo Mint', gradient: 'linear-gradient(135deg, var(--indigo), var(--mint))' },
    { name: 'Sunset Gold', gradient: 'linear-gradient(135deg, var(--rose), var(--amber))' },
    { name: 'Ocean Breeze', gradient: 'linear-gradient(135deg, var(--indigo-dk), var(--sky))' },
    { name: 'Royal Lavender', gradient: 'linear-gradient(135deg, #8A2BE2, #FF69B4)' },
    { name: 'Emerald Forest', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
    { name: 'Deep Space', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  ],
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

  contentItems: [
    { id: 'c1', title: 'Machine Learning XAI', desc: '4 files • Updated 2 days ago', type: 'folder', icon: '📁', shared: true },
    { id: 'c2', title: 'Theory of Computer Science', desc: 'PDF • 2.4 MB', type: 'file', icon: '📄', shared: false },
    { id: 'c3', title: 'LIME Paper Summary', desc: 'AI Generated • Read time: 5m', type: 'summary', icon: '🤖', shared: true }
  ],
  trackerTasks: [
    { id: 't1', title: 'Biology Quiz', date: 'May 3, 2026', time: '02:00 PM', colorClass: 'border-orange', badgeText: 'Tomorrow', badgeClass: 'badge-red' },
    { id: 't2', title: 'History Essay Due', date: 'May 5, 2026', time: '11:59 PM', colorClass: 'border-blue', badgeText: '3 days left', badgeClass: 'badge-orange' },
    { id: 't3', title: 'Math Final', date: 'May 8, 2026', time: '09:00 AM', colorClass: 'border-yellow', badgeText: '6 days left', badgeClass: 'badge-purple' }
  ],

  trackerCurrentView: 'List View',
  trackerCurrentView: 'List View',
  newTaskForm: {
    title: '',
    type: 'Exam',
    date: '',
    time: '',
    priority: 'priority-med'
  },
  showAddTaskModal: false,
  plannerTasks: [],
  analyticsRecords: [],

  plannerLoading: false,
  analyticsLoading: false,

  plannerError: '',
  analyticsError: '',
  plannerSearch: '',
  analyticsSearch: '',

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
  adminStudentCount: 0,
  adminTutorCount: 0,
  adminBookingCount: 0,
  adminActiveTab: 'tutors',
  adminSearchQuery: '',
  showAddTutorModal: false,
  showEditTutorModal: false,
  adminTutorForm: {
    name: '',
    email: '',
    rate: 30,
    subjects: '',
    status: 'available',
    bio: ''
  },
  editingTutorId: null,

  currentUser: 'Alex Chen',

  quizList: [
    {
      id: 1, title: 'Biology — Cell Structure', subject: 'Biology', topic: 'Cells', difficulty: 'Medium', visibility: 'public', owner: 'Alex Chen',
      questions: [
        { text: 'What is the powerhouse of the cell?', choices: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi body'], correct: 1 },
        { text: 'Which organelle contains DNA?', choices: ['Mitochondria', 'Lysosome', 'Nucleus', 'Vacuole'], correct: 2 },
        { text: 'What surrounds plant cells but not animal cells?', choices: ['Cell membrane', 'Cell wall', 'Nucleus', 'Cytoplasm'], correct: 1 },
      ]
    },
    {
      id: 2, title: 'Algebra Basics', subject: 'Mathematics', topic: 'Algebra', difficulty: 'Easy', visibility: 'public', owner: 'Sam Lee',
      questions: [
        { text: 'Solve: 2x = 10', choices: ['x=2', 'x=5', 'x=8', 'x=20'], correct: 1 },
        { text: 'Slope of y = 3x + 2?', choices: ['2', '3', '1', '0'], correct: 1 },
      ]
    },
    {
      id: 3, title: 'My Private History Quiz', subject: 'History', topic: 'WW2', difficulty: 'Hard', visibility: 'private', owner: 'Alex Chen',
      questions: [{ text: 'When did WW2 end?', choices: ['1943', '1944', '1945', '1946'], correct: 2 }]
    },
  ],
  quizTab: 'browse', quizSearch: '', quizFilterSubject: '', quizFilterTopic: '',
  showQuizModal: false, editingQuiz: null,
  quizForm: { title: '', subject: '', topic: '', difficulty: 'Medium', visibility: 'public', questions: [] },
  takingQuiz: null, currentQ: 0, quizAnswers: {}, quizResults: false,

  deckList: [
    {
      id: 1, title: 'Biology Vocabulary', subject: 'Biology', topic: 'Cells', visibility: 'public', owner: 'Alex Chen',
      cards: [
        { q: 'What is mitosis?', a: 'Cell division producing two identical daughter cells' },
        { q: 'Define osmosis', a: 'Movement of water through a semipermeable membrane' },
        { q: 'What is ATP?', a: 'Adenosine triphosphate — the energy currency of cells' },
        { q: 'Define photosynthesis', a: 'Process converting sunlight to glucose in plants' },
      ]
    },
    {
      id: 2, title: 'Spanish Vocabulary', subject: 'Languages', topic: 'Spanish', visibility: 'public', owner: 'Sam Lee',
      cards: [{ q: 'Hello', a: 'Hola' }, { q: 'Goodbye', a: 'Adiós' }, { q: 'Thank you', a: 'Gracias' }]
    },
    {
      id: 3, title: 'My Private Math Cards', subject: 'Mathematics', topic: 'Calculus', visibility: 'private', owner: 'Alex Chen',
      cards: [{ q: 'Derivative of x²?', a: '2x' }, { q: 'Integral of 2x?', a: 'x² + C' }]
    },
  ],
  deckTab: 'browse', deckSearch: '', deckFilterSubject: '', deckFilterTopic: '',
  showDeckModal: false, editingDeck: null,
  deckForm: { title: '', subject: '', topic: '', visibility: 'public', cards: [] },
  playingDeck: null, currentCard: 0, cardFlipped: false, cardResults: {}, deckResults: false,
};

//  Sidebar component (fully self-contained template string) 
const SidebarComponent = {
  props: ['navItems', 'activeNav', 'userName', 'initials', 'userAvatarBg', 'userRole'],
  emits: ['update:activeNav', 'logout', 'goToProfile'],
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
        <div class="avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
        <div style="flex: 1; min-width: 0;">
          <div class="user-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ userName }}</div>
          <div class="user-role">{{ userRole || 'Student' }}</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; margin-left: auto;">
          <button class="profile-btn" @click="$emit('goToProfile')" title="Edit Profile">⚙</button>
          <button class="logout-btn" @click="$emit('logout')" title="Sign out">⏻</button>
        </div>
      </div>
    </aside>
  `,
};

//  Per-page main content templates 
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
      <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
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
    <div class="page-header">
      <div class="greeting" style="margin-bottom:0"><h1>{{pageTitle}}</h1><p>{{pageSubtitle}}</p></div>
      <button class="btn-primary" style="width:auto;padding:10px 22px;white-space:nowrap" @click="openCreateQuiz">+ Create Quiz</button>
    </div>
    <div class="tabs">
      <div class="tab" :class="{active:quizTab==='browse'}" @click="quizTab='browse';takingQuiz=null;quizResults=false">Browse</div>
      <div class="tab" :class="{active:quizTab==='my'}" @click="quizTab='my';takingQuiz=null;quizResults=false">My Quizzes</div>
      <div class="tab" :class="{active:quizTab==='take'}" v-if="takingQuiz">Taking Quiz</div>
    </div>

    <template v-if="quizTab!=='take'">
      <div class="filter-bar">
        <input v-model="quizSearch" placeholder="Search by title, subject or topic…"/>
        <select v-model="quizFilterSubject"><option value="">All subjects</option><option v-for="s in quizSubjects" :key="s">{{s}}</option></select>
        <select v-model="quizFilterTopic"><option value="">All topics</option><option v-for="t in quizTopics" :key="t">{{t}}</option></select>
      </div>
      <div class="quiz-grid">
        <div class="quiz-card" v-for="q in (quizTab==='my' ? myFilteredQuizzes : allFilteredQuizzes)" :key="q.id">
          <div class="quiz-card-header">
            <div>
              <div class="quiz-title">{{q.title}}</div>
              <div class="quiz-meta">{{q.subject}} · {{q.topic}} · {{q.questions.length}} questions</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
              <span class="badge" :class="q.visibility==='public'?'badge-public':'badge-private'">{{q.visibility}}</span>
              <span class="badge" :class="'badge-'+q.difficulty.toLowerCase()">{{q.difficulty}}</span>
            </div>
          </div>
          <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px">By {{q.owner}}</div>
          <div class="quiz-card-footer">
            <button class="btn-sm primary" @click="startQuizGame(q)">Start Quiz</button>
            <div class="owner-actions" v-if="q.owner===currentUser">
              <button class="btn-sm" @click="openEditQuiz(q)">Edit</button>
              <button class="btn-sm" style="color:var(--rose)" @click="deleteQuiz(q.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-if="(quizTab==='my'?myFilteredQuizzes:allFilteredQuizzes).length===0">
        <div style="font-size:3rem;margin-bottom:12px">✏️</div>
        <div>No quizzes found. Adjust your filters or create a new quiz.</div>
      </div>
    </template>

    <template v-if="quizTab==='take' && takingQuiz && !quizResults">
      <div class="quiz-take-wrap">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:'Sora',sans-serif;font-size:1rem;font-weight:700">{{takingQuiz.title}}</span>
          <button class="btn-sm" @click="quizTab='browse';takingQuiz=null">✕ Exit</button>
        </div>
        <div class="progress-bar-outer"><div class="progress-bar-inner" :style="{width:((currentQ+1)/takingQuiz.questions.length*100)+'%'}"></div></div>
        <div class="question-num">Question {{currentQ+1}} of {{takingQuiz.questions.length}}</div>
        <div class="question-text">{{takingQuiz.questions[currentQ].text}}</div>
        <div class="choices-list">
          <div class="choice-opt" v-for="(c,ci) in takingQuiz.questions[currentQ].choices" :key="ci"
            :class="{selected:quizAnswers[currentQ]===ci}"
            @click="quizAnswers[currentQ]=ci">{{c}}</div>
        </div>
        <div class="quiz-nav">
          <button class="btn-sm" @click="currentQ--" :disabled="currentQ===0">← Previous</button>
          <button class="btn-sm primary" v-if="currentQ<takingQuiz.questions.length-1" @click="currentQ++" :disabled="quizAnswers[currentQ]===undefined">Next →</button>
          <button class="btn-sm primary" v-else @click="submitQuiz" :disabled="quizAnswers[currentQ]===undefined">Submit Quiz</button>
        </div>
      </div>
    </template>

    <template v-if="quizResults && takingQuiz">
      <div class="quiz-take-wrap">
        <div class="score-circle">
          <div class="score-num">{{quizScore}}/{{takingQuiz.questions.length}}</div>
          <div class="score-label">Score</div>
        </div>
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:700;margin-bottom:6px">
            {{Math.round(quizScore/takingQuiz.questions.length*100)}}% — {{quizScore===takingQuiz.questions.length?'Perfect!':quizScore>=takingQuiz.questions.length*.7?'Great job!':'Keep practicing!'}}
          </div>
          <div style="color:var(--muted);font-size:.9rem">{{quizScore}} correct out of {{takingQuiz.questions.length}} questions</div>
        </div>
        <template v-if="quizWrongQuestions.length>0">
          <div class="section-title">Review Wrong Answers</div>
          <div class="review-item" v-for="q in quizWrongQuestions" :key="q.index">
            <div class="review-q">{{q.text}}</div>
            <div class="review-ans" style="color:var(--rose)">Your answer: {{q.choices[quizAnswers[q.index]]||'No answer'}}</div>
            <div class="review-ans" style="color:#1D9E75;margin-top:2px">Correct: {{q.choices[q.correct]}}</div>
          </div>
        </template>
        <div v-else class="card" style="text-align:center;color:#1D9E75;font-weight:600;padding:20px">🎉 All answers correct!</div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:center">
          <button class="btn-sm" @click="startQuizGame(takingQuiz)">Retake</button>
          <button class="btn-sm primary" @click="quizTab='browse';takingQuiz=null;quizResults=false">Back to Browse</button>
        </div>
      </div>
    </template>

    <div class="modal-overlay" v-if="showQuizModal" @click.self="showQuizModal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{editingQuiz?'Edit Quiz':'Create New Quiz'}}</h3>
          <button class="btn-sm" @click="showQuizModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-field"><label>Title</label><input v-model="quizForm.title" placeholder="Quiz title"/></div>
            <div class="form-field"><label>Subject</label><input v-model="quizForm.subject" placeholder="e.g. Biology"/></div>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Topic</label><input v-model="quizForm.topic" placeholder="e.g. Cell Structure"/></div>
            <div class="form-field"><label>Difficulty</label>
              <select v-model="quizForm.difficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>
            </div>
          </div>
          <div class="form-field"><label>Visibility</label>
            <select v-model="quizForm.visibility">
              <option value="public">Public — everyone can see and take it</option>
              <option value="private">Private — only you can see it</option>
            </select>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div class="section-title" style="margin-bottom:0">Questions</div>
            <button class="btn-sm" @click="addQuizQuestion">+ Add Question</button>
          </div>
          <div class="question-block" v-for="(q,qi) in quizForm.questions" :key="qi">
            <div class="question-block-header">
              <span class="question-block-title">Question {{qi+1}}</span>
              <button class="btn-sm" style="color:var(--rose)" @click="quizForm.questions.splice(qi,1)" v-if="quizForm.questions.length>1">Remove</button>
            </div>
            <div class="form-field"><input v-model="q.text" :placeholder="'Enter question '+(qi+1)"/></div>
            <div style="font-size:.8rem;font-weight:600;color:var(--muted);margin-bottom:8px">Choices <span style="font-weight:400">(select the correct answer)</span></div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div class="choice-row" v-for="(c,ci) in q.choices" :key="ci">
                <input type="radio" class="correct-radio" :name="'q'+qi" :value="ci" v-model="q.correct"/>
                <input type="text" v-model="q.choices[ci]" :placeholder="'Choice '+(ci+1)" style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:DM Sans,sans-serif;font-size:.88rem;background:var(--surface);color:var(--text);outline:none"/>
                <button class="btn-sm" style="padding:6px 10px" @click="q.choices.splice(ci,1)" v-if="q.choices.length>2">✕</button>
              </div>
            </div>
            <button class="btn-sm" style="margin-top:8px" @click="q.choices.push('')" v-if="q.choices.length<6">+ Add choice</button>
          </div>
          <div class="modal-footer">
            <button class="btn-sm" @click="showQuizModal=false">Cancel</button>
            <button class="btn-sm primary" @click="saveQuiz">{{editingQuiz?'Save Changes':'Create Quiz'}}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  flashcards: `
    <div class="page-header">
      <div class="greeting" style="margin-bottom:0"><h1>{{pageTitle}}</h1><p>{{pageSubtitle}}</p></div>
      <button class="btn-primary" style="width:auto;padding:10px 22px;white-space:nowrap" @click="openCreateDeck">+ Create Deck</button>
    </div>
    <div class="tabs">
      <div class="tab" :class="{active:deckTab==='browse'}" @click="deckTab='browse';playingDeck=null;deckResults=false">Browse</div>
      <div class="tab" :class="{active:deckTab==='my'}" @click="deckTab='my';playingDeck=null;deckResults=false">My Decks</div>
      <div class="tab" :class="{active:deckTab==='play'}" v-if="playingDeck">Studying</div>
    </div>

    <template v-if="deckTab!=='play'">
      <div class="filter-bar">
        <input v-model="deckSearch" placeholder="Search by title, subject or topic…"/>
        <select v-model="deckFilterSubject"><option value="">All subjects</option><option v-for="s in deckSubjects" :key="s">{{s}}</option></select>
        <select v-model="deckFilterTopic"><option value="">All topics</option><option v-for="t in deckTopics" :key="t">{{t}}</option></select>
      </div>
      <div class="quiz-grid">
        <div class="quiz-card" v-for="d in (deckTab==='my'?myFilteredDecks:allFilteredDecks)" :key="d.id">
          <div class="quiz-card-header">
            <div>
              <div class="quiz-title">{{d.title}}</div>
              <div class="quiz-meta">{{d.subject}} · {{d.topic}} · {{d.cards.length}} cards</div>
            </div>
            <span class="badge" :class="d.visibility==='public'?'badge-public':'badge-private'">{{d.visibility}}</span>
          </div>
          <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px">By {{d.owner}}</div>
          <div class="quiz-card-footer">
            <button class="btn-sm primary" @click="startDeck(d)">Study Deck</button>
            <div class="owner-actions" v-if="d.owner===currentUser">
              <button class="btn-sm" @click="openEditDeck(d)">Edit</button>
              <button class="btn-sm" style="color:var(--rose)" @click="deleteDeck(d.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-if="(deckTab==='my'?myFilteredDecks:allFilteredDecks).length===0">
        <div style="font-size:3rem;margin-bottom:12px">🧠</div>
        <div>No decks found. Create one to get started!</div>
      </div>
    </template>

    <template v-if="deckTab==='play' && playingDeck && !deckResults">
      <div class="quiz-take-wrap">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:'Sora',sans-serif;font-size:1rem;font-weight:700">{{playingDeck.title}}</span>
          <button class="btn-sm" @click="deckTab='browse';playingDeck=null">✕ Exit</button>
        </div>
        <div class="progress-bar-outer"><div class="progress-bar-inner" :style="{width:((currentCard+1)/playingDeck.cards.length*100)+'%'}"></div></div>
        <div class="question-num">Card {{currentCard+1}} of {{playingDeck.cards.length}}</div>
        <div @click="cardFlipped=!cardFlipped" style="cursor:pointer;perspective:1000px;margin-bottom:20px">
          <div :style="{transform:cardFlipped?'rotateY(180deg)':'rotateY(0deg)',transition:'transform .5s',transformStyle:'preserve-3d',position:'relative',minHeight:'200px'}">
            <div class="card" style="position:absolute;width:100%;min-height:200px;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px">
              <div style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Question</div>
              <div style="font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text)">{{playingDeck.cards[currentCard].q}}</div>
              <div style="margin-top:16px;font-size:.8rem;color:var(--muted)">Click to flip</div>
            </div>
            <div class="card" style="position:absolute;width:100%;min-height:200px;backface-visibility:hidden;transform:rotateY(180deg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:var(--indigo-lt);border-color:var(--indigo)">
              <div style="font-size:.72rem;font-weight:700;color:var(--indigo);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Answer</div>
              <div style="font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text)">{{playingDeck.cards[currentCard].a}}</div>
            </div>
          </div>
        </div>
        <div v-if="cardFlipped" style="display:flex;gap:12px;justify-content:center">
          <button class="btn-sm" style="flex:1;max-width:180px;padding:12px;color:var(--rose);border-color:var(--rose)" @click="markCard('wrong')">✕ Got it wrong</button>
          <button class="btn-sm primary" style="flex:1;max-width:180px;padding:12px" @click="markCard('correct')">✓ Got it right</button>
        </div>
        <div v-else style="text-align:center;color:var(--muted);font-size:.85rem;margin-top:8px">Flip the card then mark whether you got it right or wrong</div>
      </div>
    </template>

    <template v-if="deckResults && playingDeck">
      <div class="quiz-take-wrap">
        <div class="score-circle">
          <div class="score-num">{{deckCorrectCount}}/{{playingDeck.cards.length}}</div>
          <div class="score-label">Correct</div>
        </div>
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:700;margin-bottom:6px">
            {{Math.round(deckCorrectCount/playingDeck.cards.length*100)}}% — {{deckCorrectCount===playingDeck.cards.length?'Perfect!':deckCorrectCount>=playingDeck.cards.length*.7?'Great job!':'Keep reviewing!'}}
          </div>
          <div style="color:var(--muted);font-size:.9rem">{{deckCorrectCount}} correct · {{deckWrongCards.length}} to review</div>
        </div>
        <template v-if="deckWrongCards.length>0">
          <div class="section-title">Cards to Review</div>
          <div class="review-item" v-for="c in deckWrongCards" :key="c.index">
            <div class="review-q">{{c.q}}</div>
            <div class="review-ans" style="color:#1D9E75;margin-top:4px">{{c.a}}</div>
          </div>
        </template>
        <div v-else class="card" style="text-align:center;color:#1D9E75;font-weight:600;padding:20px">🎉 You knew all the cards!</div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:center">
          <button class="btn-sm" @click="startDeck(playingDeck)">Study Again</button>
          <button class="btn-sm primary" @click="deckTab='browse';playingDeck=null;deckResults=false">Back to Browse</button>
        </div>
      </div>
    </template>

    <div class="modal-overlay" v-if="showDeckModal" @click.self="showDeckModal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{editingDeck?'Edit Deck':'Create New Deck'}}</h3>
          <button class="btn-sm" @click="showDeckModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-field"><label>Deck Title</label><input v-model="deckForm.title" placeholder="e.g. Biology Vocabulary"/></div>
            <div class="form-field"><label>Subject</label><input v-model="deckForm.subject" placeholder="e.g. Biology"/></div>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Topic</label><input v-model="deckForm.topic" placeholder="e.g. Cell Biology"/></div>
            <div class="form-field"><label>Visibility</label>
              <select v-model="deckForm.visibility"><option value="public">Public</option><option value="private">Private</option></select>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div class="section-title" style="margin-bottom:0">Cards</div>
            <button class="btn-sm" @click="deckForm.cards.push({q:'',a:''})">+ Add Card</button>
          </div>
          <div class="question-block" v-for="(c,ci) in deckForm.cards" :key="ci">
            <div class="question-block-header">
              <span class="question-block-title">Card {{ci+1}}</span>
              <button class="btn-sm" style="color:var(--rose)" @click="deckForm.cards.splice(ci,1)" v-if="deckForm.cards.length>1">Remove</button>
            </div>
            <div class="form-field"><label>Question / Front</label><input v-model="c.q" placeholder="Enter question or term"/></div>
            <div class="form-field"><label>Answer / Back</label><textarea v-model="c.a" placeholder="Enter answer or definition" rows="2" style="resize:vertical"></textarea></div>
          </div>
          <div class="modal-footer">
            <button class="btn-sm" @click="showDeckModal=false">Cancel</button>
            <button class="btn-sm primary" @click="saveDeck">{{editingDeck?'Save Changes':'Create Deck'}}</button>
          </div>
        </div>
      </div>
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
            <div class="modal-tutor-rate">RM{{ bookingTutor.rate }}/hr · Study Session</div>
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
              <span>RM{{ bookingTutor.rate }} / hr</span>
            </div>
            <div class="cost-row">
              <span>Duration</span>
              <span>{{ bookingDuration }} hr(s)</span>
            </div>
            <hr class="cost-divider" />
            <div class="cost-row total-row">
              <span>Total Cost</span>
              <span class="total-price">RM{{ bookingTutor.rate * bookingDuration }}</span>
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
      <span class="search-icon">⌕</span>
      <input
        type="text"
        v-model="plannerSearch"
        placeholder="Search study plans, deadlines, or status..."
      />
    </div>
    <div class="notif-btn">●<span class="notif-dot"></span></div>
    <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
  </div>

  <div class="greeting">
    <h1>{{ pageTitle }}</h1>
    <p>{{ pageSubtitle }}</p>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:#eef7ff;color:#1c5db6;">01</div>
        <span class="stat-badge" style="background:#eef7ff;color:#1c5db6;">Fetched</span>
      </div>
      <div class="stat-val">{{ plannerTasks.length }}</div>
      <div class="stat-label">Loaded Study Plans</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:#fff4e6;color:#b25f11;">02</div>
        <span class="stat-badge" style="background:#fff4e6;color:#b25f11;">Weekly</span>
      </div>
      <div class="stat-val">12 hrs</div>
      <div class="stat-label">Available Study Hours</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:#edf7f0;color:#1f7a4c;">03</div>
        <span class="stat-badge" style="background:#edf7f0;color:#1f7a4c;">Ready</span>
      </div>
      <div class="stat-val">4</div>
      <div class="stat-label">Uploaded Materials</div>
    </div>
  </div>

  <div class="bottom-grid">
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;">
        <div>
          <div class="section-title" style="margin-bottom:4px;">Study Plan Tasks</div>
          <p style="color:var(--muted);font-size:.9rem;margin:0;">
            Data is loaded asynchronously from data/planner.json using the Fetch API.
          </p>
        </div>
        <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="fetchPlannerData">
          Refresh
        </button>
      </div>

      <div v-if="plannerLoading" class="card" style="box-shadow:none;background:#f8fafc;">
        Loading study planner data...
      </div>

      <div v-if="plannerError" class="error-msg">
        {{ plannerError }}
      </div>

      <div class="activity-list" v-if="!plannerLoading && filteredPlannerTasks.length">
        <div class="activity-item" v-for="task in filteredPlannerTasks" :key="task.plan_id || task.task">
          <div class="act-icon" style="background:#eef7ff;color:#1c5db6;">
            {{ (task.task || 'P').charAt(0) }}
          </div>
          <div>
            <div class="act-title">{{ task.task }}</div>
            <div class="act-sub">Deadline: {{ task.deadline }}</div>
          </div>
          <div class="act-time">{{ task.status }}</div>
        </div>
      </div>

      <div v-if="!plannerLoading && !plannerError && !filteredPlannerTasks.length" class="card" style="box-shadow:none;background:#f8fafc;">
        No matching study plans found.
      </div>
    </div>

    <div class="card">
      <div class="section-title">Resource Materials</div>
      <p style="color:var(--muted);margin-bottom:18px;">
        Upload lecture notes, slides, PDFs, and references needed for the study plan.
      </p>

      <div class="qa-card">
        <div class="qa-name">Biology_Chapter_5.pdf</div>
        <div class="qa-desc">Used for quiz preparation and flashcard review</div>
      </div>

      <div class="qa-card">
        <div class="qa-name">Math_Formula_Notes.docx</div>
        <div class="qa-desc">Attached to the mathematics revision goal</div>
      </div>

      <button class="btn-primary" style="margin-top:18px;">Upload Material</button>
    </div>
  </div>

  <div class="bottom-grid" style="margin-top:24px;">
    <div class="card">
      <div class="section-title">AI Recommended Schedule</div>

      <div class="upcoming-list">
        <div class="upcoming-item">
          <span class="upcoming-dot" style="background:#1d4ed8;"></span>
          <div>
            <div class="upcoming-name">Monday - Tuesday</div>
            <div class="upcoming-date">Mathematics and Physics revision</div>
          </div>
          <span class="upcoming-badge" style="background:#e0e7ff;color:#1d4ed8;">4h/day</span>
        </div>

        <div class="upcoming-item">
          <span class="upcoming-dot" style="background:#16a34a;"></span>
          <div>
            <div class="upcoming-name">Wednesday - Thursday</div>
            <div class="upcoming-date">Biology and Chemistry study session</div>
          </div>
          <span class="upcoming-badge" style="background:#dcfce7;color:#15803d;">3.5h/day</span>
        </div>

        <div class="upcoming-item">
          <span class="upcoming-dot" style="background:#f59e0b;"></span>
          <div>
            <div class="upcoming-name">Friday</div>
            <div class="upcoming-date">Review weak topics and complete practice quiz</div>
          </div>
          <span class="upcoming-badge" style="background:#fff4db;color:#b25f11;">5h</span>
        </div>
      </div>

      <button class="btn-primary" style="margin-top:20px;">Generate Study Schedule</button>
    </div>

    <div class="card">
      <div class="section-title">Reminders and Tutor Session</div>

      <div class="activity-list">
        <div class="activity-item">
          <div class="act-icon" style="background:#eef7ff;color:#1c5db6;">R1</div>
          <div>
            <div class="act-title">Biology Review Reminder</div>
            <div class="act-sub">Today at 8:00 PM</div>
          </div>
          <div class="act-time">Active</div>
        </div>

        <div class="activity-item">
          <div class="act-icon" style="background:#fff4e6;color:#b25f11;">R2</div>
          <div>
            <div class="act-title">Math Practice Reminder</div>
            <div class="act-sub">Tomorrow at 10:00 AM</div>
          </div>
          <div class="act-time">Set</div>
        </div>

        <div class="activity-item">
          <div class="act-icon" style="background:#edf7f0;color:#1f7a4c;">TS</div>
          <div>
            <div class="act-title">Tutor Session</div>
            <div class="act-sub">Book a tutor based on the selected study plan</div>
          </div>
          <button class="btn-primary" style="width:auto;padding:8px 14px;" onclick="window.location.href='../../views/tutors/tutors_index.html'">
            Book
          </button>
        </div>
      </div>
    </div>
  </div>
`,
  analytics: `
  <div class="topbar">
    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input
        type="text"
        v-model="analyticsSearch"
        placeholder="Search subjects, scores, mastery, or study time..."
      />
    </div>
    <div class="notif-btn">●<span class="notif-dot"></span></div>
    <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
  </div>

  <div class="greeting">
    <h1>{{ pageTitle }}</h1>
    <p>{{ pageSubtitle }}</p>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-val">
        {{ analyticsRecords.reduce((total, r) => total + Number(r.study_minutes || r.total_minutes_studied || 0), 0) }} min
      </div>
      <div class="stat-label">Total Study Time</div>
    </div>

    <div class="stat-card">
      <div class="stat-val">
        {{ analyticsRecords.length ? Math.round(analyticsRecords.reduce((total, r) => total + Number(r.quiz_score || r.average_quiz_score || 0), 0) / analyticsRecords.length) : 0 }}%
      </div>
      <div class="stat-label">Average Quiz Score</div>
    </div>

    <div class="stat-card">
      <div class="stat-val">
        {{ analyticsRecords.length ? Math.round(analyticsRecords.reduce((total, r) => total + Number(r.mastery || 0), 0) / analyticsRecords.length) : 0 }}%
      </div>
      <div class="stat-label">Average Mastery</div>
    </div>

    <div class="stat-card">
      <div class="stat-val">
        {{ analyticsRecords.filter(r => r.skill_gap === true || r.mastery < 70 || r.quiz_score < 70 || r.average_quiz_score < 70).length }}
      </div>
      <div class="stat-label">Skill Gaps Found</div>
    </div>
  </div>

  <div class="bottom-grid">
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;">
        <div>
          <div class="section-title" style="margin-bottom:4px;">Performance Dashboard</div>
          <p style="color:var(--muted);font-size:.9rem;margin:0;">
            Data is loaded asynchronously from data/analytics.json using the Fetch API.
          </p>
        </div>
        <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="fetchAnalyticsData">
          Refresh
        </button>
      </div>

      <div v-if="analyticsLoading" class="card" style="box-shadow:none;background:#f8fafc;">
        Loading analytics data...
      </div>

      <div v-if="analyticsError" class="error-msg">
        {{ analyticsError }}
      </div>

      <div class="activity-list" v-if="!analyticsLoading && filteredAnalyticsRecords.length">
        <div class="activity-item" v-for="record in filteredAnalyticsRecords" :key="record.id || record.subject || record.date">
          <div class="act-icon" style="background:#edf7f0;color:#1f7a4c;">
            {{ (record.subject || record.date || 'A').charAt(0) }}
          </div>
          <div>
            <div class="act-title">{{ record.subject || record.date }}</div>
            <div class="act-sub">
              Study Time: {{ record.study_minutes || record.total_minutes_studied }} minutes ·
              Modules: {{ record.modules_completed || 0 }} ·
              Mastery: {{ record.mastery || 'N/A' }}%
            </div>
          </div>
          <div class="act-time">{{ record.quiz_score || record.average_quiz_score }}%</div>
        </div>
      </div>

      <div v-if="!analyticsLoading && !analyticsError && !filteredAnalyticsRecords.length" class="card" style="box-shadow:none;background:#f8fafc;">
        No matching analytics records found.
      </div>
    </div>

    <div class="card">
      <div class="section-title">Mastery Tracking</div>

      <div class="qa-card" v-for="record in filteredAnalyticsRecords" :key="'mastery-' + (record.id || record.subject || record.date)">
        <div class="qa-name">{{ record.subject || record.date }}</div>
        <div class="qa-desc">
          Mastery Level: {{ record.mastery || 'N/A' }}% · Quiz Score: {{ record.quiz_score || record.average_quiz_score }}%
        </div>
      </div>
    </div>
  </div>

  <div class="bottom-grid" style="margin-top:24px;">
    <div class="card">
      <div class="section-title">AI Skill Gap Analysis</div>

      <div class="activity-list">
        <div
          class="activity-item"
          v-for="record in analyticsRecords.filter(r => r.skill_gap === true || r.mastery < 70 || r.quiz_score < 70 || r.average_quiz_score < 70)"
          :key="'gap-' + (record.id || record.subject || record.date)"
        >
          <div class="act-icon" style="background:#ffe5e1;color:#d92d20;">
            {{ (record.subject || record.date || 'G').substring(0,2).toUpperCase() }}
          </div>
          <div>
            <div class="act-title">{{ record.subject || record.date }}</div>
            <div class="act-sub">Needs additional practice based on current performance data</div>
          </div>
          <div class="act-time">Weak</div>
        </div>

        <div
          v-if="!analyticsRecords.filter(r => r.skill_gap === true || r.mastery < 70 || r.quiz_score < 70 || r.average_quiz_score < 70).length"
          class="card"
          style="box-shadow:none;background:#f8fafc;"
        >
          No major skill gaps detected.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">Tutor Review and Feedback</div>

      <div class="activity-list">
        <div class="activity-item">
          <div class="act-icon" style="background:#eef7ff;color:#1c5db6;">FB</div>
          <div>
            <div class="act-title">Tutor Feedback</div>
            <div class="act-sub">Focus more on subjects with mastery below 70%.</div>
          </div>
        </div>

        <div class="activity-item">
          <div class="act-icon" style="background:#edf7f0;color:#1f7a4c;">RA</div>
          <div>
            <div class="act-title">Recommended Action</div>
            <div class="act-sub">Book one tutor session for the weakest subject this week.</div>
          </div>
        </div>

        <div class="activity-item">
          <div class="act-icon" style="background:#fff4e6;color:#b25f11;">NS</div>
          <div>
            <div class="act-title">Next Step</div>
            <div class="act-sub">Revise weak topics before the next quiz attempt.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`,
  content: `
      <div class="topbar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search notes, folders, or AI summaries…" />
        </div>
        <div class="notif-btn">🔔<span class="notif-dot"></span></div>
        <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
      </div>
      
      <div class="greeting content-actions-row" style="margin-bottom: 24px;">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
      </div>

      <div class="upload-zone">
        <div class="upload-icon">☁️</div>
        <div class="upload-text">Drop files here to upload or click to browse</div>
        <div class="upload-sub">Supports: PDF, DOCX, TXT, Links</div>
      </div>

      <div class="content-actions-row">
        <div class="section-title" style="margin:0;">Recent Materials</div>
        <button class="btn-secondary" style="padding: 6px 14px; font-size:.85rem;">Filter Options</button>
      </div>

      <div class="content-grid">
        <div class="content-card" v-for="item in contentItems" :key="item.id">
          <div class="content-header">
            <span class="content-type-icon">{{ item.icon }}</span>
            <span v-if="item.shared" class="badge-shared">Shared</span>
          </div>
          <div class="content-title">{{ item.title }}</div>
          <div class="content-meta">{{ item.desc }}</div>
          <div class="content-actions">
            <button class="btn-secondary" style="padding: 4px 10px; font-size:.75rem;">AI Summary</button>
            <button class="btn-secondary" style="padding: 4px 10px; font-size:.75rem;">Extract Terms</button>
          </div>
        </div>
      </div>
    `,

  tracker: `
    <div class="topbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search exams, assignments…" />
      </div>
      <div class="notif-btn">🔔<span class="notif-dot"></span></div>
      <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
    </div>

    <div class="greeting content-actions-row" style="margin-bottom: 24px;">
      <div>
        <h1>Exam & Assignment Tracker ⏰</h1>
        <p>Never miss a deadline</p>
      </div>
      <button class="btn-primary" @click="openAddTaskModal" style="width: auto; padding: 10px 24px; border-radius: 24px;">+ Add Exam</button>
    </div>

    <div class="stats-row" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 0;">
      <div class="tracker-stat-card">
        <div class="tracker-stat-header"><span>❕</span> Upcoming</div>
        <div class="tracker-stat-val">3</div>
      </div>
      <div class="tracker-stat-card">
        <div class="tracker-stat-header"><span>📅</span> This Week</div>
        <div class="tracker-stat-val">2</div>
      </div>
      <div class="tracker-stat-card">
        <div class="tracker-stat-header"><span>✅</span> Completed</div>
        <div class="tracker-stat-val">8</div>
      </div>
      <div class="tracker-stat-card">
        <div class="tracker-stat-header"><span>🕒</span> Overdue</div>
        <div class="tracker-stat-val">0</div>
      </div>
    </div>

    <div class="tracker-list-card">
      <div class="tracker-list-title" style="display: flex; justify-content: space-between; align-items: center;">
        <span>Upcoming Deadlines</span>
        
        <select v-model="trackerCurrentView" style="border:1px solid var(--border); border-radius:4px; padding:6px 12px; outline:none; font-family: inherit; font-size: .85rem;">
          <option value="List View">List View</option>
          <option value="Calendar View">Calendar View</option>
        </select>
      </div>
      
      <div v-if="trackerCurrentView === 'List View'">
        <div class="tracker-item" v-for="task in trackerTasks" :key="task.id">
          <div class="tracker-item-left" :class="task.colorClass">
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="checkbox" class="task-checkbox" v-model="task.completed">
              <div class="tracker-item-title" :style="task.completed ? 'text-decoration: line-through; color: var(--muted);' : ''">{{ task.title }}</div>
            </div>
            <div class="tracker-item-meta" style="padding-left: 30px;">
              <span>📅 {{ task.date }}</span>
              <span>🕒 {{ task.time }}</span>
            </div>
            <div class="tracker-item-actions" style="padding-left: 30px;">
              <button class="btn-pill-primary">Study Now</button>
              <button class="btn-pill">Edit</button>
              <button class="btn-pill">Set Reminder</button>
            </div>
          </div>
          <div class="time-badge" :class="task.badgeClass">{{ task.badgeText }}</div>
        </div>
      </div>

      <div v-if="trackerCurrentView === 'Calendar View'" style="padding: 40px; text-align: center; color: var(--muted);">
        <div style="font-size: 3rem; margin-bottom: 16px;">🗓️</div>
        <h3>Calendar View Active</h3>
        <p>This is where the monthly calendar grid will be rendered.</p>
      </div>
    </div>

    <div v-if="showAddTaskModal" class="booking-modal-overlay" @click.self="closeAddTaskModal">
      <div class="booking-modal card">
        <div class="modal-header">
          <h3>Add New Deadline</h3>
          <button class="modal-close-btn" @click="closeAddTaskModal">×</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 12px;">
            <label style="font-size: .85rem; font-weight: 600; color: var(--text);">Task Title</label>
            <input type="text" v-model="newTaskForm.title" placeholder="e.g. Physics Lab Report" style="width: 100%; padding: 10px; margin-top: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); outline: none;" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="font-size: .85rem; font-weight: 600; color: var(--text);">Date</label>
              <input type="date" v-model="newTaskForm.date" style="width: 100%; padding: 10px; margin-top: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); outline: none;" />
            </div>
            <div>
              <label style="font-size: .85rem; font-weight: 600; color: var(--text);">Time</label>
              <input type="time" v-model="newTaskForm.time" style="width: 100%; padding: 10px; margin-top: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); outline: none;" />
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-size: .85rem; font-weight: 600; color: var(--text);">Priority</label>
            <select v-model="newTaskForm.priority" style="width: 100%; padding: 10px; margin-top: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); outline: none;">
              <option value="priority-high">High (Urgent)</option>
              <option value="priority-med">Medium (Standard)</option>
              <option value="priority-low">Low (Flexible)</option>
            </select>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button class="btn-pill" @click="closeAddTaskModal">Cancel</button>
          <button class="btn-pill-primary" @click="saveNewTask">Save Task</button>
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
          <span class="stat-badge" style="background: #eef7ff; color: #1c5db6;">Total</span>
        </div>
        <div class="stat-val">{{ adminStudentCount }}</div>
        <div class="stat-label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #edf7f0; color: #1f7a4c;">🧑‍🏫</div>
          <span class="stat-badge" style="background: #edf7f0; color: #1f7a4c;">Active</span>
        </div>
        <div class="stat-val">{{ adminTutorCount }}</div>
        <div class="stat-label">Active Tutors</div>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #fff4e6; color: #b25f11;">📅</div>
          <span class="stat-badge" style="background: #fff4e6; color: #b25f11;">Confirmed</span>
        </div>
        <div class="stat-val">{{ adminBookingCount }}</div>
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
            <label>Email Address</label>
            <input type="email" v-model="adminTutorForm.email" placeholder="e.g. sarah@school.edu" required />
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
  `,
  profile: `
    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>

    <div class="profile-grid">
      <!-- Profile Preview Column -->
      <div class="card" style="padding: 28px; display: flex; flex-direction: column; align-items: center; text-align: center; height: fit-content; position: sticky; top: 20px;">
        <div class="avatar-preview" :style="{ background: tempAvatarBg }">
          {{ computedInitials }}
        </div>
        <h2 style="font-family: 'Sora', sans-serif; font-size: 1.35rem; font-weight: 700; color: var(--text); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; width: 100%; white-space: nowrap;">{{ tempName || 'Your Name' }}</h2>
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--indigo); background: var(--indigo-lt); padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
          {{ tempRole }}
        </div>
        <div style="font-size: 0.9rem; color: var(--muted); margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span>📧</span> {{ tempEmail || 'email@school.edu' }}
        </div>
        <hr style="border: none; border-top: 1px solid var(--border); width: 100%; margin-bottom: 20px;" />
        <div style="text-align: left; width: 100%;">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Biography</div>
          <p style="font-size: 0.88rem; color: var(--muted); line-height: 1.5; font-style: italic; overflow-wrap: break-word;">
            {{ tempBio || 'No biography written yet. Tell us a bit about yourself!' }}
          </p>
        </div>
      </div>

      <!-- Edit Profile Form Column -->
      <div class="card" style="padding: 28px;">
        <!-- Success Alert Banner -->
        <div v-if="profileSuccessMsg" class="success-banner" style="margin-bottom: 20px; padding: 12px 16px; background-color: #edfcf7; border-left: 4px solid #1d9e75; color: #0f5c42; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>✨</span>
            <span>{{ profileSuccessMsg }}</span>
          </div>
          <button @click="profileSuccessMsg = ''" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #0f5c42; line-height: 1; padding: 0 4px;">&times;</button>
        </div>

        <!-- Error Alert Banner -->
        <div v-if="profileErrorMsg" class="error-banner" style="margin-bottom: 20px; padding: 12px 16px; background-color: #fdf2f2; border-left: 4px solid #d92d20; color: #9b1c1c; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>⚠️</span>
            <span>{{ profileErrorMsg }}</span>
          </div>
          <button @click="profileErrorMsg = ''" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #9b1c1c; line-height: 1; padding: 0 4px;">&times;</button>
        </div>

        <div class="section-title" style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>👤</span> Profile Settings
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="field" style="margin-bottom: 0;">
            <label>Full Name</label>
            <input type="text" v-model="tempName" placeholder="Alex Chen" required />
          </div>
          <div class="field" style="margin-bottom: 0;">
            <label>Email Address</label>
            <input type="email" v-model="tempEmail" placeholder="alex@school.edu" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div class="field" style="margin-bottom: 0;">
            <label>Change Password (Optional)</label>
            <input type="password" v-model="tempPassword" placeholder="••••••••" />
          </div>
        </div>

        <div class="field" style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
            <label style="margin-bottom: 0;">Biography</label>
            <span style="font-size: 0.72rem; color: (tempBio || '').length > 150 ? 'var(--rose)' : 'var(--muted)'; font-weight: 500;">
              {{ (tempBio || '').length }} / 150
            </span>
          </div>
          <textarea v-model="tempBio" placeholder="Tell us about yourself..." class="modal-textarea" rows="3" style="width:100%; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg); transition:border-color .2s; resize:vertical;" maxlength="150"></textarea>
        </div>

        <div style="margin-bottom: 28px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 10px; letter-spacing: .02em;">Avatar Background Gradient</label>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            <div v-for="preset in avatarPresets" :key="preset.name"
                 @click="tempAvatarBg = preset.gradient"
                 class="avatar-preset-bubble"
                 :class="{ active: tempAvatarBg === preset.gradient }"
                 :style="{ background: preset.gradient }"
                 :title="preset.name">
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
          <button class="btn-secondary" style="width: auto; padding: 12px 24px;" @click="resetForm">
            Reset Fields
          </button>
          <button class="btn-primary" style="width: auto; padding: 12px 24px;" @click="saveProfileChanges">
            Save Profile
          </button>
        </div>
      </div>
    </div>
  `
};

function mountViewApp() {
  if (!localStorage.getItem('preppal_token')) {
    window.location.href = rootRel + 'index.html';
    return;
  }
  const { createApp } = Vue;

  const mainTemplate = pageTemplates[pageId] || pageTemplates.default;

  const app = createApp({
    components: { SidebarComponent },
    data() { return appData; },
    computed: {
      filteredNavItems() {
        return this.navItems.filter(item => {
          if (Array.isArray(item.role)) {
            return item.role.includes(this.userRole);
          }
          return item.role === this.userRole;
        });
      },
      filteredPlannerTasks() {
        const query = (this.plannerSearch || '').trim().toLowerCase();

        return (this.plannerTasks || []).filter(task => {
          const taskName = (task.task || '').toLowerCase();
          const deadline = (task.deadline || '').toLowerCase();
          const status = (task.status || '').toLowerCase();

          return !query ||
            taskName.includes(query) ||
            deadline.includes(query) ||
            status.includes(query);
        });
      },

      filteredAnalyticsRecords() {
        const query = (this.analyticsSearch || '').trim().toLowerCase();

        return (this.analyticsRecords || []).filter(record => {
          const subject = (record.subject || record.date || '').toLowerCase();
          const mastery = String(record.mastery || '');
          const quizScore = String(record.quiz_score || record.average_quiz_score || '');
          const studyMinutes = String(record.study_minutes || record.total_minutes_studied || '');
          const modules = String(record.modules_completed || '');
          const skillGap = String(record.skill_gap || '').toLowerCase();

          return !query ||
            subject.includes(query) ||
            mastery.includes(query) ||
            quizScore.includes(query) ||
            studyMinutes.includes(query) ||
            modules.includes(query) ||
            skillGap.includes(query);
        });
      },

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
      },
      allFilteredQuizzes() {
        return (this.quizList || []).filter(q => {
          if (q.visibility === 'private' && q.owner !== this.currentUser) return false;
          const s = (this.quizSearch || '').toLowerCase();
          if (s && !q.title.toLowerCase().includes(s) && !q.subject.toLowerCase().includes(s) && !q.topic.toLowerCase().includes(s)) return false;
          if (this.quizFilterSubject && q.subject !== this.quizFilterSubject) return false;
          if (this.quizFilterTopic && q.topic !== this.quizFilterTopic) return false;
          return true;
        });
      },
      myFilteredQuizzes() { return this.allFilteredQuizzes.filter(q => q.owner === this.currentUser); },
      quizSubjects() { return [...new Set((this.quizList || []).map(q => q.subject))]; },
      quizTopics() { return [...new Set((this.quizList || []).map(q => q.topic))]; },
      quizScore() {
        if (!this.takingQuiz) return 0;
        let c = 0; this.takingQuiz.questions.forEach((q, i) => { if (this.quizAnswers[i] === q.correct) c++; }); return c;
      },
      quizWrongQuestions() {
        if (!this.takingQuiz) return [];
        return this.takingQuiz.questions.map((q, i) => ({ ...q, index: i })).filter(q => this.quizAnswers[q.index] !== q.correct);
      },
      allFilteredDecks() {
        return (this.deckList || []).filter(d => {
          if (d.visibility === 'private' && d.owner !== this.currentUser) return false;
          const s = (this.deckSearch || '').toLowerCase();
          if (s && !d.title.toLowerCase().includes(s) && !d.subject.toLowerCase().includes(s) && !d.topic.toLowerCase().includes(s)) return false;
          if (this.deckFilterSubject && d.subject !== this.deckFilterSubject) return false;
          if (this.deckFilterTopic && d.topic !== this.deckFilterTopic) return false;
          return true;
        });
      },
      myFilteredDecks() { return this.allFilteredDecks.filter(d => d.owner === this.currentUser); },
      deckSubjects() { return [...new Set((this.deckList || []).map(d => d.subject))]; },
      deckTopics() { return [...new Set((this.deckList || []).map(d => d.topic))]; },
      deckCorrectCount() {
        if (!this.playingDeck) return 0;
        return this.playingDeck.cards.filter((_, i) => this.cardResults[i] === 'correct').length;
      },
      deckWrongCards() {
        if (!this.playingDeck) return [];
        return this.playingDeck.cards.map((c, i) => ({ ...c, index: i })).filter(c => this.cardResults[c.index] === 'wrong');
      },
      computedInitials() {
        return getInitials(this.tempName);
      },
    },
    methods: {
      async fetchPlannerData() {
        this.plannerLoading = true;
        this.plannerError = '';

        try {
          const response = await fetch(rootRel + 'data/planner.json');

          if (!response.ok) {
            throw new Error('Failed to load planner.json');
          }

          this.plannerTasks = await response.json();
          console.log('Planner data loaded:', this.plannerTasks);
        } catch (error) {
          this.plannerError = 'Unable to load planner data. Check that data/planner.json exists.';
          console.error(error);
        } finally {
          this.plannerLoading = false;
        }
      },

      async fetchAnalyticsData() {
        this.analyticsLoading = true;
        this.analyticsError = '';

        try {
          const response = await fetch(rootRel + 'data/analytics.json');

          if (!response.ok) {
            throw new Error('Failed to load analytics.json');
          }

          this.analyticsRecords = await response.json();
          console.log('Analytics data loaded:', this.analyticsRecords);
        } catch (error) {
          this.analyticsError = 'Unable to load analytics data. Check that data/analytics.json exists.';
          console.error(error);
        } finally {
          this.analyticsLoading = false;
        }
      },
      logout() {
        localStorage.removeItem('preppal_token');
        localStorage.removeItem('preppal_profile');
        window.location.href = rootRel + 'index.html';
      },
      startQuiz(id) { window.location.href = rootRel + 'views/quizzes/quiz.html#' + id; },

      openCreateQuiz() {
        this.editingQuiz = null;
        this.quizForm = { title: '', subject: '', topic: '', difficulty: 'Medium', visibility: 'public', questions: [] };
        this.addQuizQuestion();
        this.showQuizModal = true;
      },
      openEditQuiz(quiz) {
        this.editingQuiz = quiz;
        this.quizForm = JSON.parse(JSON.stringify(quiz));
        this.showQuizModal = true;
      },
      addQuizQuestion() { this.quizForm.questions.push({ text: '', choices: ['', '', '', ''], correct: 0 }); },
      saveQuiz() {
        if (!this.quizForm.title || !this.quizForm.subject || !this.quizForm.questions.length) return;
        if (this.editingQuiz) {
          const idx = this.quizList.findIndex(q => q.id === this.editingQuiz.id);
          this.quizList.splice(idx, 1, { ...JSON.parse(JSON.stringify(this.quizForm)), id: this.editingQuiz.id, owner: this.editingQuiz.owner });
        } else {
          this.quizList.push({ ...JSON.parse(JSON.stringify(this.quizForm)), id: Date.now(), owner: this.currentUser });
        }
        this.showQuizModal = false;
      },
      deleteQuiz(id) { const i = this.quizList.findIndex(q => q.id === id); if (i >= 0) this.quizList.splice(i, 1); },
      startQuizGame(quiz) {
        this.takingQuiz = quiz; this.currentQ = 0; this.quizAnswers = {}; this.quizResults = false; this.quizTab = 'take';
      },
      submitQuiz() { this.quizResults = true; },

      openCreateDeck() {
        this.editingDeck = null;
        this.deckForm = { title: '', subject: '', topic: '', visibility: 'public', cards: [] };
        this.deckForm.cards.push({ q: '', a: '' });
        this.showDeckModal = true;
      },
      openEditDeck(deck) {
        this.editingDeck = deck;
        this.deckForm = JSON.parse(JSON.stringify(deck));
        this.showDeckModal = true;
      },
      saveDeck() {
        if (!this.deckForm.title || !this.deckForm.subject || !this.deckForm.cards.length) return;
        if (this.editingDeck) {
          const idx = this.deckList.findIndex(d => d.id === this.editingDeck.id);
          this.deckList.splice(idx, 1, { ...JSON.parse(JSON.stringify(this.deckForm)), id: this.editingDeck.id, owner: this.editingDeck.owner });
        } else {
          this.deckList.push({ ...JSON.parse(JSON.stringify(this.deckForm)), id: Date.now(), owner: this.currentUser });
        }
        this.showDeckModal = false;
      },
      deleteDeck(id) { const i = this.deckList.findIndex(d => d.id === id); if (i >= 0) this.deckList.splice(i, 1); },
      startDeck(deck) {
        this.playingDeck = deck; this.currentCard = 0; this.cardFlipped = false; this.cardResults = {}; this.deckResults = false; this.deckTab = 'play';
      },
      markCard(result) {
        this.cardResults[this.currentCard] = result;
        if (this.currentCard < this.playingDeck.cards.length - 1) {
          this.currentCard++; this.cardFlipped = false;
        } else {
          this.deckResults = true;
        }
      },
      openBookingModal(tutor) {
        this.bookingTutor = tutor;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.bookingDate = tomorrow.toISOString().split('T')[0];
        this.bookingTime = '14:00';
        this.bookingDuration = 1;
      },

      async confirmBooking() {
        if (!this.bookingDate || !this.bookingTime) {
          alert('Please select a date and time.');
          return;
        }

        try {
          const payload = {
            tutorId: this.bookingTutor.id,
            date: this.bookingDate,
            time: this.bookingTime + ':00',
            duration: this.bookingDuration,
            totalCost: this.bookingTutor.rate * this.bookingDuration
          };
          const res = await PrepPalAPI.createStudentBooking(payload);
          if (res && res.status === 'success') {
            this.bookedSessions.push(res.booking);

            const index = this.tutors.findIndex(t => t.id === this.bookingTutor.id);
            if (index !== -1) {
              this.tutors[index].status = 'busy';
            }

            this.bookingTutor = null;
            alert('Booking confirmed successfully!');
          }
        } catch (e) {
          alert('Booking failed: ' + e.message);
        }
      },
      openAddTutorModal() {
        this.adminTutorForm = { name: '', email: '', rate: 30, subjects: '', status: 'available', bio: '' };
        this.showAddTutorModal = true;
      },
      async saveNewTutor() {
        const form = this.adminTutorForm;
        if (!form.name || !form.subjects) {
          alert('Please fill out Name and Subjects.');
          return;
        }
        try {
          const payload = {
            name: form.name,
            email: form.email || (form.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@school.edu'),
            rate: Number(form.rate) || 30,
            subjects: form.subjects,
            status: form.status,
            bio: form.bio
          };
          const res = await PrepPalAPI.createAdminTutor(payload);
          if (res && res.status === 'success') {
            this.tutors.push(res.tutor);
            this.adminTutorCount = this.tutors.length;
            this.showAddTutorModal = false;
          }
        } catch (e) {
          alert('Failed to add tutor: ' + e.message);
        }
      },
      openEditTutorModal(tutor) {
        this.editingTutorId = tutor.id;
        this.adminTutorForm = {
          name: tutor.name,
          email: tutor.email || '',
          rate: tutor.rate,
          subjects: Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects,
          status: tutor.status,
          bio: tutor.bio
        };
        this.showEditTutorModal = true;
      },
      async updateTutor() {
        const form = this.adminTutorForm;
        const index = this.tutors.findIndex(t => t.id === this.editingTutorId);
        if (index !== -1) {
          if (!form.name || !form.subjects) {
            alert('Please fill out Name and Subjects.');
            return;
          }
          try {
            await PrepPalAPI.updateAdminTutor(this.editingTutorId, {
              name: form.name,
              rate: Number(form.rate) || 30,
              subjects: form.subjects,
              status: form.status,
              bio: form.bio
            });
            const subArray = typeof form.subjects === 'string' ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : form.subjects;
            this.tutors[index].name = form.name;
            this.tutors[index].rate = Number(form.rate) || 30;
            this.tutors[index].subjects = subArray.length ? subArray : ['General'];
            this.tutors[index].status = form.status;
            this.tutors[index].bio = form.bio || 'Experienced academic tutor.';
            this.showEditTutorModal = false;
            this.editingTutorId = null;
          } catch (e) {
            alert('Failed to update tutor: ' + e.message);
          }
        }
      },
      async deleteTutor(id) {
        if (confirm('Are you sure you want to delete this tutor?')) {
          try {
            await PrepPalAPI.deleteAdminTutor(id);
            this.tutors = this.tutors.filter(t => t.id !== id);
            this.adminTutorCount = this.tutors.length;
          } catch (e) {
            alert('Failed to delete tutor: ' + e.message);
          }
        }
      },
      async toggleTutorStatus(tutor) {
        const nextStatus = tutor.status === 'available' ? 'busy' : 'available';
        try {
          await PrepPalAPI.toggleTutorStatus(tutor.id, nextStatus);
          tutor.status = nextStatus;
        } catch (e) {
          alert('Failed to update tutor status: ' + e.message);
        }
      },
      async deleteBooking(id) {
        if (confirm('Are you sure you want to cancel this booking?')) {
          try {
            await PrepPalAPI.deleteAdminBooking(id);
            this.bookedSessions = this.bookedSessions.filter(b => b.id !== id);
            this.adminBookingCount = this.bookedSessions.length;
          } catch (e) {
            alert('Failed to cancel booking: ' + e.message);
          }
        }
      },
      openAddTaskModal() {
        this.showAddTaskModal = true;
      },
      closeAddTaskModal() {
        this.showAddTaskModal = false;
        // Reset the form when closed
        this.newTaskForm = { title: '', type: 'Exam', date: '', time: '', priority: 'priority-med' };
      },
      saveNewTask() {
        if (!this.newTaskForm.title || !this.newTaskForm.date) {
          alert('Please enter a title and a date.');
          return;
        }

        // Assign colors based on priority
        let colorClass = 'border-blue';
        let badgeClass = 'badge-purple';

        if (this.newTaskForm.priority === 'priority-high') {
          colorClass = 'border-orange';
          badgeClass = 'badge-red';
        } else if (this.newTaskForm.priority === 'priority-med') {
          colorClass = 'border-yellow';
          badgeClass = 'badge-orange';
        }

        // Add the new task to the list
        this.trackerTasks.push({
          id: 't-' + Date.now(),
          title: this.newTaskForm.title,
          date: this.newTaskForm.date,
          time: this.newTaskForm.time || '11:59 PM',
          colorClass: colorClass,
          badgeText: 'Just Added',
          badgeClass: badgeClass,
          completed: false
        });

        this.closeAddTaskModal();
      },
      goToProfile() {
        window.location.href = this.rootRel + 'views/profile/profile_index.html';
      },
      async saveProfileChanges() {
        this.profileSuccessMsg = '';
        this.profileErrorMsg = '';

        if (!this.tempName.trim()) {
          this.profileErrorMsg = 'Full Name cannot be empty.';
          return;
        }
        if (!this.tempEmail.trim() || !this.tempEmail.includes('@')) {
          this.profileErrorMsg = 'Please enter a valid email address.';
          return;
        }

        try {
          const payload = {
            name: this.tempName.trim(),
            email: this.tempEmail.trim(),
            bio: this.tempBio || ''
          };
          if (this.tempPassword) {
            if (this.tempPassword.length < 4) {
              this.profileErrorMsg = 'Password must be at least 4 characters long.';
              return;
            }
            payload.password = this.tempPassword;
          }

          const response = await PrepPalAPI.updateProfile(payload);

          if (response && response.status === 'success') {
            if (response.token) {
              localStorage.setItem('preppal_token', response.token);
            }

            const rawRole = response.user.role || 'student';
            const capitalizedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

            const updatedProfile = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: capitalizedRole,
              initials: response.user.initials || '??',
              bio: response.user.bio || '',
              avatarBg: this.tempAvatarBg
            };

            localStorage.setItem('preppal_profile', JSON.stringify(updatedProfile));

            // Update the app state
            this.userName = updatedProfile.name;
            this.userEmail = updatedProfile.email;
            this.userRole = updatedProfile.role;
            this.initials = updatedProfile.initials;
            this.userBio = updatedProfile.bio;
            this.userAvatarBg = updatedProfile.avatarBg;

            this.tempPassword = '';
            this.profileSuccessMsg = 'Profile updated successfully!';

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
              if (this.profileSuccessMsg === 'Profile updated successfully!') {
                this.profileSuccessMsg = '';
              }
            }, 5000);
          } else {
            this.profileErrorMsg = 'Failed to update profile. Server returned an error.';
          }
        } catch (error) {
          console.error(error);
          this.profileErrorMsg = error.message || 'An error occurred while updating profile.';
        }
      },
      resetForm() {
        const currentProfile = getStoredProfile();
        this.tempName = currentProfile.name;
        this.tempEmail = currentProfile.email;
        this.tempRole = currentProfile.role;
        this.tempBio = currentProfile.bio;
        this.tempAvatarBg = currentProfile.avatarBg;
        this.tempPassword = '';
        this.profileSuccessMsg = '';
        this.profileErrorMsg = '';
      },
      async fetchAdminStats() {
        try {
          const res = await PrepPalAPI.getAdminStats();
          this.adminStudentCount = res.studentCount;
          this.adminTutorCount = res.tutorCount;
          this.adminBookingCount = res.bookingCount;
          this.tutors = res.tutors;
        } catch (e) {
          console.error('Failed to load admin stats:', e);
        }
      },
      async fetchAdminBookings() {
        try {
          const res = await PrepPalAPI.getAdminBookings();
          this.bookedSessions = res;
        } catch (e) {
          console.error('Failed to load admin bookings:', e);
        }
      },
      async fetchStudentTutors() {
        try {
          const res = await PrepPalAPI.getStudentTutors();
          this.tutors = res;
        } catch (e) {
          console.error('Failed to load student tutors:', e);
        }
      },
      async fetchStudentBookings() {
        try {
          const res = await PrepPalAPI.getStudentBookings();
          this.bookedSessions = res;
        } catch (e) {
          console.error('Failed to load student bookings:', e);
        }
      }
    },
    mounted() {
      if (this.activeNav === 'admins') {
        this.fetchAdminStats();
        this.fetchAdminBookings();
      }

      if (this.activeNav === 'tutors') {
        this.fetchStudentTutors();
        this.fetchStudentBookings();
      }

      if (this.activeNav === 'planner') {
        this.fetchPlannerData();
      }

      if (this.activeNav === 'analytics') {
        this.fetchAnalyticsData();
      }
    },
    template: `
      <div class="app-shell">
        <sidebar-component
          :nav-items="filteredNavItems"
          :active-nav="activeNav"
          :user-name="userName"
          :initials="initials"
          :user-avatar-bg="userAvatarBg"
          :user-role="userRole"
          @logout="logout"
          @goToProfile="goToProfile"
        />
        <main class="main">
          ${mainTemplate}
        </main>
      </div>
    `,
  });

  app.mount('#view-app');
}

// Helper to retrieve user profile data
function getCurrentUser() {
  const profile = getStoredProfile();
  return {
    id: profile.id || 1,
    name: profile.name,
    initials: profile.initials || getInitials(profile.name),
    role: profile.role || 'Student',
    avatarBg: profile.avatarBg || 'linear-gradient(135deg, var(--indigo), var(--mint))'
  };
}

// Reusable app-mount wrapper for modular pages
function mountApp(pageOptions) {
  if (!localStorage.getItem('preppal_token')) {
    window.location.href = rootRel + 'index.html';
    return;
  }
  const { createApp } = Vue;
  const user = getCurrentUser();

  const app = createApp({
    components: { SidebarComponent, ...(pageOptions.components || {}) },
    data() {
      const base = {
        pageTitle, pageSubtitle,
        activeNav: pageId,
        navItems,
        userName: user.name,
        initials: user.initials,
        currentUserId: user.id,
        userRole: user.role,
        userAvatarBg: user.avatarBg,
      };
      const extra = pageOptions.data ? pageOptions.data.call(this) : {};
      return { ...base, ...extra };
    },
    computed: {
      filteredNavItems() {
        return this.navItems.filter(item => {
          if (Array.isArray(item.role)) {
            return item.role.includes(this.userRole);
          }
          return item.role === this.userRole;
        });
      },
      ...(pageOptions.computed || {}),
    },
    methods: {
      logout() {
        localStorage.removeItem('preppal_token');
        localStorage.removeItem('preppal_profile');
        window.location.href = rootRel + 'index.html';
      },
      goToProfile() {
        window.location.href = rootRel + 'views/profile/profile_index.html';
      },
      ...(pageOptions.methods || {}),
    },
    mounted() {
      if (pageOptions.mounted) pageOptions.mounted.call(this);
    },
    template: `
      <div class="app-shell">
        <sidebar-component
          :nav-items="filteredNavItems"
          :active-nav="activeNav"
          :user-name="userName"
          :initials="initials"
          :user-avatar-bg="userAvatarBg"
          :user-role="userRole"
          @logout="logout"
          @goToProfile="goToProfile"
        />
        <main class="main">${pageOptions.template}</main>
      </div>`,
  });

  app.mount('#view-app');
  return app;
}

// Expose PrepPalCore namespace for backward-compatibility
window.PrepPalCore = {
  pageId,
  pageTitle,
  pageSubtitle,
  rootRel,
  navItems,
  SidebarComponent,
  getCurrentUser,
  mountApp
};

// Automatic mount for monolithic pages, skipping modular pages
const modularPages = ['quizzes', 'flashcards', 'users', 'moderation', 'bookings', 'announcements', 'settings'];
if (!modularPages.includes(pageId)) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountViewApp);
  } else {
    mountViewApp();
  }
}

