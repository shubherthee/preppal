// js/pages/announcements.js
// Admin Announcements Vue Page Script

PrepPalCore.mountApp({
  data() {
    return {
      announcements: [],
      loading: false,
      error: '',
      
      // Form State
      showAddModal: false,
      addForm: {
        title: '',
        message: '',
        type: 'info',
        expires_at: ''
      },
      addError: '',
      addLoading: false
    };
  },
  methods: {
    async fetchAnnouncements() {
      this.loading = true;
      this.error = '';
      try {
        this.announcements = await PrepPalAPI.getAnnouncements();
      } catch (err) {
        this.error = err.message || 'Failed to load announcements list.';
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.addError = '';
      this.addForm = {
        title: '',
        message: '',
        type: 'info',
        expires_at: ''
      };
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    async broadcastAnnouncement() {
      this.addError = '';
      if (!this.addForm.title.trim() || !this.addForm.message.trim()) {
        this.addError = 'Title and message are required.';
        return;
      }
      this.addLoading = true;
      try {
        const payload = {
          title: this.addForm.title.trim(),
          message: this.addForm.message.trim(),
          type: this.addForm.type,
          expires_at: this.addForm.expires_at || null
        };
        const res = await PrepPalAPI.createAnnouncement(payload);
        if (res && res.status === 'success') {
          this.closeAddModal();
          await this.fetchAnnouncements();
        } else {
          this.addError = 'Failed to broadcast announcement.';
        }
      } catch (err) {
        this.addError = err.message || 'Error occurred while creating announcement.';
      } finally {
        this.addLoading = false;
      }
    },
    async removeAnnouncement(id) {
      if (!confirm('Are you sure you want to delete this announcement? It will be removed from all student dashboards immediately.')) return;
      try {
        await PrepPalAPI.deleteAnnouncement(id);
        this.announcements = this.announcements.filter(a => a.id !== id);
      } catch (err) {
        alert('Failed to delete announcement: ' + err.message);
      }
    },
    getTypeBadgeStyle(type) {
      if (type === 'danger') return { background: 'var(--rose-lt)', color: 'var(--rose)' };
      if (type === 'warning') return { background: '#fff4e6', color: '#b25f11' };
      if (type === 'success') return { background: '#edfcf7', color: '#1d9e75' };
      return { background: 'var(--indigo-lt)', color: 'var(--indigo)' };
    },
    formatDate(dateStr) {
      if (!dateStr) return 'No Expiry';
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  },
  mounted() {
    this.fetchAnnouncements();
  },
  template: `
    <div class="greeting">
      <h1>Announcements</h1>
      <p>Configure, edit, and publish platform alerts to all dashboards.</p>
    </div>

    <!-- Toolbar card -->
    <div class="card" style="padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
      <div style="color: var(--muted); font-size: 0.88rem; font-weight: 500;">
        Total Active Broadcasts: {{ announcements.length }}
      </div>
      <button class="btn-primary" @click="openAddModal" style="width: auto; padding: 10px 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; height: 40px; margin: 0; color: white;">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Create Announcement
      </button>
    </div>

    <!-- Active announcements list -->
    <div v-if="loading" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
      <span style="display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px; font-size: 1.5rem;"></span> Loading announcements...
    </div>
    <div v-else-if="error" style="padding: 40px; text-align: center; color: var(--rose); font-weight: 500;">
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>️ {{ error }}
    </div>
    <div v-else-if="announcements.length === 0" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
      No current announcements. Create one to display alerts.
    </div>
    
    <div v-else style="display: flex; flex-direction: column; gap: 16px;">
      <div v-for="ann in announcements" :key="ann.id" class="card" style="padding: 20px; position: relative; border-left: 5px solid;" :style="{ 'border-left-color': getTypeBadgeStyle(ann.type).color }">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <h3 style="font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text); margin: 0;">{{ ann.title }}</h3>
            <span style="font-size: 0.74rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-top: 4px;"
                  :style="getTypeBadgeStyle(ann.type)">
              {{ ann.type }}
            </span>
          </div>
          <button class="btn-primary" @click="removeAnnouncement(ann.id)" style="padding: 6px 12px; font-size: 0.8rem; width: auto; font-weight: 600; background: var(--rose); border-color: var(--rose); color: white; display: inline-flex; align-items: center; gap: 4px; height: 32px; border-radius: 4px;">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>️ Delete
          </button>
        </div>
        <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 12px;">{{ ann.message }}</p>
        <div style="display: flex; gap: 20px; font-size: 0.78rem; color: var(--muted); border-top: 1px solid var(--border); padding-top: 8px;">
          <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>️ Author: {{ ann.author_name }}</span>
          <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Starts: {{ formatDate(ann.starts_at) }}</span>
          <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Expires: {{ formatDate(ann.expires_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Add Announcement Modal -->
    <div v-if="showAddModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:2000;">
      <div style="background:var(--bg); border:1.5px solid var(--border); border-radius:var(--radius-md); width:92%; max-width:460px; padding:24px; box-shadow:var(--shadow-lg); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--text); margin: 0;">Create Announcement</h3>
          <button @click="closeAddModal" style="background: none; border: none; font-size: 1.5rem; color: var(--muted); cursor: pointer; padding: 0; line-height: 1;">&times;</button>
        </div>

        <div v-if="addError" class="error-msg" style="margin-bottom: 16px; background: #fff1f0; border: 1px solid #ffa39e; color: #f5222d; padding: 8px 12px; border-radius: 4px; font-size: 0.88rem;">{{ addError }}</div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Title</label>
          <input type="text" v-model="addForm.title" placeholder="e.g. Server Maintenance Scheduled" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" required />
        </div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Message Body</label>
          <textarea v-model="addForm.message" placeholder="Provide details about the update..." rows="4" style="width:100%; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg); resize:vertical;" required></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div class="field" style="margin-bottom: 0;">
            <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Alert Category</label>
            <select v-model="addForm.type" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);">
              <option value="info">info (blue)</option>
              <option value="success">success (green)</option>
              <option value="warning">warning (orange)</option>
              <option value="danger">danger (red)</option>
            </select>
          </div>
          <div class="field" style="margin-bottom: 0;">
            <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Expiry Date (Optional)</label>
            <input type="datetime-local" v-model="addForm.expires_at" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 10px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" />
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 16px;">
          <button class="btn-secondary" style="width: auto; padding: 10px 18px; height: 38px; font-size: 0.88rem;" @click="closeAddModal" :disabled="addLoading">Cancel</button>
          <button class="btn-primary" style="width: auto; padding: 10px 18px; height: 38px; font-size: 0.88rem; color: white;" @click="broadcastAnnouncement" :disabled="addLoading">
            {{ addLoading ? 'Broadcasting...' : 'Publish Alert' }}
          </button>
        </div>
      </div>
    </div>
  `
});
