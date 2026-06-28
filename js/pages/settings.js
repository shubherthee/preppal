// js/pages/settings.js
// Admin System Settings Vue Page Script

PrepPalCore.mountApp({
  data() {
    return {
      settings: {
        platformName: 'PrepPal',
        commissionRate: 10,
        maxDuration: 4,
        aiModel: 'gemini-2.5-pro',
        systemPrompt: 'You are PrepPal AI, a helpful study assistant. Answer questions clearly and concisely, focusing on providing hints first instead of direct answers to help students learn.'
      },
      auditLogs: [
        { id: 1, action: 'Updated commission fee rate to 10%', timestamp: 'June 23, 2026 10:45 AM', user: 'Admin' },
        { id: 2, action: 'Added Mr. David Kross as Tutor', timestamp: 'June 23, 2026 09:30 AM', user: 'Admin' },
        { id: 3, action: 'System Backup Complete', timestamp: 'June 23, 2026 03:00 AM', user: 'System Cron' },
        { id: 4, action: 'Created Welcome Announcement alert', timestamp: 'June 22, 2026 04:12 PM', user: 'Admin' }
      ],
      saving: false,
      successMsg: ''
    };
  },
  methods: {
    loadSettings() {
      const stored = localStorage.getItem('preppal_system_settings');
      if (stored) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(stored) };
        } catch (e) {
          console.error(e);
        }
      }
    },
    saveSettings() {
      this.saving = true;
      this.successMsg = '';
      setTimeout(() => {
        localStorage.setItem('preppal_system_settings', JSON.stringify(this.settings));
        this.auditLogs.unshift({
          id: Date.now(),
          action: 'Updated system parameters and settings.',
          timestamp: new Date().toLocaleString(),
          user: this.userName || 'Admin'
        });
        this.saving = false;
        this.successMsg = 'Settings saved successfully!';
        setTimeout(() => { this.successMsg = ''; }, 3000);
      }, 800);
    }
  },
  mounted() {
    this.loadSettings();
  },
  template: `
    <div class="greeting">
      <h1>System Settings</h1>
      <p>Configure platform characteristics, billing regulations, and AI parameters.</p>
    </div>

    <!-- Alert success banner -->
    <div v-if="successMsg" class="success-banner" style="margin-bottom: 20px; padding: 12px 16px; background-color: #edfcf7; border-left: 4px solid #1d9e75; color: #0f5c42; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span></span>
        <span>{{ successMsg }}</span>
      </div>
      <button @click="successMsg = ''" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #0f5c42; line-height: 1; padding: 0 4px;">&times;</button>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start;">
      
      <!-- Configurations form card -->
      <div class="card" style="padding: 24px;">
        <div class="section-title" style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>⚙️</span> Global Config Settings
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div class="field" style="margin-bottom: 0;">
            <label>Platform Name</label>
            <input type="text" v-model="settings.platformName" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" />
          </div>
          <div class="field" style="margin-bottom: 0;">
            <label>Tutor Booking Commission (%)</label>
            <input type="number" v-model.number="settings.commissionRate" min="0" max="100" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div class="field" style="margin-bottom: 0;">
            <label>Max Session Duration (Hours)</label>
            <select v-model="settings.maxDuration" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);">
              <option :value="1">1 Hour</option>
              <option :value="2">2 Hours</option>
              <option :value="3">3 Hours</option>
              <option :value="4">4 Hours</option>
              <option :value="6">6 Hours</option>
            </select>
          </div>
          <div class="field" style="margin-bottom: 0;">
            <label>Default AI Model</label>
            <select v-model="settings.aiModel" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);">
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Recommended)</option>
              <option value="custom-tuned-preppal">PrepPal Custom LLM</option>
            </select>
          </div>
        </div>

        <div class="field" style="margin-bottom: 24px;">
          <label>AI Assistant Default System Instruction</label>
          <textarea v-model="settings.systemPrompt" rows="4" style="width:100%; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg); resize:vertical; line-height: 1.5;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 20px;">
          <button class="btn-primary" style="width: auto; padding: 12px 24px;" @click="saveSettings" :disabled="saving">
            {{ saving ? 'Saving Changes...' : 'Save Configuration' }}
          </button>
        </div>
      </div>

      <!-- Audit Logs Column -->
      <div class="card" style="padding: 24px; height: fit-content;">
        <div class="section-title" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></span> System Audit Log
        </div>
        <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.4;">
          Security log details showing administrative actions executed in the PrepPal platform.
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div v-for="log in auditLogs" :key="log.id" style="border-bottom: 1px dashed var(--border); padding-bottom: 10px;">
            <div style="font-weight: 600; color: var(--text); font-size: 0.9rem; margin-bottom: 4px;">{{ log.action }}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--muted);">
              <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {{ log.timestamp }}</span>
              <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> User: {{ log.user }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});
