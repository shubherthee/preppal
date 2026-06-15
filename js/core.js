// js/core.js
// Shared building blocks for every page: navigation config, the Sidebar
// component, and a small helper to mount a page's Vue app inside the
// standard app-shell + sidebar layout.

window.PrepPalCore = (function () {
  const pageId       = document.body.dataset.pageId       || 'dashboard';
  const pageTitle    = document.body.dataset.pageTitle    || '';
  const pageSubtitle = document.body.dataset.pageSubtitle || '';

  const atViews = /\/views\//.test(window.location.pathname);
  const rootRel = atViews ? '../../' : '';

  const navItems = [
    { id: 'dashboard',  icon: '🏠',   label: 'Dashboard',    route: rootRel + 'dashboard.html' },
    { id: 'ai',         icon: '🤖',   label: 'AI Assistant', route: rootRel + 'views/ai/ai_index.html' },
    { id: 'content',    icon: '📚',   label: 'Content Hub',  route: rootRel + 'views/content/content_index.html' },
    { id: 'flashcards', icon: '🧠',   label: 'Flashcards',   route: rootRel + 'views/flashcards/flashcards_index.html' },
    { id: 'quizzes',    icon: '✏️',   label: 'Quizzes',      route: rootRel + 'views/quizzes/quizzes_index.html' },
    { id: 'planner',    icon: '🗓️',   label: 'Planner',      route: rootRel + 'views/planner/planner_index.html' },
    { id: 'analytics',  icon: '📊',   label: 'Analytics',    route: rootRel + 'views/analytics/analytics_index.html' },
    { id: 'tutors',     icon: '🧑‍🏫',  label: 'Tutors',       route: rootRel + 'views/tutors/tutors_index.html' },
  ];

  const SidebarComponent = {
    props: ['navItems', 'activeNav', 'userName', 'initials'],
    emits: ['logout'],
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
          <a v-for="item in navItems" :key="item.id" :href="item.route" class="nav-item" :class="{active:activeNav===item.id}">
            <span class="nav-icon">{{item.icon}}</span>{{item.label}}
          </a>
        </nav>
        <div class="tip-box">
          <div class="tip-title">💡 Study Tip</div>
          <div class="tip-text">Take breaks every 25 minutes for better retention.</div>
        </div>
        <div class="sidebar-user">
          <div class="avatar">{{initials}}</div>
          <div><div class="user-name">{{userName}}</div><div class="user-role">Student</div></div>
          <button class="logout-btn" @click="$emit('logout')" title="Sign out">⏻</button>
        </div>
      </aside>`,
  };

  // Reads the locally stored profile (set on login) for display name/initials/id.
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('preppal_profile');
      if (stored) {
        const p = JSON.parse(stored);
        return { id: p.id || 1, name: p.name || 'Alex Chen', initials: p.initials || 'AC' };
      }
    } catch (e) { /* ignore */ }
    return { id: 1, name: 'Alex Chen', initials: 'AC' };
  }

  // Mounts a page-specific Vue app inside the shared app-shell + sidebar.
  // `pageOptions` = { data, computed, methods, mounted, template }
  function mountApp(pageOptions) {
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
        };
        const extra = pageOptions.data ? pageOptions.data.call(this) : {};
        return { ...base, ...extra };
      },
      computed: pageOptions.computed || {},
      methods: {
        logout() { window.location.href = rootRel + 'index.html'; },
        ...(pageOptions.methods || {}),
      },
      mounted() {
        if (pageOptions.mounted) pageOptions.mounted.call(this);
      },
      template: `
        <div class="app-shell">
          <sidebar-component :nav-items="navItems" :active-nav="activeNav" :user-name="userName" :initials="initials" @logout="logout"/>
          <main class="main">${pageOptions.template}</main>
        </div>`,
    });

    app.mount('#view-app');
    return app;
  }

  return { pageId, pageTitle, pageSubtitle, rootRel, navItems, SidebarComponent, getCurrentUser, mountApp };
})();
