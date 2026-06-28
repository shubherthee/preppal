// js/pages/classroom.js
// Live Classroom Page Script

PrepPalCore.mountApp({
  data() {
    return {
      bookingId: null,
      booking: null,
      currentUser: null,
      meetingLinkInput: '',
      loading: true,
      submitting: false,
      error: '',
      successMessage: ''
    };
  },
  computed: {
    isTutor() {
      return this.currentUser && this.currentUser.role.toLowerCase() === 'tutor';
    },
    isStudent() {
      return this.currentUser && this.currentUser.role.toLowerCase() === 'student';
    },
    formattedTime() {
      if (!this.booking) return '';
      return this.booking.time;
    },
    isSessionActive() {
      return this.booking && this.booking.status === 'confirmed';
    },
    isSessionCompleted() {
      return this.booking && this.booking.status === 'completed';
    },
    isSessionCancelled() {
      return this.booking && this.booking.status === 'cancelled';
    }
  },
  methods: {
    async fetchBookingDetails() {
      try {
        this.loading = true;
        this.error = '';
        const res = await PrepPalAPI.getBookingDetails(this.bookingId);
        this.booking = res;
        this.meetingLinkInput = res.meetingLink || '';
      } catch (err) {
        console.error(err);
        this.error = err.message || 'Failed to load class details. Make sure you are authorized to view this session.';
      } finally {
        this.loading = false;
      }
    },
    async saveMeetingLink() {
      if (!this.meetingLinkInput.trim()) {
        this.error = 'Please enter a valid link or contact number.';
        return;
      }

      try {
        this.submitting = true;
        this.error = '';
        this.successMessage = '';
        
        // Basic prefixing to ensure links open correctly in new tabs
        let link = this.meetingLinkInput.trim();
        if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('tel:') && !link.startsWith('wa.me/')) {
          // If it looks like a phone number, make it a WhatsApp link
          if (/^\+?[0-9\s-]{8,15}$/.test(link)) {
            const cleanNumber = link.replace(/[^0-9]/g, '');
            link = `https://wa.me/${cleanNumber}`;
          } else {
            link = 'https://' + link;
          }
        }

        const res = await PrepPalAPI.updateMeetingLink(this.bookingId, link);
        this.booking.meetingLink = link;
        this.meetingLinkInput = link;
        this.successMessage = 'Class started! Meeting link has been updated and shared with the student.';
      } catch (err) {
        console.error(err);
        this.error = err.message || 'Failed to update meeting link.';
      } finally {
        this.submitting = false;
      }
    },
    async markAsCompleted() {
      if (!confirm('Are you sure you want to mark this class session as completed? This will trigger the payment payout.')) {
        return;
      }

      try {
        this.submitting = true;
        this.error = '';
        this.successMessage = '';
        await PrepPalAPI.completeTutorBooking(this.bookingId);
        this.booking.status = 'completed';
        this.successMessage = 'Session marked as completed successfully!';
      } catch (err) {
        console.error(err);
        this.error = err.message || 'Failed to mark session as completed.';
      } finally {
        this.submitting = false;
      }
    },
    goBack() {
      const dashboardRel = this.isTutor ? 'tutor_dashboard.html' : '../dashboard/student_dashboard.html';
      window.location.href = dashboardRel;
    }
  },
  async mounted() {
    // 1. Get query param
    const urlParams = new URLSearchParams(window.location.search);
    this.bookingId = urlParams.get('bookingId');

    if (!this.bookingId) {
      this.error = 'No booking ID provided. Please navigate from your dashboard.';
      this.loading = false;
      return;
    }

    // 2. Get user profile
    this.currentUser = PrepPalCore.getCurrentUser();
    if (!this.currentUser) {
      window.location.href = '../../index.html';
      return;
    }

    // 3. Fetch booking
    await this.fetchBookingDetails();
  },
  template: `
    <div class="classroom-page-container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <!-- Header Navigation -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <button class="btn-secondary" style="width: auto; display: flex; align-items: center; gap: 8px; font-weight: 600; padding: 8px 16px; border-radius: 12px;" @click="goBack">
          ← Back to Dashboard
        </button>
        <div style="font-weight: 700; color: var(--text-muted); font-size: 0.9rem;">
          Session #{{ bookingId }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card" style="text-align: center; padding: 60px; border-radius: 24px;">
        <div class="spinner" style="margin: 0 auto 16px auto; width: 40px; height: 40px; border: 3px solid rgba(124, 58, 237, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="color: var(--text-muted); font-weight: 500;">Loading classroom details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card" style="padding: 32px; border-radius: 24px; border: 1.5px solid rgba(225, 79, 79, 0.2); background: rgba(225, 79, 79, 0.02); text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>️</div>
        <h3 style="color: #e14f4f; font-weight: 700; margin-bottom: 12px;">Classroom Connection Error</h3>
        <p style="color: var(--text); margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.5;">{{ error }}</p>
        <button class="btn-primary" style="width: auto; padding: 10px 20px;" @click="fetchBookingDetails">Try Again</button>
      </div>

      <!-- Main Classroom Card -->
      <div v-else-if="booking" class="card" style="padding: 32px; border-radius: 24px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.04); border: 1.5px solid var(--border);">
        
        <!-- Status Banner -->
        <div style="margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Session Status</span>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span v-if="isSessionCompleted" class="session-status-badge" style="background: #edfcf7; color: #1d9e75; font-size: 0.78rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase;">Completed</span>
              <span v-else-if="isSessionCancelled" class="session-status-badge" style="background: #fff0f0; color: #e14f4f; font-size: 0.78rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase;">Cancelled</span>
              <span v-else class="session-status-badge" style="background: #eef7ff; color: #1c5db6; font-size: 0.78rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase;">Active</span>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Schedule</span>
            <div style="font-weight: 600; color: var(--text); margin-top: 4px; font-size: 0.95rem;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {{ booking.date }} &nbsp; <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ booking.time }} ({{ booking.duration }}h)
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-msg" style="margin-bottom: 24px; padding: 12px 16px; border-radius: 12px; background: rgba(29, 158, 117, 0.05); color: #1d9e75; font-weight: 600; border: 1px solid rgba(29, 158, 117, 0.2); font-size: 0.9rem;">
          ✓ {{ successMessage }}
        </div>

        <!-- Participant details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;" class="classroom-participants">
          <div style="padding: 16px; border-radius: 16px; background: var(--bg); border: 1.5px solid var(--border);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Tutor</div>
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text);">{{ booking.tutorName }}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">{{ booking.tutorEmail }}</div>
          </div>
          <div style="padding: 16px; border-radius: 16px; background: var(--bg); border: 1.5px solid var(--border);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Student</div>
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text);">{{ booking.studentName }}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">{{ booking.studentEmail }}</div>
          </div>
        </div>

        <!-- TUTOR VIEW -->
        <div v-if="isTutor" class="classroom-tutor-view">
          <div v-if="isSessionActive">
            <h4 style="font-weight: 700; font-size: 1.05rem; color: var(--text); margin-bottom: 12px;">Start the Class Session</h4>
            <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px;">
              Enter the online class meeting link (e.g. Google Meet, Zoom, MS Teams) or a contact number (like a WhatsApp group or API connection link) below. Once saved, it will instantly become available for the student to join.
            </p>

            <div class="field" style="margin-bottom: 24px;">
              <label style="font-weight: 600; font-size: 0.82rem; display: block; margin-bottom: 8px;">Class Meeting URL or Contact Link</label>
              <div style="display: flex; gap: 12px;">
                <input 
                  type="text" 
                  v-model="meetingLinkInput" 
                  placeholder="https://meet.google.com/abc-defg-hij or WhatsApp number" 
                  style="flex: 1; height: 42px; border-radius: 12px; border: 1.5px solid var(--border); padding: 0 16px; font-family: inherit; font-size: 0.9rem; background: var(--bg); transition: all 0.2s;"
                  :disabled="submitting"
                />
                <button class="btn-primary" style="width: auto; height: 42px; padding: 0 20px; font-weight: 700; color: white;" @click="saveMeetingLink" :disabled="submitting">
                  {{ booking.meetingLink ? 'Update Link' : 'Start Class & Send' }}
                </button>
              </div>
            </div>

            <!-- Complete Class Actions -->
            <div v-if="booking.meetingLink" style="padding: 20px; border-radius: 16px; background: rgba(124, 58, 237, 0.02); border: 1.5px solid rgba(124, 58, 237, 0.15); display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
              <div>
                <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-bottom: 4px;">Class is Currently Live!</div>
                <div style="font-size: 0.84rem; color: var(--text-muted);">When you are finished teaching the lesson, click the button to mark this session as completed.</div>
              </div>
              <button class="btn-primary" style="width: auto; background: #1b9e75; border-color: #1b9e75; font-weight: 700; padding: 8px 18px; border-radius: 12px; height: 40px; color: white;" @click="markAsCompleted" :disabled="submitting">
                Complete Session ✓
              </button>
            </div>
          </div>
          <div v-else-if="isSessionCompleted" style="text-align: center; padding: 12px;">
            <div style="color: #1d9e75; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px;">✓ This session is completed</div>
            <p style="color: var(--text-muted); font-size: 0.88rem;">The class has ended and the payment request has been completed successfully.</p>
          </div>
          <div v-else style="text-align: center; padding: 12px; color: #e14f4f; font-weight: 700;">
            This session was cancelled.
          </div>
        </div>

        <!-- STUDENT VIEW -->
        <div v-if="isStudent" class="classroom-student-view">
          <div v-if="isSessionActive">
            <!-- Waiting for link -->
            <div v-if="!booking.meetingLink" style="text-align: center; padding: 32px; background: rgba(124, 58, 237, 0.01); border-radius: 20px; border: 1.5px dashed var(--border);">
              <div class="spinner" style="margin: 0 auto 16px auto; width: 36px; height: 36px; border: 3px solid rgba(124, 58, 237, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
              <h4 style="font-weight: 700; font-size: 1.05rem; color: var(--text); margin-bottom: 8px;">Waiting for your Tutor</h4>
              <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 440px; margin: 0 auto; line-height: 1.5;">
                Your tutor will start the class and upload the link here shortly. Please wait or refresh the page if the class is scheduled to start now.
              </p>
            </div>
            <!-- Link is ready! -->
            <div v-else style="text-align: center; padding: 24px;">
              <div style="font-size: 3rem; margin-bottom: 12px;"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"></path></svg></div>
              <h4 style="font-weight: 700; font-size: 1.2rem; color: var(--text); margin-bottom: 8px;">Your Class Session is Ready!</h4>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 24px;">Click the button below to join the online class meet or chat channel with your tutor.</p>
              
              <a :href="booking.meetingLink" target="_blank" class="btn-primary" style="width: auto; max-width: 320px; margin: 0 auto; height: 46px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; text-decoration: none; color: white; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.2);">
                <span><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Connect to Classroom</span>
              </a>
              <div style="margin-top: 16px; font-size: 0.8rem; color: var(--text-muted);">
                Link shared: <code style="background: var(--bg); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 0.76rem;">{{ booking.meetingLink }}</code>
              </div>
            </div>
          </div>
          <div v-else-if="isSessionCompleted" style="text-align: center; padding: 12px; color: #1d9e75; font-weight: 700;">
            ✓ You have completed this session. Hope you had a great class!
          </div>
          <div v-else style="text-align: center; padding: 12px; color: #e14f4f; font-weight: 700;">
            This session was cancelled.
          </div>
        </div>

      </div>
    </div>
  `,
  styles: `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
});
