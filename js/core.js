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
    { 
      id: 'dashboard',  
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,   
      label: 'Dashboard',    
      route: rootRel + 'dashboard.html',
      role: 'Student'
    },
    { 
      id: 'tutor-dashboard', 
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`, 
      label: 'Tutor Dashboard', 
      route: rootRel + 'views/tutors/tutor_dashboard.html', 
      role: 'Tutor' 
    },

    { 
      id: 'content',    
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,   
      label: 'Content Hub',  
      route: rootRel + 'views/content/content_index.html',
      role: 'Student'
    },
    { 
      id: 'flashcards', 
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,   
      label: 'Flashcards',   
      route: rootRel + 'views/flashcards/flashcards_index.html',
      role: 'Student'
    },
    { 
      id: 'quizzes',    
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,   
      label: 'Quizzes',      
      route: rootRel + 'views/quizzes/quizzes_index.html',
      role: 'Student'
    },
    { 
      id: 'planner',    
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,   
      label: 'Planner',      
      route: rootRel + 'views/planner/planner_index.html',
      role: 'Student'
    },
    { 
      id: 'analytics',  
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,   
      label: 'Analytics',    
      route: rootRel + 'views/analytics/analytics_index.html',
      role: 'Student'
    },
    { 
      id: 'tutors',     
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,  
      label: 'Tutors',       
      route: rootRel + 'views/tutors/tutors_index.html',
      role: 'Student'
    },
    {
      id: 'tracker',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      label: 'Deadline Tracker',
      route: rootRel + 'views/tracker/tracker_index.html',
      role: ['Student', 'Tutor']
    },
  ];

  const SidebarComponent = {
    props: ['navItems', 'activeNav', 'userName', 'initials', 'userAvatarBg', 'userRole'],
    emits: ['logout', 'goToProfile'],
    template: `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon" style="color: white; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div class="sidebar-brand-name">PrepPal</div>
            <div class="sidebar-brand-sub">AI Study Assistant</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a v-for="item in navItems" :key="item.id" :href="item.route" class="nav-item" :class="{active:activeNav===item.id}" style="display: flex; align-items: center;">
            <span class="nav-icon" v-html="item.icon" style="display: inline-flex; align-items: center; justify-content: center; margin-right: 2px;"></span>
            <span class="nav-label">{{item.label}}</span>
          </a>
        </nav>
        <div class="tip-box">
          <div class="tip-title">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>
            Study Tip
          </div>
          <div class="tip-text">Take breaks every 25 minutes for better retention.</div>
        </div>
        <div class="sidebar-user" style="display: flex; align-items: center;">
          <div class="avatar" :style="{ background: userAvatarBg || 'linear-gradient(135deg, #7c3aed, #c084fc)' }">{{initials}}</div>
          <div style="flex-grow: 1; min-width: 0; padding-right: 6px;">
            <div class="user-name" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{userName}}</div>
            <div class="user-role">{{userRole || 'Student'}}</div>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; margin-left: auto; flex-shrink: 0;">
            <button class="profile-btn" @click="$emit('goToProfile')" title="Edit Profile">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button class="logout-btn" @click="$emit('logout')" title="Sign out">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>`,
  };

  // Reads the locally stored profile (set on login) for display name/initials/id.
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('preppal_profile');
      if (stored) {
        const p = JSON.parse(stored);
        return {
          id: p.id || 1,
          name: p.name || 'Alex Chen',
          initials: p.initials || 'AC',
          role: p.role || 'Student',
          avatarBg: p.avatarBg || 'linear-gradient(135deg, #7c3aed, #c084fc)'
        };
      }
    } catch (e) { /* ignore */ }
    return {
      id: 1,
      name: 'Alex Chen',
      initials: 'AC',
      role: 'Student',
      avatarBg: 'linear-gradient(135deg, #7c3aed, #c084fc)'
    };
  }

  // Mounts a page-specific Vue app inside the shared app-shell + sidebar.
  // `pageOptions` = { data, computed, methods, mounted, template }
  function mountApp(pageOptions) {
    const { createApp } = Vue;
    const user = getCurrentUser();

    const app = createApp({
      components: { SidebarComponent, ...(pageOptions.components || {}) },
      data() {
        const filteredNav = navItems.filter(item => {
          if (item.role) {
            if (Array.isArray(item.role)) return item.role.includes(user.role);
            return item.role === user.role;
          }
          return true;
        });
        const base = {
          pageTitle, pageSubtitle,
          activeNav: pageId,
          navItems: filteredNav,
          userName: user.name,
          initials: user.initials,
          userRole: user.role,
          userAvatarBg: user.avatarBg,
          currentUserId: user.id,
        };
        const extra = pageOptions.data ? pageOptions.data.call(this) : {};
        return { ...base, ...extra };
      },
      computed: pageOptions.computed || {},
      methods: {
        logout() { window.location.href = rootRel + 'index.html'; },
        goToProfile() { window.location.href = rootRel + 'views/profile/profile_index.html'; },
        ...(pageOptions.methods || {}),
      },
      mounted() {
        if (pageOptions.mounted) pageOptions.mounted.call(this);
      },
      template: `
        <div class="app-shell">
          <sidebar-component :nav-items="navItems" :active-nav="activeNav" :user-name="userName" :initials="initials" :user-avatar-bg="userAvatarBg" :user-role="userRole" @logout="logout" @go-to-profile="goToProfile"/>
          <main class="main">${pageOptions.template}</main>
        </div>`,
    });

    app.mount('#view-app');
    return app;
  }

  return { pageId, pageTitle, pageSubtitle, rootRel, navItems, SidebarComponent, getCurrentUser, mountApp };
})();
