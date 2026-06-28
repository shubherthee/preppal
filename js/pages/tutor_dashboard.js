// js/pages/tutor_dashboard.js
// Tutor Dashboard Vue Page Script

PrepPalCore.mountApp({
  data() {
    return {
      stats: {
        rate: 30.00,
        status: 'available',
        rating: 5.00,
        reviewsCount: 0,
        earnings: {
          gross: 0.00,
          net: 0.00
        },
        totalHours: 0,
        uniqueStudents: 0,
        totalBookings: 0,
        availability: null
      },
      showRateModal: false,
      newRate: 30,
      rateLoading: false,
      rateError: '',

      showScheduleModal: false,
      scheduleLoading: false,
      scheduleError: '',
      scheduleDays: [],
      scheduleStartTime: '09:00',
      scheduleEndTime: '17:00',

      showUploadModal: false,
      uploadLoading: false,
      uploadError: '',
      activeStudents: [],
      uploadForm: {
        studentId: '',
        description: '',
        subject: '',
        topic: ''
      },
      selectedFile: null,

      bookings: [],
      loading: true,
      error: ''
    };
  },
  computed: {
    upcomingBookings() {
      // Filter out cancelled ones, and sort by date/time
      return this.bookings
        .filter(b => b.status !== 'cancelled')
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    }
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      this.error = '';
      try {
        const [statsData, bookingsData] = await Promise.all([
          PrepPalAPI.getTutorDashboard(),
          PrepPalAPI.getTutorBookings()
        ]);
        this.stats = statsData;
        this.bookings = bookingsData;
      } catch (err) {
        this.error = err.message || 'Failed to fetch tutor data.';
      } finally {
        this.loading = false;
      }
    },
    async toggleStatus() {
      const newStatus = this.stats.status === 'available' ? 'busy' : 'available';
      try {
        await PrepPalAPI.updateTutorStatus(newStatus);
        this.stats.status = newStatus;
      } catch (err) {
        alert('Failed to update status: ' + err.message);
      }
    },

    // Rate modification
    openRateModal() {
      this.newRate = this.stats.rate || 30;
      this.rateError = '';
      this.showRateModal = true;
    },
    async saveRate() {
      this.rateError = '';
      this.rateLoading = true;
      try {
        await PrepPalAPI.updateTutorRate(this.newRate);
        this.stats.rate = this.newRate;
        this.showRateModal = false;
      } catch (err) {
        this.rateError = err.message || 'Failed to update hourly rate.';
      } finally {
        this.rateLoading = false;
      }
    },

    // Schedule configuration
    openScheduleModal() {
      this.scheduleError = '';
      const avail = this.stats.availability || { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], start: '09:00', end: '17:00' };
      this.scheduleDays = [...(avail.days || [])];
      this.scheduleStartTime = avail.start || '09:00';
      this.scheduleEndTime = avail.end || '17:00';
      this.showScheduleModal = true;
    },
    async saveSchedule() {
      this.scheduleError = '';
      if (this.scheduleDays.length === 0) {
        this.scheduleError = 'Please select at least one day.';
        return;
      }
      this.scheduleLoading = true;
      try {
        const availability = {
          days: this.scheduleDays,
          start: this.scheduleStartTime,
          end: this.scheduleEndTime
        };
        await PrepPalAPI.updateTutorAvailability(availability);
        this.stats.availability = availability;
        this.showScheduleModal = false;
      } catch (err) {
        this.scheduleError = err.message || 'Failed to update availability schedule.';
      } finally {
        this.scheduleLoading = false;
      }
    },

    // Resource upload
    async openUploadModal() {
      this.uploadError = '';
      this.uploadForm = { studentId: '', description: '', subject: '', topic: '' };
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.uploadLoading = true;
      try {
        this.activeStudents = await PrepPalAPI.getTutorStudents();
        this.showUploadModal = true;
      } catch (err) {
        alert('Failed to load students: ' + err.message);
      } finally {
        this.uploadLoading = false;
      }
    },
    handleFileChange(e) {
      this.selectedFile = e.target.files[0] || null;
    },
    async uploadMaterial() {
      this.uploadError = '';
      if (!this.uploadForm.studentId) {
        this.uploadError = 'Please select a student.';
        return;
      }
      if (!this.selectedFile) {
        this.uploadError = 'Please select a file to upload.';
        return;
      }
      this.uploadLoading = true;
      try {
        const formData = new FormData();
        formData.append('files', this.selectedFile);
        formData.append('student_id', this.uploadForm.studentId);
        formData.append('description', this.uploadForm.description || '');
        formData.append('subject', this.uploadForm.subject || '');
        formData.append('topic', this.uploadForm.topic || '');

        const token = localStorage.getItem('preppal_token');
        const BASE_URL = window.PREPPAL_API_BASE || 'http://localhost:4000/api';

        const res = await fetch(BASE_URL + '/content/upload', {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Upload failed');
        }

        alert('Material uploaded and shared successfully!');
        this.showUploadModal = false;
      } catch (err) {
        this.uploadError = err.message || 'Failed to upload material.';
      } finally {
        this.uploadLoading = false;
      }
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  template: `
    <!-- Top search + Profile bar -->
    <div class="topbar">
      <div class="search-wrap">
        <span class="search-icon"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
        <input type="text" placeholder="Search lessons, students, schedules..." />
      </div>
      <div class="notif-btn"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path></svg><span class="notif-dot"></span></div>
      <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
    </div>

    <!-- Greetings & Status Toggle -->
    <div class="greeting" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 28px;">
      <div>
        <h1 style="font-family: 'Sora', sans-serif !important; font-weight: 700 !important; color: #2e265c !important; letter-spacing: -0.7px; font-size: 2.2rem; margin: 0;">Welcome, {{ userName }}! </h1>
        <p style="font-family: 'DM Sans', sans-serif !important; color: #7b7597 !important; font-size: 0.9rem; margin-top: 4px;">{{ pageSubtitle }}</p>
      </div>

      <!-- Quick status switcher -->
      <div class="card" style="padding: 10px 18px; display: flex; align-items: center; gap: 12px; border-radius: 16px; box-shadow: 0 8px 30px rgba(124, 58, 237, 0.03); margin-bottom: 0; border: 1.5px solid var(--border);">
        <span style="font-size: 0.88rem; font-weight: 600; color: var(--text);">Status:</span>
        <span :style="{ background: stats.status === 'available' ? '#edfcf7' : '#fff0f0', color: stats.status === 'available' ? '#1d9e75' : '#e14f4f' }" 
              style="font-size: 0.76rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.03em; display: inline-flex; align-items: center; gap: 5px;">
          <span :style="{ background: stats.status === 'available' ? '#1d9e75' : '#e14f4f' }" style="width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
          {{ stats.status === 'available' ? 'Available' : 'Busy' }}
        </span>
        <button class="btn-sm" @click="toggleStatus" style="width: auto; padding: 6px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 8px; margin: 0; background: var(--bg); border: 1px solid var(--border); font-family: inherit; transition: all 0.2s;">
          Change Status
        </button>
      </div>
    </div>

    <div v-if="loading" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
      Loading dashboard...
    </div>
    <div v-else-if="error" class="error-msg" style="margin-bottom: 24px;">
      Error: {{ error }}
    </div>

    <div v-else>
      <div class="stats-row" style="margin-bottom: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
        <div class="stat-card" style="background: #edf7f0; border: 1px solid rgba(170, 227, 215, 0.4); padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 30px rgba(124, 58, 237, 0.02); transition: all 0.3s ease;">
          <div style="background: #ffffff; color: #1f7a4c; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.04); font-size: 1rem; font-weight: bold;">RM</div>
          <div style="flex-grow: 1;">
            <div style="font-size: 1.8rem; font-weight: 700; color: #1f7a4c; font-family: 'Sora', sans-serif; line-height: 1.1;">RM{{ stats.earnings.net.toFixed(2) }}</div>
            <div style="font-size: 0.8rem; color: #1f7a4c; opacity: 0.8; margin-top: 2px; font-weight: 600;">Net Balance (90%)</div>
          </div>
        </div>

        <div class="stat-card" style="background: #f4f0ff; border: 1px solid rgba(216, 200, 255, 0.4); padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 30px rgba(124, 58, 237, 0.02); transition: all 0.3s ease;">
          <div style="background: #ffffff; color: #4f3b8c; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.04); font-size: 1rem; font-weight: bold;">Hr</div>
          <div style="flex-grow: 1;">
            <div style="font-size: 1.8rem; font-weight: 700; color: #4f3b8c; font-family: 'Sora', sans-serif; line-height: 1.1;">{{ stats.totalHours }}h</div>
            <div style="font-size: 0.8rem; color: #4f3b8c; opacity: 0.8; margin-top: 2px; font-weight: 600;">Hours Taught</div>
          </div>
        </div>

        <div class="stat-card" style="background: #fff4e6; border: 1px solid rgba(254, 215, 170, 0.4); padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 30px rgba(124, 58, 237, 0.02); transition: all 0.3s ease;">
          <div style="background: #ffffff; color: #b25f11; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.04); font-size: 1rem; font-weight: bold;">St</div>
          <div style="flex-grow: 1;">
            <div style="font-size: 1.8rem; font-weight: 700; color: #b25f11; font-family: 'Sora', sans-serif; line-height: 1.1;">{{ stats.uniqueStudents }}</div>
            <div style="font-size: 0.8rem; color: #b25f11; opacity: 0.8; margin-top: 2px; font-weight: 600;">Unique Students</div>
          </div>
        </div>

        <div class="stat-card" style="background: #fffdf0; border: 1px solid rgba(254, 240, 138, 0.4); padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 30px rgba(124, 58, 237, 0.02); transition: all 0.3s ease;">
          <div style="background: #ffffff; color: #854d0e; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.04); font-size: 1.25rem;">★</div>
          <div style="flex-grow: 1;">
            <div style="font-size: 1.8rem; font-weight: 700; color: #854d0e; font-family: 'Sora', sans-serif; line-height: 1.1;">{{ stats.rating.toFixed(1) }}</div>
            <div style="font-size: 0.8rem; color: #854d0e; opacity: 0.8; margin-top: 2px; font-weight: 600;">Rating ({{ stats.reviewsCount }} reviews)</div>
          </div>
        </div>
      </div>

      <!-- Quick Action + Timeline Row -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start; margin-top: 32px;" class="bottom-grid">
        
        <!-- Left: Sessions Calendar Timeline -->
        <div class="card" style="padding: 24px; border-radius: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div class="section-title" style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--text);">Tutoring Sessions Timeline</div>
            <span style="font-size: 0.8rem; color: var(--muted); font-weight: 600;">{{ upcomingBookings.length }} Total Bookings</span>
          </div>

          <div v-if="upcomingBookings.length === 0" style="padding: 60px 20px; text-align: center; color: var(--muted);">
            <h3 style="font-weight: 600; color: var(--text); font-size: 1.05rem; margin-bottom: 4px;">No Scheduled Bookings</h3>
            <p style="font-size: 0.85rem; max-width: 250px; margin: 0 auto;">When students book your available times, they'll show up right here.</p>
          </div>

          <div v-else class="activity-list" style="display: flex; flex-direction: column; gap: 16px;">
            <div v-for="booking in upcomingBookings" :key="booking.id" 
                 style="display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg); transition: transform 0.2s;"
                 class="activity-item-card">
              <!-- Student Initials Bubble -->
              <div style="width: 44px; height: 44px; font-weight: 700; background: linear-gradient(135deg, var(--indigo), var(--mint)); display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%; font-size: 0.9rem; flex-shrink: 0; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.1);">
                {{ booking.studentInitials || 'AC' }}
              </div>
              
              <!-- Session Details -->
              <div style="flex-grow: 1;">
                <div style="font-weight: 700; color: var(--text); font-size: 0.98rem;">{{ booking.studentName }}</div>
                <div style="display: flex; gap: 14px; font-size: 0.84rem; color: var(--muted); margin-top: 4px; flex-wrap: wrap;">
                  <span>Date: {{ booking.date }}</span>
                  <span>Duration: {{ booking.time }} ({{ booking.duration }}h)</span>
                  <span>Cost: RM{{ booking.totalCost.toFixed(2) }} (Gross)</span>
                </div>
              </div>

              <!-- Status Badge & Action -->
              <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                <span v-if="booking.status === 'completed'" class="session-status-badge" style="background: #edfcf7; color: #1d9e75; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">Completed</span>
                <span v-else-if="booking.status === 'cancelled'" class="session-status-badge" style="background: #fff0f0; color: #e14f4f; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">Cancelled</span>
                <template v-else>
                  <span class="session-status-badge" style="background: #eef7ff; color: #1c5db6; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">Confirmed</span>
                  <a :href="'classroom.html?bookingId=' + booking.id" class="btn-primary" style="width: auto; height: 36px; padding: 0 16px; font-size: 0.8rem; font-weight: 600; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; color: white; margin: 0; line-height: 1;">
                    Start Class
                  </a>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Actions & Tools -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Tools Widget -->
          <div class="card" style="padding: 24px; border-radius: 24px;">
            <div class="section-title" style="margin-bottom: 16px; font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text);">Quick Actions</div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button class="btn-secondary" style="text-align: left; padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 8px; width: 100%; transition: all 0.2s;" @click="openScheduleModal">
                Adjust Calendar Schedule
              </button>
              <button class="btn-secondary" style="text-align: left; padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 8px; width: 100%; transition: all 0.2s;" @click="openUploadModal">
                Upload Student Materials
              </button>
              <button class="btn-secondary" style="text-align: left; padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 8px; width: 100%; transition: all 0.2s;" @click="openRateModal">
                Update Hourly Rates (RM{{ stats.rate.toFixed(2) }})
              </button>
            </div>
          </div>

          <!-- Payout Info Widget -->
          <div class="card" style="padding: 24px; border-radius: 24px; background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid var(--border);">
            <h3 style="font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 8px;">Tutor Earnings Commission</h3>
            <p style="font-size: 0.84rem; color: var(--muted); line-height: 1.5; margin-bottom: 14px;">Tutors receive **90%** of total billings directly. The remaining **10%** commission is utilized for platform maintenance and AI services.</p>
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
              verified preppal partner
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Rate Configuration Modal -->
    <div v-if="showRateModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:2000;">
      <div class="card" style="width:92%; max-width:440px; padding:24px; border-radius:24px; position:relative;">
        <div style="display:flex; justify-content:between; align-items:center; margin-bottom:20px;">
          <h3 style="font-family:'Sora',sans-serif; font-size:1.2rem; font-weight:700; color:var(--text); margin:0;">Update Hourly Rate</h3>
          <button @click="showRateModal = false" style="background:none; border:none; font-size:1.5rem; color:var(--muted); cursor:pointer; padding:0; margin-left:auto; line-height:1;">&times;</button>
        </div>
        <div v-if="rateError" class="error-msg" style="margin-bottom:16px;">{{ rateError }}</div>
        <p style="font-size:0.88rem; color:var(--muted); margin-bottom:20px;">Adjust your hourly tutoring rate. Platform fee is 10%.</p>
        <div class="field" style="margin-bottom:24px; text-align:center;">
          <div style="font-size:2.2rem; font-weight:800; color:var(--indigo); font-family:'Sora',sans-serif; margin-bottom:8px;">RM{{ newRate }}/hr</div>
          <input type="range" min="10" max="200" step="5" v-model.number="newRate" style="width:100%; accent-color:var(--indigo);" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--muted); margin-top:6px;">
            <span>Min: RM10</span>
            <span>Max: RM200</span>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--border); padding-top:16px;">
          <button class="btn-secondary" style="width:auto; padding:10px 18px; height:38px;" @click="showRateModal = false" :disabled="rateLoading">Cancel</button>
          <button class="btn-primary" style="width:auto; padding:10px 18px; height:38px; color:white;" @click="saveRate" :disabled="rateLoading">
            {{ rateLoading ? 'Saving...' : 'Save Rate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Availability Modal -->
    <div v-if="showScheduleModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:2000;">
      <div class="card" style="width:92%; max-width:480px; padding:24px; border-radius:24px; position:relative;">
        <div style="display:flex; justify-content:between; align-items:center; margin-bottom:20px;">
          <h3 style="font-family:'Sora',sans-serif; font-size:1.2rem; font-weight:700; color:var(--text); margin:0;">Configure Weekly Schedule</h3>
          <button @click="showScheduleModal = false" style="background:none; border:none; font-size:1.5rem; color:var(--muted); cursor:pointer; padding:0; margin-left:auto; line-height:1;">&times;</button>
        </div>
        <div v-if="scheduleError" class="error-msg" style="margin-bottom:16px;">{{ scheduleError }}</div>
        
        <div class="field" style="margin-bottom:20px;">
          <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:10px;">Select Available Days</label>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
            <div v-for="day in ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']" :key="day" style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" :id="day" :value="day" v-model="scheduleDays" style="width:18px; height:18px; accent-color:var(--indigo);" />
              <label :for="day" style="font-size:0.88rem; font-weight:500; cursor:pointer;">{{ day }}</label>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
          <div class="field">
            <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">Start Time</label>
            <input type="time" v-model="scheduleStartTime" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:8px; padding:0 12px; font-family:inherit; background:var(--bg);" />
          </div>
          <div class="field">
            <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">End Time</label>
            <input type="time" v-model="scheduleEndTime" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:8px; padding:0 12px; font-family:inherit; background:var(--bg);" />
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--border); padding-top:16px;">
          <button class="btn-secondary" style="width:auto; padding:10px 18px; height:38px;" @click="showScheduleModal = false" :disabled="scheduleLoading">Cancel</button>
          <button class="btn-primary" style="width:auto; padding:10px 18px; height:38px; color:white;" @click="saveSchedule" :disabled="scheduleLoading">
            {{ scheduleLoading ? 'Saving...' : 'Save Schedule' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Materials Modal -->
    <div v-if="showUploadModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:2000;">
      <div class="card" style="width:92%; max-width:480px; padding:24px; border-radius:24px; position:relative;">
        <div style="display:flex; justify-content:between; align-items:center; margin-bottom:20px;">
          <h3 style="font-family:'Sora',sans-serif; font-size:1.2rem; font-weight:700; color:var(--text); margin:0;">Share Materials with Student</h3>
          <button @click="showUploadModal = false" style="background:none; border:none; font-size:1.5rem; color:var(--muted); cursor:pointer; padding:0; margin-left:auto; line-height:1;">&times;</button>
        </div>
        <div v-if="uploadError" class="error-msg" style="margin-bottom:16px;">{{ uploadError }}</div>

        <div class="field" style="margin-bottom:16px;">
          <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">Select Student</label>
          <select v-model="uploadForm.studentId" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:8px; padding:0 12px; background:var(--bg); outline:none;">
            <option value="">-- Choose a Student --</option>
            <option v-for="student in activeStudents" :key="student.id" :value="student.id">{{ student.name }} ({{ student.email }})</option>
          </select>
        </div>

        <div class="field" style="margin-bottom:16px;">
          <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">Select File</label>
          <input type="file" ref="fileInput" @change="handleFileChange" style="width:100%; padding:8px 0; font-family:inherit;" />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
          <div class="field">
            <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">Subject (e.g. Biology)</label>
            <input type="text" v-model="uploadForm.subject" placeholder="e.g. Biology" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:8px; padding:0 12px; background:var(--bg);" />
          </div>
          <div class="field">
            <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">Topic (e.g. Mitosis)</label>
            <input type="text" v-model="uploadForm.topic" placeholder="e.g. Mitosis" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:8px; padding:0 12px; background:var(--bg);" />
          </div>
        </div>

        <div class="field" style="margin-bottom:24px;">
          <label style="display:block; font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:6px;">Description</label>
          <textarea v-model="uploadForm.description" placeholder="Add study notes or instructions for the student..." style="width:100%; height:80px; border:1.5px solid var(--border); border-radius:8px; padding:12px; font-family:inherit; background:var(--bg); resize:none;"></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--border); padding-top:16px;">
          <button class="btn-secondary" style="width:auto; padding:10px 18px; height:38px;" @click="showUploadModal = false" :disabled="uploadLoading">Cancel</button>
          <button class="btn-primary" style="width:auto; padding:10px 18px; height:38px; color:white;" @click="uploadMaterial" :disabled="uploadLoading">
            {{ uploadLoading ? 'Uploading...' : 'Share File' }}
          </button>
        </div>
      </div>
    </div>
  `
});
