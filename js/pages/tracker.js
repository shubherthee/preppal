// js/pages/tracker.js
// Deadline Tracker - fully wired to /api/tracker

window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.PrepPalCore === 'undefined') return;

  window.PrepPalCore.mountApp({
    // ── data ──────────────────────────────────────────────────────────
    data() {
      return {
        deadlines: [],
        stats: { upcoming: 0, this_week: 0, completed: 0, overdue: 0 },
        loading: false,
        error: '',
        searchQuery: '',
        filterType: 'all',      // all | Exam | Assignment | Quiz | Task
        currentView: 'list',    // list | calendar

        // Calendar state
        calendarYear: new Date().getFullYear(),
        calendarMonth: new Date().getMonth(), // 0-indexed

        // Add / Edit modal
        showModal: false,
        editingId: null,
        form: {
          title:     '',
          deadline:  '',
          exam_time: '',
          exam_type: 'Exam',
          subject:   '',
          priority:  'medium',
        },
        saving:    false,
        formError: '',
      };
    },

    // ── computed ──────────────────────────────────────────────────────
    computed: {
      filtered() {
        const q = this.searchQuery.toLowerCase().trim();
        return this.deadlines.filter(d => {
          const matchSearch = !q ||
            d.title.toLowerCase().includes(q) ||
            (d.subject || '').toLowerCase().includes(q) ||
            (d.exam_type || '').toLowerCase().includes(q);
          const matchType = this.filterType === 'all' || d.exam_type === this.filterType;
          return matchSearch && matchType;
        });
      },
      upcomingDeadlines() {
        return this.filtered.filter(d => !d.completed);
      },
      doneDeadlines() {
        return this.filtered.filter(d => d.completed);
      },

      // Calendar helpers
      calendarMonthName() {
        return new Date(this.calendarYear, this.calendarMonth, 1)
          .toLocaleString('default', { month: 'long', year: 'numeric' });
      },

      calendarDays() {
        const year  = this.calendarYear;
        const month = this.calendarMonth;
        const first = new Date(year, month, 1).getDay(); // 0 = Sun
        const total = new Date(year, month + 1, 0).getDate();
        const days  = [];

        // Leading empty cells
        for (let i = 0; i < first; i++) days.push(null);

        for (let d = 1; d <= total; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const items   = this.deadlines.filter(dl => dl.deadline === dateStr);
          days.push({ day: d, date: dateStr, items });
        }
        return days;
      },

      isToday() {
        return (dateStr) => dateStr === new Date().toISOString().split('T')[0];
      },
    },

    // ── methods ───────────────────────────────────────────────────────
    methods: {
      async fetchAll() {
        this.loading = true;
        this.error   = '';
        try {
          const [deadlines, stats] = await Promise.all([
            PrepPalAPI.request('/tracker'),
            PrepPalAPI.request('/tracker/stats'),
          ]);
          this.deadlines = deadlines;
          this.stats     = stats;
        } catch (e) {
          this.error = e.message || 'Failed to load deadlines';
        } finally {
          this.loading = false;
        }
      },

      async toggleComplete(item) {
        try {
          const res = await PrepPalAPI.request(`/tracker/${item.id}/complete`, { method: 'PATCH' });
          item.completed = res.completed;
          await this.refreshStats();
        } catch (e) {
          alert('Could not update: ' + e.message);
        }
      },

      async refreshStats() {
        try {
          this.stats = await PrepPalAPI.request('/tracker/stats');
        } catch (_) {}
      },

      openCreate() {
        this.editingId = null;
        this.form = { title: '', deadline: '', exam_time: '', exam_type: 'Exam', subject: '', priority: 'medium' };
        this.formError = '';
        this.showModal = true;
      },

      openEdit(item) {
        this.editingId = item.id;
        this.form = {
          title:     item.title,
          deadline:  item.deadline,
          exam_time: item.exam_time || '',
          exam_type: item.exam_type || 'Exam',
          subject:   item.subject   || '',
          priority:  item.priority  || 'medium',
        };
        this.formError = '';
        this.showModal = true;
      },

      async saveDeadline() {
        if (!this.form.title.trim() || !this.form.deadline) {
          this.formError = 'Title and date are required.';
          return;
        }
        this.saving    = true;
        this.formError = '';
        try {
          if (this.editingId) {
            await PrepPalAPI.request(`/tracker/${this.editingId}`, {
              method: 'PUT',
              body: JSON.stringify(this.form),
            });
            // Refresh list so badge text re-computes server-side
            await this.fetchAll();
          } else {
            const created = await PrepPalAPI.request('/tracker', {
              method: 'POST',
              body: JSON.stringify(this.form),
            });
            this.deadlines.push(created);
            this.deadlines.sort((a, b) => a.deadline.localeCompare(b.deadline));
            await this.refreshStats();
          }
          this.showModal = false;
        } catch (e) {
          this.formError = e.message || 'Save failed.';
        } finally {
          this.saving = false;
        }
      },

      async deleteDeadline(id) {
        if (!confirm('Delete this deadline?')) return;
        try {
          await PrepPalAPI.request(`/tracker/${id}`, { method: 'DELETE' });
          this.deadlines = this.deadlines.filter(d => d.id !== id);
          await this.refreshStats();
        } catch (e) {
          alert('Delete failed: ' + e.message);
        }
      },

      prevMonth() {
        if (this.calendarMonth === 0) { this.calendarMonth = 11; this.calendarYear--; }
        else this.calendarMonth--;
      },
      nextMonth() {
        if (this.calendarMonth === 11) { this.calendarMonth = 0; this.calendarYear++; }
        else this.calendarMonth++;
      },

      formatDate(str) {
        if (!str) return '';
        const [y, m, d] = str.split('-');
        return new Date(y, m - 1, d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
      },

      typeIcon(type) {
        return { Exam: '📝', Assignment: '📋', Quiz: '❓', Task: '✅' }[type] || '📌';
      },
    },

    // ── lifecycle ─────────────────────────────────────────────────────
    mounted() {
      this.fetchAll();
    },

    // ── template ──────────────────────────────────────────────────────
    template: `
      <!-- Topbar -->
      <div class="topbar">
        <div class="search-wrap">
          <span class="search-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" v-model="searchQuery" placeholder="Search exams, assignments, subjects…" />
        </div>
        <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
      </div>

      <!-- Header -->
      <div class="page-header" style="margin-bottom:24px;">
        <div class="greeting" style="margin-bottom:0">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <button class="btn-primary" style="width:auto;padding:10px 22px;white-space:nowrap;" @click="openCreate">
          + Add Deadline
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="stats-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:28px;">
        <div class="tracker-stat-card">
          <div class="tracker-stat-header">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Upcoming
          </div>
          <div class="tracker-stat-val">{{ stats.upcoming }}</div>
        </div>
        <div class="tracker-stat-card">
          <div class="tracker-stat-header">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            This Week
          </div>
          <div class="tracker-stat-val">{{ stats.this_week }}</div>
        </div>
        <div class="tracker-stat-card">
          <div class="tracker-stat-header">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Completed
          </div>
          <div class="tracker-stat-val">{{ stats.completed }}</div>
        </div>
        <div class="tracker-stat-card" style="border-color:#ffe5e1;">
          <div class="tracker-stat-header" style="color:#d92d20;">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            Overdue
          </div>
          <div class="tracker-stat-val" style="color:#d92d20;">{{ stats.overdue }}</div>
        </div>
      </div>

      <!-- Controls bar -->
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px;">
        <!-- Type filters -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button v-for="ft in ['all','Exam','Assignment','Quiz','Task']" :key="ft"
            class="filter-tab" :class="{ active: filterType === ft }"
            @click="filterType = ft"
            style="text-transform:capitalize;">
            {{ ft === 'all' ? 'All Types' : ft }}
          </button>
        </div>
        <!-- View toggle -->
        <div style="display:flex;gap:8px;margin-left:auto;">
          <button class="btn-sm" :class="{ primary: currentView==='list' }" @click="currentView='list'">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            List
          </button>
          <button class="btn-sm" :class="{ primary: currentView==='calendar' }" @click="currentView='calendar'">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Calendar
          </button>
          <button class="btn-sm" @click="fetchAll">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="card" style="text-align:center;color:var(--muted);padding:40px;">
        <div style="font-size:2rem;margin-bottom:8px;">⏳</div>
        Loading deadlines…
      </div>
      <div v-if="error && !loading" class="error-msg" style="margin-bottom:16px;">{{ error }}</div>

      <!-- ── LIST VIEW ────────────────────────────────────────────────── -->
      <div v-if="!loading && currentView === 'list'" class="tracker-list-card">
        <div class="tracker-list-title">Upcoming Deadlines ({{ upcomingDeadlines.length }})</div>

        <div v-if="filtered.length === 0" style="text-align:center;padding:48px;color:var(--muted);">
          <div style="font-size:3rem;margin-bottom:12px;">🎉</div>
          <div style="font-weight:700;font-family:'Sora',sans-serif;margin-bottom:6px;">
            {{ searchQuery ? 'No matching deadlines' : 'No deadlines yet!' }}
          </div>
          <div style="font-size:.88rem;margin-bottom:20px;">
            {{ searchQuery ? 'Try a different search.' : 'Add your first exam or assignment deadline.' }}
          </div>
          <button class="btn-primary" style="width:auto;padding:10px 24px;" @click="openCreate">+ Add Deadline</button>
        </div>

        <div v-if="filtered.length > 0 && upcomingDeadlines.length === 0" style="text-align:center;padding:24px;color:var(--muted);font-size:.9rem;">
          No upcoming deadlines. Completed items are below.
        </div>

        <div class="tracker-item" v-for="item in upcomingDeadlines" :key="item.id">
          <div class="tracker-item-left" :class="item.colorClass">
            <div style="display:flex;gap:12px;align-items:center;">
              <input type="checkbox" class="task-checkbox" :checked="item.completed"
                     @change="toggleComplete(item)" />
              <span style="font-size:1.1rem;">{{ typeIcon(item.exam_type) }}</span>
              <div class="tracker-item-title"
                   :style="item.completed ? 'text-decoration:line-through;color:var(--muted);' : ''">
                {{ item.title }}
              </div>
            </div>
            <div class="tracker-item-meta" style="padding-left:58px;display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;">
              <span>
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" style="vertical-align:middle;margin-right:3px;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatDate(item.deadline) }}
              </span>
              <span v-if="item.exam_time">
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" style="vertical-align:middle;margin-right:3px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ item.exam_time }}
              </span>
              <span v-if="item.subject"
                    style="background:var(--indigo-lt);color:var(--indigo);padding:1px 8px;border-radius:8px;font-size:.72rem;font-weight:600;">
                {{ item.subject }}
              </span>
              <span style="font-size:.72rem;font-weight:600;color:var(--muted);text-transform:capitalize;">
                {{ item.exam_type }} · {{ item.priority }} priority
              </span>
            </div>
            <div class="tracker-item-actions" style="padding-left:58px;margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn-pill-primary" @click="openEdit(item)">Edit</button>
              <button class="btn-pill" @click="deleteDeadline(item.id)" style="color:var(--rose);">Delete</button>
              <button class="btn-pill" v-if="!item.completed" @click="toggleComplete(item)">Mark Done</button>
            </div>
          </div>
          <div class="time-badge" :class="item.cls || 'badge-blue'">{{ item.text }}</div>
        </div>

        <div v-if="doneDeadlines.length" class="tracker-list-title" style="margin-top:24px;border-top:1px solid var(--border);padding-top:20px;">
          Done ({{ doneDeadlines.length }})
        </div>

        <div class="tracker-item" v-for="item in doneDeadlines" :key="'done-' + item.id" style="opacity:.68;">
          <div class="tracker-item-left" :class="item.colorClass">
            <div style="display:flex;gap:12px;align-items:center;">
              <input type="checkbox" class="task-checkbox" :checked="item.completed"
                     @change="toggleComplete(item)" />
              <span style="font-size:1.1rem;">{{ typeIcon(item.exam_type) }}</span>
              <div class="tracker-item-title" style="text-decoration:line-through;color:var(--muted);">
                {{ item.title }}
              </div>
            </div>
            <div class="tracker-item-meta" style="padding-left:58px;display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;">
              <span>{{ formatDate(item.deadline) }}</span>
              <span v-if="item.exam_time">{{ item.exam_time }}</span>
              <span v-if="item.subject"
                    style="background:var(--indigo-lt);color:var(--indigo);padding:1px 8px;border-radius:8px;font-size:.72rem;font-weight:600;">
                {{ item.subject }}
              </span>
              <span style="font-size:.72rem;font-weight:600;color:var(--muted);text-transform:capitalize;">
                {{ item.exam_type }} Â· {{ item.priority }} priority
              </span>
            </div>
            <div class="tracker-item-actions" style="padding-left:58px;margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn-pill-primary" @click="openEdit(item)">âœï¸ Edit</button>
              <button class="btn-pill" @click="deleteDeadline(item.id)" style="color:var(--rose);">ðŸ—‘ï¸ Delete</button>
              <button class="btn-pill" @click="toggleComplete(item)">Move to Upcoming</button>
            </div>
          </div>
          <div class="time-badge badge-green">Done</div>
        </div>
      </div>

      <!-- ── CALENDAR VIEW ─────────────────────────────────────────── -->
      <div v-if="!loading && currentView === 'calendar'" class="card" style="padding:24px;">
        <!-- Month navigation -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <button class="btn-sm" @click="prevMonth">←</button>
          <span style="font-family:'Sora',sans-serif;font-weight:700;font-size:1.1rem;">{{ calendarMonthName }}</span>
          <button class="btn-sm" @click="nextMonth">→</button>
        </div>

        <!-- Day-of-week headers -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">
          <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d"
               style="text-align:center;font-size:.72rem;font-weight:700;color:var(--muted);padding:4px 0;">
            {{ d }}
          </div>
        </div>

        <!-- Calendar cells -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
          <div v-for="(cell, idx) in calendarDays" :key="idx"
               :style="cell ? 'min-height:80px;padding:6px;border-radius:10px;border:1.5px solid var(--border);position:relative;background:' + (cell.items.length ? 'var(--indigo-lt)' : 'var(--surface)') : 'min-height:80px;'"
               :class="cell && isToday(cell.date) ? 'calendar-today' : ''">
            <div v-if="cell" style="font-size:.78rem;font-weight:700;color:var(--text);margin-bottom:4px;"
                 :style="isToday(cell.date) ? 'color:var(--indigo);' : ''">
              {{ cell.day }}
            </div>
            <div v-if="cell" v-for="item in cell.items" :key="item.id"
                 style="font-size:.65rem;background:var(--indigo);color:#fff;border-radius:4px;padding:2px 5px;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;"
                 :style="item.completed ? 'opacity:.5;' : ''"
                 @click="openEdit(item)"
                 :title="item.title">
              {{ typeIcon(item.exam_type) }} {{ item.title }}
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
          <span style="font-size:.78rem;color:var(--muted);">Click any item to edit  ·  </span>
          <span v-for="[type, icon] in [['Exam','📝'],['Assignment','📋'],['Quiz','❓'],['Task','✅']]" :key="type"
                style="font-size:.78rem;color:var(--muted);">{{ icon }} {{ type }}</span>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingId ? 'Edit Deadline' : 'Add New Deadline' }}</h3>
            <button class="btn-sm" @click="showModal=false">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="error-msg" style="margin-bottom:12px;">{{ formError }}</div>

            <div class="form-field">
              <label>Title <span style="color:var(--rose)">*</span></label>
              <input v-model="form.title" placeholder="e.g. Biology Final Exam" />
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Type</label>
                <select v-model="form.exam_type">
                  <option>Exam</option>
                  <option>Assignment</option>
                  <option>Quiz</option>
                  <option>Task</option>
                </select>
              </div>
              <div class="form-field">
                <label>Subject</label>
                <input v-model="form.subject" placeholder="e.g. Biology" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Date <span style="color:var(--rose)">*</span></label>
                <input type="date" v-model="form.deadline" />
              </div>
              <div class="form-field">
                <label>Time (optional)</label>
                <input type="time" v-model="form.exam_time" />
              </div>
            </div>

            <div class="form-field">
              <label>Priority</label>
              <select v-model="form.priority">
                <option value="high">High — Urgent</option>
                <option value="medium">Medium — Standard</option>
                <option value="low">Low — Flexible</option>
              </select>
            </div>

            <div class="modal-footer">
              <button class="btn-sm" @click="showModal=false">Cancel</button>
              <button class="btn-sm primary" @click="saveDeadline" :disabled="saving">
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Add Deadline') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  });
});
