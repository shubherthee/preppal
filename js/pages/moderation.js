// js/pages/moderation.js
// Admin Content Moderation Vue Page Script

PrepPalCore.mountApp({
  data() {
    return {
      reports: [],
      loading: false,
      error: '',
      filterStatus: 'pending',
      actionLoadingId: null
    };
  },
  computed: {
    filteredReports() {
      return this.reports.filter(r => r.status === this.filterStatus);
    }
  },
  methods: {
    async fetchReports() {
      this.loading = true;
      this.error = '';
      try {
        this.reports = await PrepPalAPI.getFlaggedContent();
      } catch (err) {
        this.error = err.message || 'Failed to load reports.';
      } finally {
        this.loading = false;
      }
    },
    async dismissReport(reportId) {
      if (!confirm('Are you sure you want to dismiss this flag?')) return;
      this.actionLoadingId = reportId;
      try {
        await PrepPalAPI.updateFlaggedStatus(reportId, 'dismissed');
        const idx = this.reports.findIndex(r => r.id === reportId);
        if (idx !== -1) this.reports[idx].status = 'dismissed';
      } catch (err) {
        alert('Failed to dismiss report: ' + err.message);
      } finally {
        this.actionLoadingId = null;
      }
    },
    async deleteContent(reportId) {
      if (!confirm('WARNING: This will permanently delete the flagged quiz or deck from the system. This action cannot be undone. Proceed?')) return;
      this.actionLoadingId = reportId;
      try {
        await PrepPalAPI.deleteFlaggedContent(reportId);
        const idx = this.reports.findIndex(r => r.id === reportId);
        if (idx !== -1) this.reports[idx].status = 'deleted';
        alert('Flagged content deleted successfully.');
      } catch (err) {
        alert('Failed to delete content: ' + err.message);
      } finally {
        this.actionLoadingId = null;
      }
    },
    getBadgeClass(type) {
      if (type === 'quiz') return 'badge-hard';
      if (type === 'deck') return 'badge-medium';
      return 'badge-easy';
    }
  },
  mounted() {
    this.fetchReports();
  },
  template: `
    <div class="greeting">
      <h1>Content Moderation</h1>
      <p>Manage and take action on content flagged by the PrepPal community.</p>
    </div>

    <!-- Status Tabs -->
    <div class="tabs" style="margin-bottom: 20px;">
      <div class="tab" :class="{ active: filterStatus === 'pending' }" @click="filterStatus = 'pending'">Pending Reports</div>
      <div class="tab" :class="{ active: filterStatus === 'dismissed' }" @click="filterStatus = 'dismissed'">Dismissed</div>
      <div class="tab" :class="{ active: filterStatus === 'deleted' }" @click="filterStatus = 'deleted'">Removed Content</div>
    </div>

    <!-- Content Table card -->
    <div class="card" style="padding: 0; overflow-x: auto;">
      <div v-if="loading" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
        <span style="display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px; font-size: 1.5rem;"></span> Loading reports...
      </div>
      <div v-else-if="error" style="padding: 40px; text-align: center; color: var(--rose); font-weight: 500;">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>️ {{ error }}
      </div>
      <div v-else-if="filteredReports.length === 0" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
        No reports found in this section.
      </div>
      <table v-else class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; min-width: 700px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); background: var(--indigo-lt);">
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; border-top-left-radius: var(--radius-sm);">Reported Content</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Type</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Flag Reason</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Reported By</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; text-align: right; border-top-right-radius: var(--radius-sm);">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in filteredReports" :key="report.id" style="border-bottom: 1px solid var(--border); vertical-align: middle;">
            <td style="padding: 14px 20px;">
              <div style="font-weight: 600; color: var(--text);">{{ report.contentTitle }}</div>
              <div style="font-size: 0.78rem; color: var(--muted);">ID: {{ report.contentId }}</div>
            </td>
            <td style="padding: 14px 20px;">
              <span class="badge" :class="getBadgeClass(report.contentType)">
                {{ report.contentType }}
              </span>
            </td>
            <td style="padding: 14px 20px; color: var(--text); font-size: 0.9rem;">
              {{ report.reason }}
            </td>
            <td style="padding: 14px 20px; color: var(--muted); font-size: 0.9rem;">
              {{ report.reporterName }}
            </td>
            <td style="padding: 14px 20px; text-align: right;">
              <div v-if="report.status === 'pending'" style="display: inline-flex; gap: 8px;">
                <button class="btn-secondary" @click="dismissReport(report.id)" :disabled="actionLoadingId === report.id" style="padding: 6px 12px; font-size: 0.8rem; width: auto; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; height: 32px; height: 32px; border-radius: 4px; border: 1.5px solid var(--border); background: var(--surface);">
                  ✓ Dismiss
                </button>
                <button class="btn-primary" @click="deleteContent(report.id)" :disabled="actionLoadingId === report.id" style="padding: 6px 12px; font-size: 0.8rem; width: auto; font-weight: 600; background: var(--rose); border-color: var(--rose); color: white; display: inline-flex; align-items: center; gap: 4px; height: 32px; border-radius: 4px;">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>️ Delete Content
                </button>
              </div>
              <div v-else style="color: var(--muted); font-size: 0.85rem; font-style: italic;">
                Resolved ({{ report.status }})
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
});
