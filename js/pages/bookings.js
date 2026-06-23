// js/pages/bookings.js
// Admin Bookings & Payments Vue Page Script

PrepPalCore.mountApp({
  data() {
    return {
      bookings: [],
      loading: false,
      error: '',
      searchQuery: '',
      cancellingId: null
    };
  },
  computed: {
    totalBilling() {
      return this.bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.totalCost : sum, 0);
    },
    platformShare() {
      return this.totalBilling * 0.1; // 10% commission fee
    },
    tutorPayouts() {
      return this.totalBilling * 0.9; // 90% payout
    },
    filteredBookings() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.bookings;
      return this.bookings.filter(b => 
        (b.studentName && b.studentName.toLowerCase().includes(query)) ||
        (b.tutor.name && b.tutor.name.toLowerCase().includes(query)) ||
        (b.date && b.date.includes(query))
      );
    }
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      this.error = '';
      try {
        this.bookings = await PrepPalAPI.getAdminBookings();
      } catch (err) {
        this.error = err.message || 'Failed to load bookings list.';
      } finally {
        this.loading = false;
      }
    },
    async cancelSession(bookingId) {
      if (!confirm('Are you sure you want to cancel this study booking? This will remove it from the schedule.')) return;
      this.cancellingId = bookingId;
      try {
        await PrepPalAPI.deleteAdminBooking(bookingId);
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
      } catch (err) {
        alert('Failed to cancel session: ' + err.message);
      } finally {
        this.cancellingId = null;
      }
    }
  },
  mounted() {
    this.fetchBookings();
  },
  template: `
    <div class="greeting">
      <h1>Bookings & Payments</h1>
      <p>Audit financial revenue, check study slots, and cancel appointments.</p>
    </div>

    <!-- Financial stats cards row -->
    <div class="stats-row" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #eef7ff; color: #1c5db6;">💰</div>
          <span class="stat-badge" style="background: #eef7ff; color: #1c5db6;">Total Billing</span>
        </div>
        <div class="stat-val" style="margin-top: 10px;">RM{{ totalBilling.toFixed(2) }}</div>
        <div class="stat-label">Gross Platform Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #edf7f0; color: #1f7a4c;">💼</div>
          <span class="stat-badge" style="background: #edf7f0; color: #1f7a4c;">Commission (10%)</span>
        </div>
        <div class="stat-val" style="margin-top: 10px;">RM{{ platformShare.toFixed(2) }}</div>
        <div class="stat-label">PrepPal Earnings</div>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background: #fff4e6; color: #b25f11;">🧑‍🏫</div>
          <span class="stat-badge" style="background: #fff4e6; color: #b25f11;">Tutor Net Payouts</span>
        </div>
        <div class="stat-val" style="margin-top: 10px;">RM{{ tutorPayouts.toFixed(2) }}</div>
        <div class="stat-label">90% Tutor Earnings</div>
      </div>
    </div>

    <!-- Search bar card -->
    <div class="card" style="padding: 16px; margin-bottom: 20px; display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
      <div class="search-wrap" style="flex: 1; max-width: 400px; margin-bottom: 0;">
        <span class="search-icon">🔍</span>
        <input type="text" v-model="searchQuery" placeholder="Search by student, tutor, or date..." style="width: 100%; border: none; outline: none; background: transparent; padding-left: 8px; font-family: inherit;" />
      </div>
      <div style="color: var(--muted); font-size: 0.88rem; font-weight: 500;">
        Showing {{ filteredBookings.length }} bookings
      </div>
    </div>

    <!-- Bookings Table card -->
    <div class="card" style="padding: 0; overflow-x: auto;">
      <div v-if="loading" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
        <span style="display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px; font-size: 1.5rem;">⏳</span> Loading bookings...
      </div>
      <div v-else-if="error" style="padding: 40px; text-align: center; color: var(--rose); font-weight: 500;">
        ⚠️ {{ error }}
      </div>
      <div v-else-if="filteredBookings.length === 0" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
        No bookings found.
      </div>
      <table v-else class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; min-width: 750px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); background: var(--indigo-lt);">
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; border-top-left-radius: var(--radius-sm);">Student</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Tutor</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Schedule</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Duration</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Total Charged</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Status</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; text-align: right; border-top-right-radius: var(--radius-sm);">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filteredBookings" :key="b.id" style="border-bottom: 1px solid var(--border); vertical-align: middle;">
            <td style="padding: 14px 20px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="avatar" style="width: 32px; height: 32px; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; background: linear-gradient(135deg, var(--indigo), var(--mint)); display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%;">
                  {{ b.studentInitials || 'AC' }}
                </div>
                <div style="font-weight: 600; color: var(--text);">{{ b.studentName }}</div>
              </div>
            </td>
            <td style="padding: 14px 20px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img :src="'../../' + b.tutor.avatar" class="admin-tutor-mini-img" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
                <div style="font-weight: 500; color: var(--text);">{{ b.tutor.name }}</div>
              </div>
            </td>
            <td style="padding: 14px 20px;">
              <div style="font-weight: 500; color: var(--text);">📅 {{ b.date }}</div>
              <div style="font-size: 0.78rem; color: var(--muted);">⏰ {{ b.time }}</div>
            </td>
            <td style="padding: 14px 20px; color: var(--text);">{{ b.duration }} hr(s)</td>
            <td style="padding: 14px 20px; font-weight: 600; color: var(--text);">RM{{ b.totalCost.toFixed(2) }}</td>
            <td style="padding: 14px 20px;">
              <span class="session-status-badge" style="background-color: #edfcf7; color: #1d9e75; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                {{ b.status }}
              </span>
            </td>
            <td style="padding: 14px 20px; text-align: right;">
              <button class="btn-primary" @click="cancelSession(b.id)" :disabled="cancellingId === b.id" style="padding: 6px 12px; font-size: 0.8rem; width: auto; font-weight: 600; background: var(--rose); border-color: var(--rose); color: white; display: inline-flex; align-items: center; gap: 4px; height: 32px; border-radius: 4px;">
                ✕ Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
});
