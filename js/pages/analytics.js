// js/pages/analytics.js
// Progress Tracking & Analytics page: view performance charts, log study sessions, and run AI skill gap analyses.

(function () {
  const api = PrepPalAPI;

  // Inject custom stylesheet dynamically to prevent style loss/stripping issues by Vue template compiler
  const styles = `
    /* Spacious UI Inspiration Style Overrides */
    .app-shell {
      background: linear-gradient(135deg, #f8f7fd 0%, #f1edf9 100%) !important;
    }
    
    .main {
      padding: 36px !important;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Clean, Rounded Typography */
    h1 {
      font-family: 'Sora', sans-serif !important;
      font-weight: 700 !important;
      color: #2e265c !important;
      letter-spacing: -0.7px;
      font-size: 2.2rem;
    }
    h2, .section-title {
      font-family: 'Sora', sans-serif !important;
      font-weight: 700 !important;
      color: #2e265c !important;
      font-size: 1.25rem;
      margin-bottom: 4px;
    }
    p {
      font-family: 'DM Sans', sans-serif !important;
      color: #7b7597 !important;
      font-size: 0.9rem;
    }

    /* Premium Rounded Cards (Inspiration-Spec) */
    .card {
      background: #ffffff !important;
      border: 1px solid rgba(225, 220, 245, 0.6) !important;
      border-radius: 28px !important;
      box-shadow: 0 10px 40px rgba(124, 58, 237, 0.03) !important;
      padding: 28px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 45px rgba(124, 58, 237, 0.06) !important;
    }

    /* Topbar Search and Notification Bubble buttons */
    .circle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50% !important;
      background: #ffffff !important;
      border: 1px solid rgba(225, 220, 245, 0.6) !important;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.04) !important;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .circle-btn:hover {
      background: #f4efff !important;
      border-color: #d8c8ff !important;
      transform: scale(1.05);
    }

    /* Custom Form Inputs */
    input, select, textarea {
      border: 1px solid #e5e0f9 !important;
      background: #fdfcff !important;
      border-radius: 14px !important;
      outline: none !important;
      color: #2e265c !important;
      padding: 10px 14px !important;
      font-family: inherit !important;
      font-size: 0.9rem !important;
      transition: all 0.2s ease !important;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #7c3aed !important;
      box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12) !important;
      background: #ffffff !important;
    }

    /* Premium Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
      border: none !important;
      color: white !important;
      border-radius: 50px !important;
      font-weight: 700 !important;
      padding: 12px 28px !important;
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.2) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      cursor: pointer !important;
      width: auto !important;
    }
    .btn-primary:hover {
      transform: scale(1.05) translateY(-2px) !important;
      box-shadow: 0 10px 24px rgba(124, 58, 237, 0.3) !important;
    }
    .btn-secondary {
      background: #f3f0ff !important;
      border: 2px solid #e9e3ff !important;
      color: #7c3aed !important;
      border-radius: 50px !important;
      font-weight: 700 !important;
      padding: 10px 26px !important;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.04) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      cursor: pointer !important;
    }
    .btn-secondary:hover {
      background: #eae5ff !important;
      border-color: #d8cdff !important;
      transform: scale(1.05) translateY(-2px) !important;
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.08) !important;
    }

    /* Inspiration-style Rounded List Rows (Pills) */
    .pill-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-radius: 20px;
      margin-bottom: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
    }
    
    /* Alternating pastel theme card row styles */
    .pill-row-mint {
      background: #e8f7f4 !important;
      color: #1f5e52 !important;
      border-color: rgba(170, 227, 215, 0.3) !important;
    }
    .pill-row-mint:hover {
      transform: translateX(3px);
      box-shadow: 0 6px 20px rgba(31, 94, 82, 0.05) !important;
      border-color: #aae3d7 !important;
    }
    .pill-row-lavender {
      background: #f4f0ff !important;
      color: #4f3b8c !important;
      border-color: rgba(216, 200, 255, 0.3) !important;
    }
    .pill-row-lavender:hover {
      transform: translateX(3px);
      box-shadow: 0 6px 20px rgba(79, 59, 140, 0.05) !important;
      border-color: #d8c8ff !important;
    }

    /* Round Arrow Buttons */
    .arrow-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      background: #ffffff !important;
      border: none !important;
      color: #7c3aed !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      padding: 0 !important;
    }
    .arrow-btn:hover {
      transform: scale(1.15) translateY(-1px) !important;
      background: #7c3aed !important;
      color: #ffffff !important;
      box-shadow: 0 6px 14px rgba(124, 58, 237, 0.2) !important;
    }

    /* Growing plant mastery bars */
    .mastery-grow-bar {
      background: #efeefc;
      height: 8px;
      border-radius: 4px;
      width: 100%;
      overflow: hidden;
      margin-top: 6px;
    }
    .mastery-fill {
      height: 100%;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .badge-status {
      display: inline-block !important;
      padding: 4px 10px !important;
      font-size: 0.75rem !important;
      font-weight: 700 !important;
      border-radius: 12px !important;
      text-align: center !important;
      line-height: 1.2 !important;
    }
    .status-completed {
      background: #e8f7f4 !important;
      color: #1f5e52 !important;
      border: 1px solid rgba(170, 227, 215, 0.4) !important;
    }
    .status-pending {
      background: #fffbeb !important;
      color: #b45309 !important;
      border: 1px solid rgba(253, 230, 138, 0.4) !important;
    }
    .status-inprogress {
      background: #eff6ff !important;
      color: #1d4ed8 !important;
      border: 1px solid rgba(191, 219, 254, 0.4) !important;
    }
    .status-scheduled {
      background: #faf5ff !important;
      color: #6b21a8 !important;
      border: 1px solid rgba(233, 213, 255, 0.4) !important;
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const template = `
    <!-- Topbar Navigation Header -->
    <div class="topbar" style="margin-bottom: 28px;">
      <div class="search-wrap" style="background:#ffffff; border: 1px solid rgba(225, 220, 245, 0.6); border-radius:24px; box-shadow:0 4px 16px rgba(124,58,237,0.02);">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#7c3aed" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          type="text"
          v-model="analyticsSearch"
          placeholder="Search subjects, scores, mastery, or study time..."
          style="border:none !important; background:transparent !important; box-shadow:none !important; padding:4px 8px !important;"
        />
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="circle-btn" style="position:relative;" title="Reminders Alert">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="#7c3aed" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-dot" v-if="skillGaps.length" style="position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: #ff6b7a; border: 1.5px solid #ffffff;"></span>
        </div>
        <div class="topbar-avatar" style="background: linear-gradient(135deg, #7c3aed, #c084fc); border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);">{{ initials }}</div>
      </div>
    </div>

    <!-- Header Progress / Greeting Block -->
    <div class="card user-progress-card" style="margin-bottom: 28px; padding: 28px; border-radius: 28px; background: #ffffff !important; display: flex; align-items: center; gap: 20px; border: 1px solid rgba(225, 220, 245, 0.6) !important;">
      <div class="user-avatar-large" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #c084fc); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; flex-shrink: 0; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.15);">
        {{ initials }}
      </div>
      <div style="flex-grow: 1; min-width: 0;">
        <div style="font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 700; color: #2e265c;">Hello {{ userName.split(' ')[0] }}!</div>
        <p style="margin: 4px 0 12px 0; font-size: 0.9rem; color: #7b7597;">Here is your study progress overview for today.</p>
        <!-- Thin, Rounded Progress Meter -->
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="flex-grow: 1; min-width: 150px; height: 6px; background: #f0ecfa; border-radius: 3px; overflow: hidden;">
            <div :style="{ width: averageMastery + '%' }" style="height: 100%; background: linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%); border-radius: 3px; transition: width 0.8s ease;"></div>
          </div>
          <span style="font-size: 0.82rem; font-weight: 700; color: #7c3aed; white-space: nowrap;">{{ averageMastery }}% overall mastery</span>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row" style="margin-bottom: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
      
      <!-- Card 1: Study Time -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #f4f0ff; border: 1px solid rgba(216, 200, 255, 0.4); box-shadow: 0 8px 30px rgba(79, 59, 140, 0.02);">
        <div style="background:#ffffff; color:#4f3b8c; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(79, 59, 140, 0.05);">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #4f3b8c; line-height: 1.1; font-family:'Sora',sans-serif;">{{ totalStudyMinutes }}m</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #4f3b8c; opacity: 0.8; margin-top: 2px; font-weight: 600;">Study Time</div>
        </div>
      </div>

      <!-- Card 2: Avg Quiz Score -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #e8f7f4; border: 1px solid rgba(170, 227, 215, 0.4); box-shadow: 0 8px 30px rgba(31, 94, 82, 0.02);">
        <div style="background:#ffffff; color:#1f5e52; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(31, 94, 82, 0.05);">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #1f5e52; line-height: 1.1; font-family:'Sora',sans-serif;">{{ averageQuizScore }}%</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #1f5e52; opacity: 0.8; margin-top: 2px; font-weight: 600;">Avg Quiz Score</div>
        </div>
      </div>

      <!-- Card 3: Avg Mastery -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #f4f0ff; border: 1px solid rgba(216, 200, 255, 0.4); box-shadow: 0 8px 30px rgba(79, 59, 140, 0.02);">
        <div style="background:#ffffff; color:#4f3b8c; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(79, 59, 140, 0.05);">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #4f3b8c; line-height: 1.1; font-family:'Sora',sans-serif;">{{ averageMastery }}%</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #4f3b8c; opacity: 0.8; margin-top: 2px; font-weight: 600;">Avg Mastery</div>
        </div>
      </div>

      <!-- Card 4: Gaps Identified -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #e8f7f4; border: 1px solid rgba(170, 227, 215, 0.4); box-shadow: 0 8px 30px rgba(31, 94, 82, 0.02);">
        <div style="background:#ffffff; color:#1f5e52; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(31, 94, 82, 0.05);" :style="{ color: skillGaps.length > 0 ? '#b91c1c' : '#1f5e52' }">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #1f5e52; line-height: 1.1; font-family:'Sora',sans-serif;" :style="{ color: skillGaps.length > 0 ? '#b91c1c' : '#1f5e52' }">{{ skillGaps.length }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #1f5e52; opacity: 0.8; margin-top: 2px; font-weight: 600;" :style="{ color: skillGaps.length > 0 ? '#b91c1c' : '#1f5e52', opacity: skillGaps.length > 0 ? 0.9 : 0.8 }">Gaps Identified</div>
        </div>
      </div>
    </div>

    <!-- Spacious grid layout -->
    <div class="bottom-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
      
      <!-- Left Column: Performance Logs -->
      <div style="display:flex; flex-direction:column; gap:32px;">
        
        <!-- Performance Dashboard Card -->
        <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.25) !important; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.03) !important;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap;">
            <div>
              <h2 style="margin:0;">Performance Logs</h2>
              <p style="margin:2px 0 0 0;">Integrated overview of manual study sessions and quiz attempts.</p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2) !important; border: none !important; color: white !important;" @click="showLogForm = !showLogForm">
                {{ showLogForm ? 'Close' : '+ Log Session' }}
              </button>
              <button class="btn-secondary" style="padding:8px 20px; font-size:0.85rem; border-radius:12px;" @click="loadAnalyticsData">
                Refresh
              </button>
            </div>
          </div>

          <!-- Log Form inside Card -->
          <div v-if="showLogForm" class="card" style="box-shadow:none; background:#fbfaff !important; border:1px solid #e1dbf3 !important; margin-bottom:20px; padding:20px; border-radius: 20px;">
            <h3 style="margin-top:0; margin-bottom:14px; font-size:1rem; color:#2e265c; font-family:'Sora',sans-serif; font-weight:700;">Log Study Session</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#6c6684; margin-bottom:4px; font-weight: 600;">Subject</label>
                <input type="text" v-model="newLog.subject" placeholder="e.g. Organic Chemistry" style="width:100%;" />
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#6c6684; margin-bottom:4px; font-weight: 600;">Date</label>
                <input type="date" v-model="newLog.date" style="width:100%;" />
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#6c6684; margin-bottom:4px; font-weight: 600;">Study Minutes</label>
                <input type="number" v-model.number="newLog.study_minutes" placeholder="60" style="width:100%;" />
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#6c6684; margin-bottom:4px; font-weight: 600;">Modules Completed</label>
                <input type="number" v-model.number="newLog.modules_completed" placeholder="1" style="width:100%;" />
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#6c6684; margin-bottom:4px; font-weight: 600;">Mastery Level (%)</label>
                <input type="number" v-model.number="newLog.mastery" placeholder="80" min="0" max="100" style="width:100%;" />
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#6c6684; margin-bottom:4px; font-weight: 600;">Quiz Score (%, Optional)</label>
                <input type="number" v-model.number="newLog.quiz_score" placeholder="85" min="0" max="100" style="width:100%;" />
              </div>
            </div>
            <div style="text-align:right;">
              <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2) !important; border: none !important; color: white !important;" @click="logSession">Save Session Log</button>
            </div>
          </div>

          <!-- Logs List -->
          <div v-if="analyticsLoading" style="text-align:center; padding:20px; color:#6c6684;">
            Loading performance statistics...
          </div>
          <div v-if="errorMsg" class="error-msg" style="margin-bottom:12px;">
            {{ errorMsg }}
          </div>

          <div v-if="!analyticsLoading && filteredAnalyticsRecords.length" style="margin-top:10px;">
            <div 
              v-for="(record, index) in filteredAnalyticsRecords" 
              :key="record.id"
              class="pill-row"
              :class="index % 2 === 0 ? 'pill-row-mint' : 'pill-row-lavender'"
              style="margin-bottom: 12px;"
            >
              <div style="flex-grow: 1; padding-right: 16px;">
                <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #7c3aed; flex-shrink: 0;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2V4H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
                  <span>{{ record.subject }}</span>
                </div>
                <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 6px; font-weight: 500; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span style="display: flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ record.study_minutes }} min</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> {{ record.modules_completed }} module(s)</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Mastery: {{ record.mastery }}%</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                <span style="font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; background: #ffffff; display: flex; align-items: center; gap: 4px;">
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{{ formatDate(record.date) }}</span>
                </span>
                <span class="badge-status" :class="record.quiz_score !== null && record.quiz_score !== undefined ? 'status-completed' : 'status-pending'">
                  {{ record.quiz_score !== null && record.quiz_score !== undefined ? 'Quiz: ' + record.quiz_score + '%' : 'No Quiz' }}
                </span>
                <button class="arrow-btn" @click="goToTutors" title="Discuss with Tutor" style="background:#ffffff; color:#7c3aed;">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="!analyticsLoading && !errorMsg && !filteredAnalyticsRecords.length" style="text-align:center; color:#7b7597; padding:30px; background:rgba(255,255,255,0.4); border-radius:20px; font-size: 0.88rem; border: 1px dashed rgba(225,220,245,0.8);">
            No study sessions logged yet.
          </div>
        </div>

        <!-- AI Skill Gap Analysis Card -->
        <div class="card" style="border: 1px solid rgba(239, 68, 68, 0.25) !important; box-shadow: 0 10px 40px rgba(239, 68, 68, 0.03) !important;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; flex-wrap:wrap;">
            <div>
              <h2 style="margin:0;">AI Skill Gap Analysis</h2>
              <p style="margin:2px 0 0 0;">Identify and review weak points with OpenRouter AI suggestions.</p>
            </div>
            <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius: 50px !important; background: linear-gradient(135deg, #f87171 0%, #ef4444 100%) !important; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15) !important; border: none !important; color: white !important;" @click="runSkillGapAnalysis" :disabled="analyzingSkillGaps">
              {{ analyzingSkillGaps ? 'Analyzing...' : 'Run Analysis' }}
            </button>
          </div>

          <div v-if="analyzingSkillGaps" style="text-align:center; padding:20px; background:rgba(255,255,255,0.4); border-radius:20px; font-size:0.85rem;">
            Analyzing learning gaps and compiling recommendations...
          </div>

          <div v-else-if="skillGaps.length" style="display:flex; flex-direction:column; gap:10px;">
            <div 
              v-for="(gap, idx) in skillGaps" 
              :key="'gap-' + idx" 
              class="pill-row"
              :class="idx % 2 === 0 ? 'pill-row-mint' : 'pill-row-lavender'"
              style="margin-bottom:0; padding: 16px; align-items: flex-start; flex-direction: column; gap: 6px;"
            >
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span style="font-weight:800; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">{{ gap.subject }}</span>
                <span 
                  :style="{ color: gap.status === 'Critical' ? '#ef4444' : 'inherit' }" 
                  style="font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:8px; background:#ffffff;"
                >
                  {{ gap.status }}
                </span>
              </div>
              <div style="font-size:0.85rem; line-height:1.4; font-weight: 500;">{{ gap.reason }}</div>
            </div>
          </div>
          <div v-else style="text-align:center; color:#7b7597; padding:24px; background:rgba(255,255,255,0.4); border-radius:20px; font-size:0.85rem; border: 1px dashed rgba(225,220,245,0.8);">
            Click Run Analysis to inspect your performance history.
          </div>
        </div>

      </div>

      <!-- Right Column: Mastery & Tips -->
      <div style="display:flex; flex-direction:column; gap:32px;">
        
        <!-- Mastery Tracking Card -->
        <div class="card" style="border: 1px solid rgba(139, 92, 246, 0.25) !important; box-shadow: 0 10px 40px rgba(139, 92, 246, 0.03) !important;">
          <h2 style="margin:0; margin-bottom:4px;">Mastery Tracking</h2>
          <p style="margin-bottom:16px;">Current competency status by subject.</p>

          <div v-if="analyticsRecords.length" style="display:flex; flex-direction:column; gap:12px;">
            <div 
              v-for="(record, index) in analyticsRecords.slice(0, 5)" 
              :key="'mastery-' + record.id" 
              class="pill-row" 
              :class="index % 2 === 0 ? 'pill-row-mint' : 'pill-row-lavender'"
              style="padding: 16px 20px; flex-direction: column; align-items: stretch; margin-bottom: 0; gap: 8px;"
            >
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:700; font-size:0.92rem;">{{ record.subject }}</div>
                <span style="font-weight:800; font-size:0.92rem;">{{ record.mastery }}%</span>
              </div>
              <div class="mastery-grow-bar" style="height: 8px; border-radius: 4px; background: #ffffff; width: 100%; overflow: hidden; margin-top: 0;">
                <div 
                  class="mastery-fill" 
                  :style="{ 
                    width: record.mastery + '%',
                    background: index % 2 === 0 ? 'linear-gradient(90deg, #aae3d7, #1f5e52)' : 'linear-gradient(90deg, #d8c8ff, #7c3aed)'
                  }"
                  style="height: 100%; border-radius: 4px; transition: width 0.8s ease;"
                ></div>
              </div>
            </div>
          </div>
          <div v-else style="text-align:center; color:#7b7597; padding:24px; background:rgba(255,255,255,0.4); border-radius:20px; font-size:0.85rem; border: 1px dashed rgba(225,220,245,0.8);">
            Log study sessions to populate subject mastery charts.
          </div>
        </div>

        <!-- Tutor Tips Card -->
        <div class="card" style="border: 1px solid rgba(99, 102, 241, 0.25) !important; box-shadow: 0 10px 40px rgba(99, 102, 241, 0.03) !important;">
          <h2 style="margin:0; margin-bottom:4px;">Tutor Review & Tips</h2>
          <p style="margin-bottom:16px;">Strategic feedback to lock in knowledge.</p>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="pill-row pill-row-lavender" style="margin-bottom:0; display:flex; gap:12px; align-items:flex-start; padding: 16px;">
              <span style="color:#4f3b8c; padding-top:2px; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2V4H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
              </span>
              <div>
                <div style="font-weight:700; font-size:0.9rem;">Spaced Repetition</div>
                <div style="font-size:0.78rem; opacity:0.85; margin-top:4px; line-height:1.4; font-weight: 500;">Review flashcards 1, 3, and 7 days after reading slides to build durable neural recall routes.</div>
              </div>
            </div>

            <div class="pill-row pill-row-mint" style="margin-bottom:0; display:flex; gap:12px; align-items:flex-start; padding: 16px;">
              <span style="color:#1f5e52; padding-top:2px; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </span>
              <div>
                <div style="font-weight:700; font-size:0.9rem;">Active Recall</div>
                <div style="font-size:0.78rem; opacity:0.85; margin-top:4px; line-height:1.4; font-weight: 500;">Try taking practice quizzes before reading textbooks. Making mistakes highlights learning gaps.</div>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid rgba(225,220,245,0.6); padding-top:16px; margin-top:16px; display:flex; align-items:center; justify-content:space-between; gap: 8px;">
            <div>
              <div style="font-weight:700; font-size:0.85rem; color:#2e265c;">Struggling with a topic?</div>
              <div style="font-size:0.75rem; color:#7b7597; margin-top:2px;">Discuss statistics with an expert tutor</div>
            </div>
            <button class="btn-primary" style="width: auto !important; padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15) !important; border: none !important; color: white !important; flex-shrink: 0;" @click="goToTutors">
              Find Tutor
            </button>
          </div>
        </div>

      </div>

    </div>
  `;

  const user = PrepPalCore.getCurrentUser();
  const userRole = user.role;

  const tutorTemplate = `
    <!-- Topbar Navigation Header -->
    <div class="topbar" style="margin-bottom: 28px;">
      <div class="search-wrap" style="background:#ffffff; border: 1px solid rgba(225, 220, 245, 0.6); border-radius:24px; box-shadow:0 4px 16px rgba(124,58,237,0.02);">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#7c3aed" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          type="text"
          v-model="analyticsSearch"
          placeholder="Search bookings or student names..."
          style="border:none !important; background:transparent !important; box-shadow:none !important; padding:4px 8px !important;"
        />
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="topbar-avatar" style="background: linear-gradient(135deg, #7c3aed, #c084fc); border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);">{{ initials }}</div>
      </div>
    </div>

    <!-- Header Progress Card for Tutor -->
    <div class="card user-progress-card" style="margin-bottom: 28px; padding: 28px; border-radius: 28px; background: #ffffff !important; display: flex; align-items: center; gap: 20px; border: 1px solid rgba(225, 220, 245, 0.6) !important;">
      <div class="user-avatar-large" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #c084fc); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; flex-shrink: 0; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.15);">
        {{ initials }}
      </div>
      <div style="flex-grow: 1; min-width: 0; text-align: left;">
        <div style="font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 700; color: #2e265c;">Hello {{ userName.split(' ')[0] }}!</div>
        <p style="margin: 4px 0 12px 0; font-size: 0.9rem; color: #7b7597;">Here is your performance analytics and student booking overview.</p>
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="flex-grow: 1; min-width: 150px; height: 6px; background: #f0ecfa; border-radius: 3px; overflow: hidden;">
            <div :style="{ width: paidBookingsPercent + '%' }" style="height: 100%; background: linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%); border-radius: 3px; transition: width 0.8s ease;"></div>
          </div>
          <span style="font-size: 0.82rem; font-weight: 700; color: #7c3aed; white-space: nowrap;">{{ paidBookingsCount }}/{{ tutorBookings.length }} bookings paid ({{ paidBookingsPercent }}%)</span>
        </div>
      </div>
    </div>

    <!-- Tutor Stats Row -->
    <div class="stats-row" style="margin-bottom: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
      <!-- Total Bookings -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #f4f0ff; border: 1px solid rgba(216, 200, 255, 0.4); box-shadow: 0 8px 30px rgba(79, 59, 140, 0.02); text-align: left;">
        <div style="background:#ffffff; color:#4f3b8c; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(79, 59, 140, 0.05);">
          📅
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #4f3b8c; line-height: 1.1; font-family:'Sora',sans-serif;">{{ tutorBookings.length }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #4f3b8c; opacity: 0.8; margin-top: 2px; font-weight: 600;">Total Bookings</div>
        </div>
      </div>

      <!-- Active Students -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #e8f7f4; border: 1px solid rgba(170, 227, 215, 0.4); box-shadow: 0 8px 30px rgba(31, 94, 82, 0.02); text-align: left;">
        <div style="background:#ffffff; color:#1f5e52; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(31, 94, 82, 0.05);">
          🧑‍🎓
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #1f5e52; line-height: 1.1; font-family:'Sora',sans-serif;">{{ uniqueStudentsCount }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #1f5e52; opacity: 0.8; margin-top: 2px; font-weight: 600;">Active Students</div>
        </div>
      </div>

      <!-- Hours Taught -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1px solid rgba(191, 219, 254, 0.4); box-shadow: 0 8px 30px rgba(37, 99, 235, 0.02); text-align: left;">
        <div style="background:#ffffff; color:#2563eb; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);">
          ⏱️
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #2563eb; line-height: 1.1; font-family:'Sora',sans-serif;">{{ totalHoursTaught }}h</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #2563eb; opacity: 0.8; margin-top: 2px; font-weight: 600;">Hours Taught</div>
        </div>
      </div>

      <!-- Earnings -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #fff4e6; border: 1px solid rgba(253, 230, 138, 0.4); box-shadow: 0 8px 30px rgba(245, 158, 11, 0.02); text-align: left;">
        <div style="background:#ffffff; color:#d97706; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.05);">
          RM
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #d97706; line-height: 1.1; font-family:'Sora',sans-serif;">{{ tutorEarnings }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #d97706; opacity: 0.8; margin-top: 2px; font-weight: 600;">Total Earnings</div>
        </div>
      </div>
    </div>

    <!-- Booking Ledger -->
    <div class="card" style="padding: 28px; border-radius: 28px;">
      <h2 style="margin-bottom: 20px; font-size:1.3rem; text-align: left;">Booking Registry & Revenue Breakdown</h2>
      
      <div v-if="analyticsLoading" style="text-align:center; padding:20px; color:#6c6684;">
        Loading booking ledger...
      </div>
      <div v-if="errorMsg" class="error-msg" style="margin-bottom:12px;">
        {{ errorMsg }}
      </div>

      <div v-if="!analyticsLoading && filteredTutorBookings.length" style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.88rem;">
          <thead>
            <tr style="border-bottom:2px solid #efeefc; color:#574e7d; font-weight:700;">
              <th style="padding:12px;">Student</th>
              <th style="padding:12px;">Date & Time</th>
              <th style="padding:12px;">Duration</th>
              <th style="padding:12px;">Hourly Rate</th>
              <th style="padding:12px;">Total Bill</th>
              <th style="padding:12px;">Session Status</th>
              <th style="padding:12px;">Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in filteredTutorBookings" :key="b.id" style="border-bottom:1px solid #f8f6fd; color:#2e265c; font-weight:500;">
              <td style="padding:16px 12px; display:flex; align-items:center; gap:10px; text-align: left;">
                <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #a78bfa, #7c3aed); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem; flex-shrink: 0;">
                  {{ b.student.initials }}
                </div>
                <div>
                  <div style="font-weight:700;">{{ b.student.name }}</div>
                  <div style="font-size:0.7rem; color:#7b7597;">{{ b.student.email }}</div>
                </div>
              </td>
              <td style="padding:12px;">{{ formatDate(b.date) }} @ {{ b.time }}</td>
              <td style="padding:12px;">{{ b.duration }} hr(s)</td>
              <td style="padding:12px;">RM{{ (b.totalCost / b.duration).toFixed(2) }}</td>
              <td style="padding:12px; font-weight:700; color:#7c3aed;">RM{{ b.totalCost.toFixed(2) }}</td>
              <td style="padding:12px;">
                <span class="badge-status" :class="b.status === 'confirmed' || b.status === 'completed' ? 'status-completed' : (b.status === 'pending' ? 'status-pending' : 'status-inprogress')" style="text-transform: capitalize; border-radius: 12px; padding: 4px 10px !important; font-weight: 700;">
                  {{ b.status }}
                </span>
              </td>
              <td style="padding:12px;">
                <span :style="b.paymentStatus === 'paid' ? {color:'#10b981', fontWeight:'700'} : {color:'#ef4444', fontWeight:'700'}">
                  {{ b.paymentStatus === 'paid' ? 'Paid' : 'Unpaid' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="!analyticsLoading" style="text-align:center; padding:32px; color:#7b7597; background:#faf9fe; border-radius:20px; border:1px dashed #efeefc; font-size:0.85rem;">
        No student bookings matching search criteria found.
      </div>
    </div>
  `;

  PrepPalCore.mountApp({
    template: userRole === 'Tutor' ? tutorTemplate : template,
    data() {
      return {
        userRole,
        tutorBookings: [],
        analyticsSearch: '',
        analyticsRecords: [],
        skillGaps: [],
        analyticsLoading: false,
        analyzingSkillGaps: false,
        errorMsg: '',

        // Form toggles
        showLogForm: false,

        // Form data
        newLog: {
          subject: '',
          date: new Date().toISOString().substring(0, 10),
          study_minutes: '',
          modules_completed: '',
          mastery: '',
          quiz_score: ''
        }
      };
    },
    computed: {
      totalStudyMinutes() {
        return (this.analyticsRecords || []).reduce((total, r) => total + Number(r.study_minutes || 0), 0);
      },
      averageQuizScore() {
        const recordsWithScore = (this.analyticsRecords || []).filter(r => r.quiz_score !== null && r.quiz_score !== undefined);
        if (!recordsWithScore.length) return 0;
        const total = recordsWithScore.reduce((sum, r) => sum + Number(r.quiz_score), 0);
        return Math.round(total / recordsWithScore.length);
      },
      averageMastery() {
        const records = this.analyticsRecords || [];
        if (!records.length) return 0;
        const total = records.reduce((sum, r) => sum + Number(r.mastery || 0), 0);
        return Math.round(total / records.length);
      },
      filteredAnalyticsRecords() {
        const query = (this.analyticsSearch || '').trim().toLowerCase();
        return (this.analyticsRecords || []).filter(record => {
          const subject = (record.subject || record.date || '').toLowerCase();
          const mastery = String(record.mastery || '');
          const quizScore = String(record.quiz_score !== null && record.quiz_score !== undefined ? record.quiz_score : '');
          const studyMinutes = String(record.study_minutes || '');
          const modules = String(record.modules_completed || '');
          return !query ||
            subject.includes(query) ||
            mastery.includes(query) ||
            quizScore.includes(query) ||
            studyMinutes.includes(query) ||
            modules.includes(query);
        });
      },

      // Tutor Analytics Computed Properties
      filteredTutorBookings() {
        const query = (this.analyticsSearch || '').trim().toLowerCase();
        return (this.tutorBookings || []).filter(b => {
          const studentName = (b.student.name || '').toLowerCase();
          const studentEmail = (b.student.email || '').toLowerCase();
          const dateStr = (b.date || '').toLowerCase();
          return !query ||
            studentName.includes(query) ||
            studentEmail.includes(query) ||
            dateStr.includes(query);
        });
      },
      paidBookingsCount() {
        return (this.tutorBookings || []).filter(b => b.paymentStatus === 'paid').length;
      },
      paidBookingsPercent() {
        if (!this.tutorBookings.length) return 0;
        return Math.round((this.paidBookingsCount / this.tutorBookings.length) * 100);
      },
      uniqueStudentsCount() {
        const ids = (this.tutorBookings || []).map(b => b.student.id || b.studentId);
        return new Set(ids).size;
      },
      totalHoursTaught() {
        return (this.tutorBookings || [])
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((total, b) => total + Number(b.duration || 0), 0);
      },
      tutorEarnings() {
        return (this.tutorBookings || [])
          .filter(b => b.paymentStatus === 'paid' && (b.status === 'confirmed' || b.status === 'completed'))
          .reduce((total, b) => total + Number(b.totalCost || 0), 0);
      }
    },
    methods: {
      formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      },
      async loadAnalyticsData() {
        this.analyticsLoading = true;
        this.errorMsg = '';
        try {
          if (this.userRole === 'Tutor') {
            const bookings = await api.getStudentBookings();
            this.tutorBookings = bookings || [];
          } else {
            const records = await api.getAnalyticsRecords();
            this.analyticsRecords = records;
            
            const storedGaps = localStorage.getItem('preppal_skillgaps');
            if (storedGaps) {
              this.skillGaps = JSON.parse(storedGaps);
            } else {
              this.skillGaps = records
                .filter(r => r.skill_gap === true || r.mastery < 70 || (r.quiz_score !== null && r.quiz_score < 70))
                .map(r => ({
                  subject: r.subject.replace('Quiz: ', '').replace('Deck: ', ''),
                  reason: `Performance score of ${r.quiz_score || r.mastery}% is below targeted 70%. Needs practice.`,
                  status: (r.quiz_score || r.mastery) < 60 ? 'Critical' : 'Weak'
                }));
            }
          }
        } catch (err) {
          console.error(err);
          this.errorMsg = 'Failed to sync performance analytics with backend REST server.';
        } finally {
          this.analyticsLoading = false;
        }
      },
      async logSession() {
        if (!this.newLog.subject || !this.newLog.date || !this.newLog.study_minutes || !this.newLog.mastery) {
          alert('Please enter Subject, Date, Study Minutes, and Mastery Level.');
          return;
        }
        try {
          const created = await api.createAnalyticsRecord({
            subject: this.newLog.subject,
            date: this.newLog.date,
            study_minutes: Number(this.newLog.study_minutes),
            modules_completed: Number(this.newLog.modules_completed || 0),
            mastery: Number(this.newLog.mastery),
            quiz_score: this.newLog.quiz_score !== '' ? Number(this.newLog.quiz_score) : null
          });
          this.analyticsRecords.unshift(created);
          
          this.newLog = {
            subject: '',
            date: new Date().toISOString().substring(0, 10),
            study_minutes: '',
            modules_completed: '',
            mastery: '',
            quiz_score: ''
          };
          this.showLogForm = false;
        } catch (err) {
          alert('Failed to log study session: ' + err.message);
        }
      },
      async runSkillGapAnalysis() {
        this.analyzingSkillGaps = true;
        try {
          const gaps = await api.generateSkillGaps();
          this.skillGaps = gaps;
          localStorage.setItem('preppal_skillgaps', JSON.stringify(gaps));
        } catch (err) {
          alert('Failed to perform AI Skill Gap Analysis: ' + err.message);
        } finally {
          this.analyzingSkillGaps = false;
        }
      },
      goToTutors() {
        window.location.href = '../../views/tutors/tutors_index.html';
      }
    },
    mounted() {
      this.loadAnalyticsData();
    }
  });
})();
