const pageId = document.body.dataset.pageId || 'dashboard';
const pageTitle = document.body.dataset.pageTitle || 'Dashboard';
const pageSubtitle = document.body.dataset.pageSubtitle || '';

// Determine root-relative path: pages inside `views/<page>/index.html` need '../../' to reach project root
const atViews = /\/views\/[^/]+\/index\.html$/.test(window.location.pathname) || /\/views\//.test(window.location.pathname);
const rootRel = atViews ? '../../' : '';

const navItems = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', route: rootRel + 'dashboard.html' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant', route: rootRel + 'views/ai/index.html' },
  { id: 'content', icon: '📚', label: 'Content Hub', route: rootRel + 'views/content/index.html' },
  { id: 'flashcards', icon: '🧠', label: 'Flashcards', route: rootRel + 'views/flashcards/index.html' },
  { id: 'quizzes', icon: '✏️', label: 'Quizzes', route: rootRel + 'views/quizzes/index.html' },
  { id: 'planner', icon: '🗓️', label: 'Planner', route: rootRel + 'views/planner/index.html' },
  { id: 'analytics', icon: '📊', label: 'Analytics', route: rootRel + 'views/analytics/index.html' },
  { id: 'tutors', icon: '🧑‍🏫', label: 'Tutors', route: rootRel + 'views/tutors/index.html' }
];

const appData = {
  pageTitle,
  pageSubtitle,
  activeNav: pageId,
  navItems,
  userName: 'Alex Chen',
  initials: 'AC',
  stats: [
    { icon: '📈', value: '82%', label: 'Focus Score', change: '+8%', bg: '#d9f7e4', color: '#1f7a4c' },
    { icon: '🧠', value: '14', label: 'Completed Lessons', change: '+2', bg: '#eef7ff', color: '#1c5db6' },
    { icon: '⏱️', value: '6h 24m', label: 'Study Time', change: '+1h', bg: '#fff4e6', color: '#b25f11' }
  ],
  quickActions: [
    { icon: '📝', name: 'Write Notes', desc: 'Capture quick ideas from class.' },
    { icon: '⚡', name: 'Skill Drills', desc: 'Practice short review sessions.' },
    { icon: '📅', name: 'Plan Study', desc: 'Schedule tasks for the week.' }
  ],
  quizzes: [
    { id: 'bio-5', title: 'Biology — Chapter 5', desc: 'Cell structure and function', questions: 10, time: '10m', difficulty: 'Medium' },
    { id: 'chem-1', title: 'Chemistry — Basics', desc: 'Atoms, molecules, bonds', questions: 12, time: '12m', difficulty: 'Easy' },
    { id: 'math-quiz', title: 'Algebra Practice', desc: 'Linear equations', questions: 8, time: '8m', difficulty: 'Hard' }
  ],
  activity: [
    { icon: '✅', title: 'Finished Chapter 3 Quiz', sub: '10 min ago', time: '10m', bg: '#edf7f0' },
    { icon: '🔔', title: 'New tutor message', sub: '30 min ago', time: '30m', bg: '#f3f5ff' },
    { icon: '📌', title: 'Study plan updated', sub: '1 hour ago', time: '1h', bg: '#fff3f0' }
  ],
  upcoming: [
    { name: 'Biology Quiz', date: 'Today · 5:00 PM', tag: 'Due', dotColor: '#d92d20', badgeBg: '#ffe5e1' },
    { name: 'Essay Draft', date: 'Tomorrow · 11:00 AM', tag: 'Soon', dotColor: '#f59e0b', badgeBg: '#fff4db' },
    { name: 'Flashcards Review', date: 'Friday · 9:00 AM', tag: 'Plan', dotColor: '#1d4ed8', badgeBg: '#e0e7ff' }
  ]
};

function mountViewApp() {
  createApp({
    data() {
      return appData;
    },
    methods: {
      logout() {
        const logoutUrl = rootRel + 'index.html';
        window.location.href = logoutUrl;
      },
      startQuiz(quizId) {
        // For now, navigate to a quiz page if present, otherwise open a placeholder
        const quizUrl = rootRel + 'views/quizzes/quiz.html#' + quizId;
        window.location.href = quizUrl;
      }
    },
    components: {
      Sidebar: {
        template: '#sidebar-template',
        props: ['navItems', 'activeNav', 'userName', 'initials']
      }
    }
  }).mount('#view-app');
}
console.log('view-layout:', { pageId, rootRel });

// Ensure Vue is available (createApp). Dynamically load if necessary.
function ensureVue() {
  return new Promise((resolve, reject) => {
    if (typeof createApp !== 'undefined' && typeof createApp === 'function') {
      return resolve();
    }
    if (window.Vue && typeof window.Vue.createApp === 'function') {
      window.createApp = window.Vue.createApp;
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vue@3/dist/vue.global.js';
    script.onload = () => {
      if (window.Vue && typeof window.Vue.createApp === 'function') {
        window.createApp = window.Vue.createApp;
        resolve();
      } else {
        reject(new Error('Vue loaded but createApp not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Vue from CDN'));
    document.head.appendChild(script);
  });
}

ensureVue()
  .then(() => {
    return fetch(rootRel + 'sidebar.html');
  })
  .then((response) => {
    if (!response || !response.ok) {
      throw new Error('Failed to fetch sidebar template');
    }
    return response.text();
  })
  .then((html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const template = doc.getElementById('sidebar-template');
      if (template) {
        const imported = document.importNode(template, true);
        document.body.insertBefore(imported, document.body.firstChild);
      } else {
        // fallback: insert sanitized HTML (remove scripts/styles)
        const safe = document.createElement('div');
        safe.innerHTML = html;
        safe.querySelectorAll('script, style').forEach((n) => n.remove());
        document.body.insertBefore(safe, document.body.firstChild);
      }
      console.log('view-layout: inserted sidebar template (parsed)');
    } catch (err) {
      console.error('view-layout: parsing sidebar failed, inserting raw HTML', err);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.insertBefore(wrapper, document.body.firstChild);
    }
    mountViewApp();
  })
  .catch((error) => {
    console.error('Failed to load sidebar.html or Vue; injecting fallback template:', error);
    const fallback = document.createElement('div');
    fallback.innerHTML = `
      <template id="sidebar-template">
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
               :class="{ active: activeNav === item.id }"
               @click="$emit('update:activeNav', item.id)">
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          </nav>

          <div class="tip-box">
            <div class="tip-title">💡 Study Tip</div>
            <div class="tip-text">Take short breaks to improve focus.</div>
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
      </template>
    `;
    document.body.insertBefore(fallback, document.body.firstChild);
    // Try to mount only if Vue is available
    if (typeof createApp !== 'undefined') {
      mountViewApp();
    } else {
      console.warn('Vue is not available; cannot mount view app.');
    }
  });
