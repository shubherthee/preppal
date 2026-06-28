// js/pages/planner.js
// Study Planner & Reminder page: manage plans, reminders, resources, and AI schedule.

(function () {
  const api = PrepPalAPI;

  // Inject custom stylesheet dynamically to prevent style loss/stripping issues by Vue template compiler
  const styles = `
    /* Spacious UI Inspiration Style Overrides */
    .app-shell {
      background: linear-gradient(135deg, #fff1f2 0%, #e0f2fe 100%) !important;
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
      color: #1e3a8a !important;
      letter-spacing: -0.7px;
      font-size: 2.2rem;
    }
    h2, .section-title {
      font-family: 'Sora', sans-serif !important;
      font-weight: 700 !important;
      color: #1e3a8a !important;
      font-size: 1.25rem;
      margin-bottom: 4px;
    }
    p {
      font-family: 'DM Sans', sans-serif !important;
      color: #574e7d !important;
      font-size: 0.9rem;
    }

    /* Premium Rounded Cards (Inspiration-Spec) */
    .card {
      background: #ffffff !important;
      border: 1px solid rgba(219, 39, 119, 0.15) !important;
      border-radius: 28px !important;
      box-shadow: 0 10px 40px rgba(37, 99, 235, 0.02), 0 10px 40px rgba(219, 39, 119, 0.02) !important;
      padding: 28px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 45px rgba(219, 39, 119, 0.08) !important;
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
      border: 1px solid rgba(219, 39, 119, 0.15) !important;
      box-shadow: 0 4px 14px rgba(219, 39, 119, 0.04) !important;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .circle-btn:hover {
      background: #fdf2f8 !important;
      border-color: #fbcfe8 !important;
      transform: scale(1.05);
    }

    /* Custom Form Inputs */
    input, select, textarea {
      border: 1px solid #dbeafe !important;
      background: #fdfcff !important;
      border-radius: 14px !important;
      outline: none !important;
      color: #1e3a8a !important;
      padding: 10px 14px !important;
      font-family: inherit !important;
      font-size: 0.9rem !important;
      transition: all 0.2s ease !important;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
      background: #ffffff !important;
    }

    /* Premium Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #f472b6 0%, #db2777 100%) !important;
      border: none !important;
      color: white !important;
      border-radius: 50px !important;
      font-weight: 700 !important;
      padding: 12px 28px !important;
      box-shadow: 0 6px 18px rgba(219, 39, 119, 0.2) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      cursor: pointer !important;
      width: auto !important;
    }
    .btn-primary:hover {
      transform: scale(1.05) translateY(-2px) !important;
      box-shadow: 0 10px 24px rgba(219, 39, 119, 0.35) !important;
    }
    .btn-secondary {
      background: #eff6ff !important;
      border: 2px solid #dbeafe !important;
      color: #2563eb !important;
      border-radius: 50px !important;
      font-weight: 700 !important;
      padding: 10px 26px !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.04) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      cursor: pointer !important;
    }
    .btn-secondary:hover {
      background: #dbeafe !important;
      border-color: #bfdbfe !important;
      transform: scale(1.05) translateY(-2px) !important;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08) !important;
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

    /* Timer Mode Tabs */
    .timer-tabs-wrap {
      display: flex !important;
      gap: 6px !important;
      margin-bottom: 30px !important;
      padding: 6px !important;
      background: #f1f5f9 !important;
      border: 1px solid rgba(37, 99, 235, 0.15) !important;
      border-radius: 30px !important;
    }
    .timer-mode-btn {
      padding: 10px 24px !important;
      border-radius: 30px !important;
      border: none !important;
      background: transparent !important;
      font-size: 0.85rem !important;
      font-weight: 700 !important;
      color: #64748b !important;
      cursor: pointer !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
    .timer-mode-btn:hover {
      transform: scale(1.05) !important;
    }
    .timer-mode-btn.active {
      color: #ffffff !important;
      transform: scale(1.05) !important;
    }
    /* Shades of blue for active and hover states of focus mode buttons */
    .timer-mode-btn.mode-pomodoro:hover {
      color: #2563eb !important;
    }
    .timer-mode-btn.mode-pomodoro.active {
      background: #2563eb !important;
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25) !important;
    }
    .timer-mode-btn.mode-stopwatch:hover {
      color: #3b82f6 !important;
    }
    .timer-mode-btn.mode-stopwatch.active {
      background: #3b82f6 !important;
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25) !important;
    }
    .timer-mode-btn.mode-tracking:hover {
      color: #1d4ed8 !important;
    }
    .timer-mode-btn.mode-tracking.active {
      background: #1d4ed8 !important;
      box-shadow: 0 6px 16px rgba(29, 78, 216, 0.25) !important;
    }

    /* Round Arrow/Action Buttons */
    .arrow-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      background: #ffffff !important;
      border: none !important;
      color: #db2777 !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(219, 39, 119, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      padding: 0 !important;
    }
    .arrow-btn:hover {
      transform: scale(1.15) translateY(-1px) !important;
      background: #db2777 !important;
      color: #ffffff !important;
      box-shadow: 0 6px 14px rgba(219, 39, 119, 0.2) !important;
    }
    .pastel-color-dot {
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
      border: 2px solid transparent !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      padding: 0 !important;
    }
    .pastel-color-dot.active {
      border-color: #db2777 !important;
      transform: scale(1.25) !important;
      box-shadow: 0 0 12px rgba(219, 39, 119, 0.4) !important;
    }
    .pastel-color-dot:hover {
      transform: scale(1.2) !important;
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
    
    /* Premium Activity Blocks for list items */
    .activity-block {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff !important;
      border: 1px solid rgba(219, 39, 119, 0.1) !important;
      border-radius: 18px !important;
      padding: 16px 20px !important;
      margin-bottom: 12px !important;
      box-shadow: 0 4px 12px rgba(219, 39, 119, 0.01) !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
    .activity-block:hover {
      transform: translateY(-2px) scale(1.01) !important;
      box-shadow: 0 8px 20px rgba(219, 39, 119, 0.04) !important;
    }
    
    /* Left accent color coding per block theme */
    .activity-block-pink {
      border-left: 5px solid #db2777 !important;
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
    }
    .activity-block-pink:hover {
      border-color: rgba(219, 39, 119, 0.5) !important;
      border-left-color: #db2777 !important;
    }
    
    .activity-block-blue {
      border-left: 5px solid #3b82f6 !important;
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
    }
    .activity-block-blue:hover {
      border-color: rgba(59, 130, 246, 0.5) !important;
      border-left-color: #3b82f6 !important;
    }

    .activity-block-amber {
      border-left: 5px solid #f59e0b !important;
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
    }
    .activity-block-amber:hover {
      border-color: rgba(245, 158, 11, 0.5) !important;
      border-left-color: #f59e0b !important;
    }

    .activity-block-purple {
      border-left: 5px solid #8b5cf6 !important;
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
    }
    .activity-block-purple:hover {
      border-color: rgba(139, 92, 246, 0.5) !important;
      border-left-color: #8b5cf6 !important;
    }

    /* Tutor Calendar Styles */
    .tutor-calendar-day:hover:not(.active) {
      background: #eff6ff !important;
      border-color: #bfdbfe !important;
      transform: scale(1.05);
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const template = `
    <div class="topbar" style="margin-bottom: 28px;">
      <div class="search-wrap" style="background:#ffffff; border: 1px solid rgba(219, 39, 119, 0.15); border-radius:24px; box-shadow:0 4px 16px rgba(219,39,119,0.02);">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#db2777" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          type="text"
          v-model="plannerSearch"
          placeholder="Search study goals, deadlines, or status..."
          style="border:none !important; background:transparent !important; box-shadow:none !important; padding:4px 8px !important;"
        />
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="circle-btn" style="position:relative; border-color: rgba(219, 39, 119, 0.15);" title="Reminders Alert">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="#db2777" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-dot" v-if="reminders.length" style="position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: #ff6b7a; border: 1.5px solid #ffffff;"></span>
        </div>
        <div class="topbar-avatar" style="background: linear-gradient(135deg, #db2777, #3b82f6); border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.15);">{{ initials }}</div>
      </div>
    </div>

    <!-- Greetings Area -->
    <div class="greeting" style="margin-bottom: 28px;">
      <h1>Study Planner</h1>
      <p>Organize your study goals, track session timings, and view AI recommendations.</p>
    </div>

    <!-- Statistics Overview Row -->
    <div class="stats-row" style="margin-bottom: 28px;">
      <!-- Goals Card -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #fff1f2; border: 1px solid rgba(251, 207, 232, 0.6); box-shadow: 0 8px 30px rgba(219, 39, 119, 0.02);">
        <div style="background:#ffffff; color:#db2777; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.05);">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #db2777; line-height: 1.1;">{{ plannerTasks.length }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #db2777; opacity: 0.8; margin-top: 2px; font-weight: 600;">Active Tasks</div>
        </div>
      </div>

      <!-- Reminders Card -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1px solid rgba(191, 219, 254, 0.6); box-shadow: 0 8px 30px rgba(37, 99, 235, 0.02);">
        <div style="background:#ffffff; color:#1d4ed8; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #1d4ed8; line-height: 1.1;">{{ reminders.filter(r => r.status === 'Active' || r.status === 'Set').length }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #1d4ed8; opacity: 0.8; margin-top: 2px; font-weight: 600;">Reminders Set</div>
        </div>
      </div>

      <!-- Materials Card -->
      <div class="stat-card" style="padding: 24px; border-radius: 24px; display: flex; align-items: center; gap: 16px; background: #faf5ff; border: 1px solid rgba(233, 213, 255, 0.6); box-shadow: 0 8px 30px rgba(139, 92, 246, 0.02);">
        <div style="background:#ffffff; color:#8b5cf6; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.05);">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <div class="stat-val" style="font-size: 1.8rem; font-weight: 700; color: #8b5cf6; line-height: 1.1;">{{ materials.length }}</div>
          <div class="stat-label" style="font-size: 0.8rem; color: #8b5cf6; opacity: 0.8; margin-top: 2px; font-weight: 600;">Syllabus Files</div>
        </div>
      </div>
    </div>

    <!-- Centered Glass Focus & Study Timer Card -->
    <div class="card" style="margin-bottom: 32px; padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; background: linear-gradient(135deg, rgba(253, 242, 248, 0.8) 0%, rgba(239, 246, 255, 0.8) 100%) !important; border: 1px solid rgba(219, 39, 119, 0.15) !important;">
      <div style="display:flex; flex-direction:column; align-items:center; margin-bottom: 24px;">
        <div style="display:flex; align-items:center; gap:10px; justify-content:center;">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="#db2777" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h2 style="margin:0; font-size:1.4rem; color:#1e3a8a;">Study Focus Timer</h2>
        </div>
        <p style="margin:8px 0 0 0; font-size:0.88rem; max-width: 500px; color:#574e7d;">Boost focus using the Pomodoro technique or manual tracking sessions.</p>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="timer-tabs-wrap">
        <button class="timer-mode-btn mode-pomodoro" :class="{ active: timerMode === 'pomodoro' }" @click="setTimerMode('pomodoro')">Pomodoro</button>
        <button class="timer-mode-btn mode-stopwatch" :class="{ active: timerMode === 'stopwatch' }" @click="setTimerMode('stopwatch')">Stopwatch</button>
        <button class="timer-mode-btn mode-tracking" :class="{ active: timerMode === 'tracking' }" @click="setTimerMode('tracking')">Custom Tracker</button>
      </div>

      <!-- Glassmorphic Clock Circle with Pastel Tint -->
      <div 
        :style="timerCircleStyle" 
        style="width: 220px; height: 220px; border-radius: 50%; border: 4px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
      >
        <!-- Dynamic Session Type Label for Pomodoro Mode -->
        <div v-if="timerMode === 'pomodoro'" style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;" :style="{ color: pomodoroSessionType === 'work' ? '#db2777' : '#2563eb' }">
          {{ pomodoroSessionType === 'work' ? 'Study Block' : 'Break Block' }}
        </div>
        
        <div style="font-size: 2.8rem; font-weight: 700; font-family:'Sora',sans-serif; color:#1e3a8a; letter-spacing: -1.2px; line-height: 1;">
          {{ formattedTime }}
        </div>
        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #574e7d; font-weight: 700; margin-top: 4px;">
          {{ timerState === 'running' ? 'Focusing' : timerState === 'paused' ? 'Paused' : 'Ready' }}
        </div>
        
        <!-- Floating badge showing subject -->
        <div 
          :style="{ background: timerMode === 'pomodoro' ? (pomodoroSessionType === 'work' ? '#db2777' : '#2563eb') : timerColor }" 
          style="position: absolute; bottom: -10px; color: white; padding: 6px 18px; border-radius: 24px; font-size: 0.78rem; font-weight: 600; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.12); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        >
          {{ timerMode === 'pomodoro' ? (pomodoroSessionType === 'work' ? 'Study: ' + activeSubjectDisplay : 'Break Block') : activeSubjectDisplay }}
        </div>
      </div>

      <!-- Settings configuration panel -->
      <div style="display:flex; justify-content:center; gap:20px; align-items:center; flex-wrap:wrap; margin-top:36px; margin-bottom:20px;">
        <!-- Subject Selection -->
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.85rem; font-weight:600; color:#574e7d;">Subject:</span>
          <select v-model="timerSubject" style="width:170px; padding:10px 14px !important; border-radius:14px !important; border:1px solid #dbeafe !important; background:#fdfcff !important; color:#1e3a8a !important; outline:none !important; cursor:pointer;">
            <option v-for="sub in subjectsList" :key="sub" :value="sub">{{ sub }}</option>
          </select>
          <input v-if="timerSubject === 'Other'" type="text" v-model="customSubjectName" placeholder="Subject Name" style="width:130px; padding:10px 14px !important; border-radius:14px !important; border:1px solid #dbeafe !important; background:#fdfcff !important; color:#1e3a8a !important; outline:none !important;" />
        </div>

        <!-- Pomodoro Work & Break Duration Customization -->
        <div v-if="timerMode === 'pomodoro'" style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.85rem; font-weight:600; color:#574e7d;">Study (min):</span>
            <input type="number" v-model.number="pomodoroWorkDuration" min="1" max="180" style="width:75px; padding:10px 14px !important; border-radius:14px !important; border:1px solid #dbeafe !important; background:#fdfcff !important; color:#1e3a8a !important; outline:none !important;" @change="resetTimer" />
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.85rem; font-weight:600; color:#574e7d;">Break (min):</span>
            <input type="number" v-model.number="pomodoroBreakDuration" min="1" max="180" style="width:75px; padding:10px 14px !important; border-radius:14px !important; border:1px solid #dbeafe !important; background:#fdfcff !important; color:#1e3a8a !important; outline:none !important;" @change="resetTimer" />
          </div>
          <!-- Manual session toggle -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.85rem; font-weight:600; color:#574e7d;">Session:</span>
            <select v-model="pomodoroSessionType" style="padding:10px 14px !important; border-radius:14px !important; border:1px solid #dbeafe !important; background:#fdfcff !important; color:#1e3a8a !important; outline:none !important; cursor:pointer;" @change="resetTimer">
              <option value="work">Study Block</option>
              <option value="break">Break Block</option>
            </select>
          </div>
        </div>

        <!-- Custom Duration Input if mode is custom tracking -->
        <div v-if="timerMode === 'tracking'" style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.85rem; font-weight:600; color:#574e7d;">Duration (min):</span>
          <input type="number" v-model.number="timerCustomDuration" min="1" max="180" style="width:85px; padding:10px 14px !important; border-radius:14px !important; border:1px solid #dbeafe !important; background:#fdfcff !important; color:#1e3a8a !important; outline:none !important;" @change="resetTimer" />
        </div>
      </div>

      <!-- Color Selector Picker (Pastel Theme spec) -->
      <div style="display:flex; flex-direction:column; align-items:center; gap:10px; margin-bottom:30px;">
        <span style="font-size:0.85rem; font-weight:600; color:#574e7d;">Choose Focus Theme Color:</span>
        <div style="display:flex; gap:12px; align-items:center;">
          <button 
            v-for="color in timerColorOptions" 
            :key="color.value"
            @click="timerColor = color.value"
            class="pastel-color-dot"
            :class="{ active: timerColor === color.value }"
            :style="{ background: color.value }"
            :title="color.label"
          ></button>
        </div>
      </div>

      <!-- Controls Buttons -->
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
        <button v-if="timerState === 'idle' || timerState === 'paused'" class="btn-primary" :style="{ background: 'linear-gradient(135deg, ' + (timerMode === 'pomodoro' ? (pomodoroSessionType === 'work' ? '#db2777' : '#2563eb') : timerColor) + ', ' + (timerMode === 'pomodoro' ? (pomodoroSessionType === 'work' ? '#be185d' : '#1d4ed8') : timerColor + 'dd') + ') !important', boxShadow: '0 6px 18px ' + (timerMode === 'pomodoro' ? (pomodoroSessionType === 'work' ? '#db2777' : '#2563eb') : timerColor) + '40 !important' }" style="min-width: 150px;" @click="startTimer">
          {{ timerMode === 'pomodoro' ? (pomodoroSessionType === 'work' ? 'Start Study' : 'Start Break') : 'Start Focus' }}
        </button>
        <button v-if="timerState === 'running'" class="btn-primary" style="min-width: 150px; background: linear-gradient(135deg, #fbbf24, #d97706) !important; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25) !important;" @click="pauseTimer">
          Pause Focus
        </button>
        <button class="btn-secondary" style="min-width: 100px;" @click="resetTimer">
          Reset
        </button>
        <button v-if="shouldShowSave" class="btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.2) !important;" @click="saveTimerSession">
          Save Focus Session
        </button>
      </div>
      
      <div style="margin-top:20px; height: 16px; font-size:0.85rem; color:#db2777; font-weight: 500; font-style:italic;">
        <span v-if="timerState === 'running'">Your focus block is ticking. Remain concentrated...</span>
      </div>
    </div>

    <!-- Tutor Consultations Banner -->
    <div class="card" style="margin-bottom: 32px; padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #fce7f3 0%, #eff6ff 100%) !important; border: 1px solid rgba(219, 39, 119, 0.15) !important; border-radius: 24px !important; box-shadow: 0 8px 30px rgba(219, 39, 119, 0.04) !important; gap: 20px; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 20px; min-width: 280px; flex: 1;">
        <div style="background: #ffffff; color: #db2777; display: flex; align-items: center; justify-content: center; width: 54px; height: 54px; border-radius: 50%; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.12); flex-shrink: 0;">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div style="text-align: left;">
          <h3 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.1rem; color: #1e3a8a; font-weight: 700;">Tutor Consultations</h3>
          <p style="margin: 4px 0 0 0; color: #574e7d; font-size: 0.88rem; font-weight: 500;">Struggling with a topic? Book a live 1-on-1 session with an expert tutor now.</p>
        </div>
      </div>
      <button class="btn-primary" style="padding: 12px 28px; font-size: 0.9rem; border-radius: 50px; background: linear-gradient(135deg, #f472b6, #db2777) !important; color: #ffffff !important; box-shadow: 0 6px 18px rgba(219, 39, 119, 0.25) !important;" @click="goToTutors">
        Explore Tutors & Book Session
      </button>
    </div>

    <!-- Bottom spacious grid -->
    <div class="bottom-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
      
      <!-- Left Column: Tasks & Reminders -->
      <div style="display:flex; flex-direction:column; gap:32px;">
        
        <!-- Study Plan Tasks Card -->
        <div class="card" style="border: 1px solid rgba(219, 39, 119, 0.25) !important; box-shadow: 0 10px 40px rgba(219, 39, 119, 0.03) !important;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap;">
            <div>
              <h2 style="margin:0;">Active Study Tasks</h2>
              <p style="margin:2px 0 0 0;">Manage tasks, deadlines, and tracking states.</p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #f472b6 0%, #db2777 100%) !important; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.2) !important; border: none !important; color: white !important;" @click="showAddPlanForm = !showAddPlanForm">
                {{ showAddPlanForm ? 'Close' : '+ Add Task' }}
              </button>
              <button class="btn-secondary" style="padding:8px 20px; font-size:0.85rem; border-radius:12px;" @click="loadPlannerData">
                Refresh
              </button>
            </div>
          </div>

          <!-- Add Task Form inside Card -->
          <div v-if="showAddPlanForm" class="card" style="box-shadow:none; background:#fbfaff !important; border:1px solid #e1dbf3 !important; margin-bottom:20px; padding:20px; border-radius: 20px;">
            <h3 style="margin-top:0; margin-bottom:14px; font-size:1rem; color:#1e3a8a; font-family:'Sora',sans-serif; font-weight:700;">New Study Goal</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#574e7d; margin-bottom:4px; font-weight: 600;">Task Name</label>
                <input type="text" v-model="newPlan.task" placeholder="e.g. Mathematics HW" style="width:100%;" />
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#574e7d; margin-bottom:4px; font-weight: 600;">Deadline</label>
                <input type="date" v-model="newPlan.deadline" style="width:100%;" />
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size:0.75rem; color:#574e7d; font-weight: 600;">Status:</label>
                <select v-model="newPlan.status" style="padding:6px 12px; border-radius:10px;">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #f472b6 0%, #db2777 100%) !important; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.2) !important; border: none !important; color: white !important;" @click="createPlan">Save Goal</button>
            </div>
          </div>

          <!-- Tasks list -->
          <div v-if="plannerLoading" style="text-align:center; padding:20px; color:#574e7d;">
            Loading active tasks...
          </div>
          <div v-if="errorMsg" class="error-msg" style="margin-bottom:12px;">
            {{ errorMsg }}
          </div>

          <div v-if="!plannerLoading && filteredPlannerTasks.length" style="margin-top:10px;">
            <div 
              v-for="(task, index) in filteredPlannerTasks" 
              :key="task.plan_id"
              class="activity-block activity-block-pink" 
            >
              <div style="flex-grow:1; padding-right:16px;">
                <div style="font-weight:700; font-size:0.95rem; display:flex; align-items:center; gap:8px;" :style="task.status === 'Completed' ? 'text-decoration: line-through; opacity: 0.55;' : ''">
                  <svg v-if="task.status === 'Completed'" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color:#db2777; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color:#db2777; flex-shrink:0;"><circle cx="12" cy="12" r="10"/></svg>
                  <span>{{ task.task }}</span>
                </div>
                <div style="font-size:0.75rem; opacity: 0.8; margin-top:6px; font-weight: 500; display:flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Deadline: {{ formatDate(task.deadline) }}</span>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:12px; flex-shrink: 0;">
                <span class="badge-status" :class="{
                  'status-completed': task.status === 'Completed',
                  'status-pending': task.status === 'Pending',
                  'status-inprogress': task.status === 'In Progress',
                  'status-scheduled': task.status === 'Scheduled'
                }">{{ task.status }}</span>
                
                <select v-model="task.status" @change="updatePlanStatus(task)" style="padding:6px 12px !important; font-size:0.78rem !important; border-radius:10px !important; border:1px solid rgba(219, 39, 119, 0.2) !important; cursor:pointer !important; background: #ffffff !important; color:#1e3a8a !important; outline:none !important;">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
                <button class="arrow-btn" @click="deletePlan(task.plan_id)" title="Delete Task" style="background:#ffffff; color:#db2777;">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="!plannerLoading && !errorMsg && !filteredPlannerTasks.length" style="text-align:center; color:#574e7d; padding:30px; background:rgba(255,255,255,0.4); border-radius:20px; font-size: 0.88rem; border: 1px dashed rgba(219, 39, 119, 0.2);">
            No study goals registered yet.
          </div>
        </div>

        <!-- Reminders Card -->
        <div class="card" style="border: 1px solid rgba(37, 99, 235, 0.25) !important; box-shadow: 0 10px 40px rgba(37, 99, 235, 0.03) !important;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
            <div>
              <h2 style="margin:0;">Reminders</h2>
              <p style="margin:2px 0 0 0;">Manage upcoming sessions and reviews.</p>
            </div>
            <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%) !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15) !important; border: none !important; color: white !important;" @click="showAddReminderForm = !showAddReminderForm">
              {{ showAddReminderForm ? 'Cancel' : '+ Add Reminder' }}
            </button>
          </div>

          <!-- Add Reminder Form inside Card -->
          <div v-if="showAddReminderForm" class="card" style="box-shadow:none; background:#fbfaff !important; border:1px solid #dbeafe !important; margin-bottom:20px; padding:20px; border-radius: 20px;">
            <div style="margin-bottom:12px;">
              <input type="text" v-model="newReminder.title" placeholder="e.g. Biology Quiz Review" style="width:100%;" />
            </div>
            <div style="margin-bottom:12px;">
              <input type="datetime-local" v-model="newReminder.time" style="width:100%;" />
            </div>
            <div style="text-align:right;">
              <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%) !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15) !important; border: none !important; color: white !important;" @click="createReminder">Set Reminder</button>
            </div>
          </div>

          <div v-if="reminders.length" style="display:flex; flex-direction:column;">
            <div 
              v-for="(rem, index) in reminders" 
              :key="rem.id" 
              class="activity-block activity-block-blue" 
            >
              <div style="flex-grow:1; padding-right:12px;">
                <div style="font-weight:700; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #2563eb; flex-shrink: 0;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span>{{ rem.title }}</span>
                </div>
                <div style="font-size:0.75rem; opacity:0.8; margin-top:6px; font-weight: 500; display:flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{{ rem.time }}</span>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:12px; flex-shrink:0;">
                <span class="badge-status status-scheduled" style="font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:12px; background:#ffffff;">{{ rem.status }}</span>
                <button class="arrow-btn" @click="deleteReminder(rem.id)" title="Delete Reminder" style="background:#ffffff; color:#db2777;">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else style="text-align:center; color:#574e7d; padding:30px; background:rgba(255,255,255,0.4); border-radius:20px; font-size: 0.88rem; border: 1px dashed rgba(37, 99, 235, 0.2);">
            No reminders scheduled.
          </div>
        </div>

      </div>

      <!-- Right Column: Materials & AI Recommendations -->
      <div style="display:flex; flex-direction:column; gap:32px;">
        
        <!-- AI Recommendations Card -->
        <div class="card" style="border: 1px solid rgba(37, 99, 235, 0.25) !important; box-shadow: 0 10px 40px rgba(37, 99, 235, 0.03) !important;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
            <h2 style="margin:0;">AI Planner</h2>
            <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%) !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15) !important; border: none !important; color: white !important;" @click="generateSchedule" :disabled="generatingSchedule">
              {{ generatingSchedule ? 'Analyzing...' : 'Generate' }}
            </button>
          </div>
          <p style="margin-bottom:20px;">AI recommended study block schedule mapped directly to active goals.</p>

          <div v-if="generatingSchedule" style="text-align:center; padding:20px; background:rgba(255,255,255,0.4); border-radius:20px; font-size:0.85rem;">
            Analyzing goals and plotting sessions...
          </div>

          <div v-else-if="aiSchedule.length" style="display:flex; flex-direction:column;">
            <div 
              v-for="(item, idx) in aiSchedule" 
              :key="idx" 
              class="activity-block activity-block-blue"
              style="align-items: flex-start; flex-direction: column; gap: 6px; padding: 16px;"
            >
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span style="font-weight:800; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px; color: #1d4ed8;">{{ item.day }}</span>
                <span style="font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:8px; background:#ffffff; color: #1d4ed8;">{{ item.hours }}</span>
              </div>
              <div style="font-size:0.85rem; line-height:1.4; font-weight: 500; color: #1e3a8a;">{{ item.task }}</div>
            </div>
          </div>
          <div v-else style="text-align:center; color:#574e7d; padding:24px; background:rgba(255,255,255,0.4); border-radius:20px; font-size:0.85rem; border: 1px dashed rgba(37, 99, 235, 0.2);">
            Click Generate to query the AI scheduler.
          </div>
        </div>

        <!-- Reference Materials Card -->
        <div class="card" style="border: 1px solid rgba(219, 39, 119, 0.25) !important; box-shadow: 0 10px 40px rgba(219, 39, 119, 0.03) !important;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <h2 style="margin:0;">Syllabus Materials</h2>
            <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #f472b6 0%, #db2777 100%) !important; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.15) !important; border: none !important; color: white !important;" @click="showAddMaterialForm = !showAddMaterialForm">
              {{ showAddMaterialForm ? 'Cancel' : '+ File' }}
            </button>
          </div>
          <p style="margin-bottom:20px;">Reference slides, formula sheets, and study files.</p>

          <!-- Add Material Form inside Card -->
          <div v-if="showAddMaterialForm" class="card" style="box-shadow:none; background:#fbfaff !important; border:1px solid #e1dbf3 !important; margin-bottom:16px; padding:14px; border-radius: 20px;">
            <div style="margin-bottom:10px;">
              <input type="text" v-model="newMaterial.filename" placeholder="e.g. Biology_Slide_Deck.pdf" style="width:100%;" />
            </div>
            <div style="margin-bottom:10px;">
              <input type="text" v-model="newMaterial.description" placeholder="Short description" style="width:100%;" />
            </div>
            <div style="text-align:right;">
              <button class="btn-primary" style="padding:10px 24px; font-size:0.85rem; border-radius:50px !important; background: linear-gradient(135deg, #f472b6 0%, #db2777 100%) !important; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.15) !important; border: none !important; color: white !important;" @click="createMaterial">Save File</button>
            </div>
          </div>

          <div v-if="materials.length" style="display:flex; flex-direction:column;">
            <div 
              v-for="mat in materials" 
              :key="mat.id" 
              class="activity-block activity-block-pink" 
              style="flex-direction: column; align-items: flex-start; padding: 16px;"
            >
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; width: 100%;">
                <div style="font-weight:700; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display: flex; align-items: center; gap: 8px; color: #db2777;">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>{{ mat.filename }}</span>
                </div>
                <span style="font-size:0.7rem; opacity:0.8; white-space:nowrap; font-weight: 600; color: #db2777;">{{ formatDate(mat.created_at) }}</span>
              </div>
              <div style="font-size:0.78rem; opacity:0.8; margin-top:6px; padding-left:24px; font-weight: 500; color: #574e7d;">{{ mat.description }}</div>
            </div>
          </div>
          <div v-else style="text-align:center; color:#574e7d; padding:24px; background:rgba(255,255,255,0.4); border-radius:20px; font-size:0.85rem; border: 1px dashed rgba(219, 39, 119, 0.2);">
            No syllabus materials uploaded.
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
      <div class="search-wrap" style="background:#ffffff; border: 1px solid rgba(219, 39, 119, 0.15); border-radius:24px; box-shadow:0 4px 16px rgba(219,39,119,0.02);">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#db2777" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          type="text"
          v-model="plannerSearch"
          placeholder="Search bookings or students..."
          style="border:none !important; background:transparent !important; box-shadow:none !important; padding:4px 8px !important;"
        />
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="topbar-avatar" style="background: linear-gradient(135deg, #db2777, #f472b6); border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.15);">{{ initials }}</div>
      </div>
    </div>

    <!-- Tutor View -->
    <div class="tutor-planner-layout" style="display: flex; flex-direction: column; gap: 28px;">
      <!-- Stats Row -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 8px;">
        <div class="card" style="padding: 24px; border-radius: 24px; background: #eff6ff !important; border: 1px solid rgba(59, 130, 246, 0.15) !important; display: flex; align-items: center; gap: 16px; margin-bottom: 0 !important; text-align: left;">
          <div style="background:#ffffff; color:#2563eb; display:flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; box-shadow:0 4px 12px rgba(37,99,235,0.05); font-size: 1rem; font-weight: bold;">Bk</div>
          <div>
            <div style="font-size: 1.8rem; font-weight:700; color:#1e3a8a; line-height:1.1; font-family:'Sora',sans-serif;">{{ tutorBookings.length }}</div>
            <div style="font-size:0.8rem; color:#2563eb; font-weight:600; margin-top:2px;">Total Bookings</div>
          </div>
        </div>
        <div class="card" style="padding: 24px; border-radius: 24px; background: #e8f7f4 !important; border: 1px solid rgba(16, 185, 129, 0.15) !important; display: flex; align-items: center; gap: 16px; margin-bottom: 0 !important; text-align: left;">
          <div style="background:#ffffff; color:#10b981; display:flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; box-shadow:0 4px 12px rgba(16,185,129,0.05); font-size: 1rem; font-weight: bold;">RM</div>
          <div>
            <div style="font-size: 1.8rem; font-weight:700; color:#115e59; line-height:1.1; font-family:'Sora',sans-serif;">RM{{ tutorEarnings }}</div>
            <div style="font-size:0.8rem; color:#10b981; font-weight:600; margin-top:2px;">Total Earnings</div>
          </div>
        </div>
        <div class="card" style="padding: 24px; border-radius: 24px; background: #fff4e6 !important; border: 1px solid rgba(245, 158, 11, 0.15) !important; display: flex; align-items: center; gap: 16px; margin-bottom: 0 !important; text-align: left;">
          <div style="background:#ffffff; color:#f59e0b; display:flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; box-shadow:0 4px 12px rgba(245,158,11,0.05); font-size: 1rem; font-weight: bold;">Pd</div>
          <div>
            <div style="font-size: 1.8rem; font-weight:700; color:#78350f; line-height:1.1; font-family:'Sora',sans-serif;">{{ tutorPaidSessionsCount }}</div>
            <div style="font-size:0.8rem; color:#d97706; font-weight:600; margin-top:2px;">Paid Sessions</div>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 28px; align-items: start;">
        <!-- Left: Calendar Card -->
        <div class="card" style="padding: 28px; border-radius: 28px; text-align: left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">Schedule Calendar</h2>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="circle-btn" @click="prevMonth" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center;">&lt;</button>
              <span style="font-family:'Sora',sans-serif; font-weight:700; color:#1e3a8a; min-width:120px; text-align:center; font-size: 0.95rem;">{{ currentMonthYearString }}</span>
              <button class="circle-btn" @click="nextMonth" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center;">&gt;</button>
            </div>
          </div>

          <div class="tutor-calendar">
            <div style="display:grid; grid-template-columns: repeat(7, 1fr); text-align:center; font-weight:700; font-size:0.8rem; color:#574e7d; margin-bottom:10px; border-bottom:1px solid #e0f2fe; padding-bottom:8px;">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:8px; text-align:center;">
              <div 
                v-for="day in calendarDays" 
                :key="day.date.toISOString()"
                @click="selectDate(day)"
                style="aspect-ratio: 1.2; border-radius: 14px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; cursor:pointer; border: 1px solid transparent; transition: all 0.2s;"
                :style="[
                  day.isCurrentMonth ? { color: '#1e3a8a' } : { color: '#bfdbfe', opacity: 0.5 },
                  isSameDate(day.date, selectedDate) 
                    ? { background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', color: 'white !important', border: 'none' } 
                    : (day.bookings.length > 0 ? { background: '#eff6ff', borderColor: '#bfdbfe' } : {})
                ]"
                class="tutor-calendar-day"
              >
                <span style="font-size:0.95rem; font-weight:600;" :style="isSameDate(day.date, selectedDate) ? { color: 'white' } : {}">{{ day.date.getDate() }}</span>
                <div v-if="day.bookings.length > 0" style="display:flex; gap:2px; margin-top:4px; justify-content:center; width: 100%;">
                  <span 
                    v-for="b in day.bookings" 
                    :key="b.id" 
                    style="width:5px; height:5px; border-radius:50%; display:inline-block;" 
                    :style="isSameDate(day.date, selectedDate) ? { background: 'white' } : { background: '#2563eb' }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div style="display: flex; flex-direction: column; gap: 28px;">
          <!-- Day Bookings Details -->
          <div class="card" style="padding: 28px; border-radius: 28px; margin-bottom: 0 !important; text-align: left;">
            <h3 style="margin-top:0; font-family:'Sora',sans-serif; color:#1e3a8a; font-size:1.1rem; margin-bottom:4px; font-weight: 700;">Sessions for:</h3>
            <div style="font-size:0.82rem; color:#db2777; font-weight:600; margin-bottom:18px;">{{ formatSelectedDate() }}</div>

            <div v-if="selectedDateBookings.length" style="display:flex; flex-direction:column; gap:12px;">
              <div 
                v-for="b in selectedDateBookings" 
                :key="b.id" 
                style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:16px; display:flex; flex-direction:column; gap:10px; text-align: left;"
              >
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #3b82f6, #60a5fa); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; flex-shrink: 0;">
                    {{ b.student.initials }}
                  </div>
                  <div style="min-width: 0; flex-grow: 1;">
                    <div style="font-weight:700; font-size:0.85rem; color:#1e293b; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">{{ b.student.name }}</div>
                    <div style="font-size:0.7rem; color:#64748b; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">{{ b.student.email }}</div>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1f5f9; padding-top:10px; font-size:0.78rem; font-weight:600;">
                  <div style="color:#2563eb; display:flex; align-items:center; gap:4px;">
                    Time: {{ b.time }} ({{ b.duration }} hr)
                  </div>
                  <div style="color:#10b981;">
                    Earnings: RM{{ b.totalCost }}
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
                  <span class="badge-status status-completed" style="text-transform: capitalize; padding: 2px 8px !important; border-radius: 12px; font-weight: 700;">{{ b.status }}</span>
                  <span style="font-weight:700;" :style="b.paymentStatus === 'paid' ? {color:'#10b981'} : {color:'#ef4444'}">
                    {{ b.paymentStatus === 'paid' ? 'Paid' : 'Unpaid' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else style="text-align:center; padding:24px; color:#574e7d; background:#fbfbfe; border-radius:18px; border:1px dashed #bfdbfe; font-size:0.82rem;">
              No bookings scheduled for this day.
            </div>
          </div>

          <!-- Upcoming Bookings Summary -->
          <div class="card" style="padding: 28px; border-radius: 28px; margin-bottom: 0 !important; text-align: left;">
            <h3 style="margin-top:0; font-family:'Sora',sans-serif; color:#1e3a8a; font-size:1.1rem; margin-bottom:14px; font-weight: 700;">Upcoming Schedule</h3>
            
            <div v-if="upcomingTutorBookings.length" style="display:flex; flex-direction:column; gap:10px;">
              <div 
                v-for="b in upcomingTutorBookings" 
                :key="b.id" 
                style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#fdf2f8; border:1px solid #fbcfe8; border-radius:14px; font-size:0.8rem; text-align: left;"
              >
                <div>
                  <div style="font-weight:700; color:#db2777;">{{ b.student.name }}</div>
                  <div style="font-size:0.7rem; color:#574e7d; margin-top:2px;">{{ b.date }} @ {{ b.time }}</div>
                </div>
                <div style="text-align:right; font-weight:700; color:#db2777; flex-shrink: 0; margin-left: 8px;">
                  RM{{ b.totalCost }}
                </div>
              </div>
            </div>
            <div v-else style="text-align:center; padding:18px; color:#574e7d; font-size:0.8rem;">
              No upcoming bookings.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  PrepPalCore.mountApp({
    template: userRole === 'Tutor' ? tutorTemplate : template,
    data() {
      return {
        userRole,
        tutorBookings: [],
        currentDate: new Date(),
        selectedDate: new Date(),

        plannerSearch: '',
        plannerTasks: [],
        reminders: [],
        materials: [],
        aiSchedule: [],
        plannerLoading: false,
        generatingSchedule: false,
        errorMsg: '',

        // Forms toggles
        showAddPlanForm: false,
        showAddReminderForm: false,
        showAddMaterialForm: false,

        // Forms data
        newPlan: { task: '', deadline: '', status: 'Pending' },
        newReminder: { title: '', time: '', status: 'Set' },
        newMaterial: { filename: '', description: '' },

        // Timer States
        timerMode: 'pomodoro', // 'pomodoro' | 'stopwatch' | 'tracking'
        timerState: 'idle', // 'idle' | 'running' | 'paused'
        timerSeconds: 1500, // starts at 25 minutes (1500 secs)
        timerTotalDuration: 1500,
        timerInterval: null,
        timerSubject: 'General Study',
        customSubjectName: '',
        timerColor: '#db2777', // pastel pink default
        timerCustomDuration: 25,
        timerSecondsStudied: 0,
        // customizable pomodoro work and break
        pomodoroWorkDuration: 25,
        pomodoroBreakDuration: 5,
        pomodoroSessionType: 'work', // 'work' | 'break'
        subjectsList: ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'General Study', 'Other'],
        timerColorOptions: [
          { value: '#db2777', pastelBg: 'rgba(219, 39, 119, 0.1)', pastelBorder: 'rgba(219, 39, 119, 0.45)', label: 'Pastel Pink' },
          { value: '#2563eb', pastelBg: 'rgba(37, 99, 235, 0.1)', pastelBorder: 'rgba(37, 99, 235, 0.45)', label: 'Pastel Blue' },
          { value: '#8b5cf6', pastelBg: 'rgba(139, 92, 246, 0.1)', pastelBorder: 'rgba(139, 92, 246, 0.45)', label: 'Pastel Purple' },
          { value: '#34d399', pastelBg: 'rgba(52, 211, 153, 0.1)', pastelBorder: 'rgba(52, 211, 153, 0.45)', label: 'Pastel Mint' },
          { value: '#fbbf24', pastelBg: 'rgba(251, 191, 36, 0.1)', pastelBorder: 'rgba(251, 191, 36, 0.45)', label: 'Pastel Amber' }
        ]
      };
    },
    computed: {
      filteredPlannerTasks() {
        const query = (this.plannerSearch || '').trim().toLowerCase();
        return (this.plannerTasks || []).filter(task => {
          const taskName = (task.task || '').toLowerCase();
          const deadline = (task.deadline || '').toLowerCase();
          const status = (task.status || '').toLowerCase();
          return !query ||
            taskName.includes(query) ||
            deadline.includes(query) ||
            status.includes(query);
        });
      },
      formattedTime() {
        const mins = Math.floor(Math.abs(this.timerSeconds) / 60);
        const secs = Math.abs(this.timerSeconds) % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      },
      activeSubjectDisplay() {
        if (this.timerSubject === 'Other') {
          return this.customSubjectName.trim() || 'Custom Subject';
        }
        return this.timerSubject;
      },
      shouldShowSave() {
        return (this.timerState === 'idle' || this.timerState === 'paused') && 
               this.timerSecondsStudied >= 10 && 
               !(this.timerMode === 'pomodoro' && this.pomodoroSessionType === 'break');
      },
      activeColorOption() {
        return this.timerColorOptions.find(o => o.value === this.timerColor) || this.timerColorOptions[0];
      },
      timerCircleStyle() {
        if (this.timerMode === 'pomodoro') {
          if (this.pomodoroSessionType === 'work') {
            return {
              background: 'rgba(219, 39, 119, 0.12)',
              borderColor: 'rgba(219, 39, 119, 0.5)',
              boxShadow: this.timerState === 'running' ? '0 0 35px rgba(219, 39, 119, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.7)' : 'inset 0 0 15px rgba(255, 255, 255, 0.7)'
            };
          } else {
            return {
              background: 'rgba(37, 99, 235, 0.12)',
              borderColor: 'rgba(37, 99, 235, 0.5)',
              boxShadow: this.timerState === 'running' ? '0 0 35px rgba(37, 99, 235, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.7)' : 'inset 0 0 15px rgba(255, 255, 255, 0.7)'
            };
          }
        }
        return {
          background: this.activeColorOption.pastelBg,
          borderColor: this.activeColorOption.pastelBorder,
          boxShadow: this.timerState === 'running' ? '0 0 35px ' + this.timerColor + '55, inset 0 0 15px rgba(255, 255, 255, 0.7)' : 'inset 0 0 15px rgba(255, 255, 255, 0.7)'
        };
      },

      // Tutor Calendar Computed Properties
      calendarDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();
        
        const days = [];
        
        // Prev month padding days
        for (let i = firstDayIndex; i > 0; i--) {
          const d = new Date(year, month - 1, prevLastDate - i + 1);
          days.push({ date: d, isCurrentMonth: false, bookings: this.getBookingsForDate(d) });
        }
        
        // Current month days
        for (let i = 1; i <= lastDate; i++) {
          const d = new Date(year, month, i);
          days.push({ date: d, isCurrentMonth: true, bookings: this.getBookingsForDate(d) });
        }
        
        // Next month padding days
        const totalSlots = 42;
        const remaining = totalSlots - days.length;
        for (let i = 1; i <= remaining; i++) {
          const d = new Date(year, month + 1, i);
          days.push({ date: d, isCurrentMonth: false, bookings: this.getBookingsForDate(d) });
        }
        return days;
      },
      currentMonthYearString() {
        return this.currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      },
      selectedDateBookings() {
        return this.getBookingsForDate(this.selectedDate);
      },
      upcomingTutorBookings() {
        const todayStr = new Date().toISOString().split('T')[0];
        const query = (this.plannerSearch || '').trim().toLowerCase();
        return this.tutorBookings.filter(b => {
          const matchesDate = b.date >= todayStr;
          const matchesQuery = !query || b.student.name.toLowerCase().includes(query) || b.student.email.toLowerCase().includes(query);
          return matchesDate && matchesQuery;
        }).slice(0, 5);
      },
      tutorEarnings() {
        return this.tutorBookings
          .filter(b => b.paymentStatus === 'paid' && (b.status === 'confirmed' || b.status === 'completed'))
          .reduce((sum, b) => sum + b.totalCost, 0);
      },
      tutorPaidSessionsCount() {
        return this.tutorBookings.filter(b => b.paymentStatus === 'paid').length;
      },
      completedTasksCount() {
        return this.plannerTasks.filter(t => t.status === 'Completed').length;
      },
      progressPercent() {
        if (!this.plannerTasks.length) return 0;
        return Math.round((this.completedTasksCount / this.plannerTasks.length) * 100);
      }
    },
    methods: {
      // Tutor Calendar Methods
      getBookingsForDate(d) {
        if (!d) return [];
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return this.tutorBookings.filter(b => b.date === dateString);
      },
      selectDate(day) {
        this.selectedDate = day.date;
      },
      prevMonth() {
        const d = new Date(this.currentDate);
        d.setMonth(d.getMonth() - 1);
        this.currentDate = d;
      },
      nextMonth() {
        const d = new Date(this.currentDate);
        d.setMonth(d.getMonth() + 1);
        this.currentDate = d;
      },
      isSameDate(d1, d2) {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
      },
      formatSelectedDate() {
        return this.selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      },

      // Load data dynamically
      async loadPlannerData() {
        this.plannerLoading = true;
        this.errorMsg = '';
        try {
          if (this.userRole === 'Tutor') {
            const bookings = await api.getStudentBookings();
            this.tutorBookings = bookings || [];
          } else {
            // Student load
            const [tasks, reminders, materials, schedule] = await Promise.all([
              api.getPlannerTasks(),
              api.getReminders(),
              api.getMaterials(),
              api.getAISchedule()
            ]);
            this.plannerTasks = tasks || [];
            this.reminders = reminders || [];
            this.materials = materials || [];
            this.aiSchedule = schedule ? (typeof schedule.schedule_data === 'string' ? JSON.parse(schedule.schedule_data) : schedule.schedule_data) : null;
          }
        } catch (err) {
          console.error(err);
          this.errorMsg = 'Unable to sync study planner data with backend REST server.';
        } finally {
          this.plannerLoading = false;
        }
      },
      formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      },
      async createPlan() {
        if (!this.newPlan.task || !this.newPlan.deadline) {
          alert('Please enter a task name and select a deadline date.');
          return;
        }
        try {
          const created = await api.createPlannerTask(this.newPlan);
          this.plannerTasks.push(created);
          this.newPlan = { task: '', deadline: '', status: 'Pending' };
          this.showAddPlanForm = false;
        } catch (err) {
          alert('Failed to save study plan: ' + err.message);
        }
      },
      async updatePlanStatus(task, status) {
        try {
          await api.updatePlannerTask(task.plan_id, { status });
          task.status = status;
        } catch (err) {
          alert('Failed to update task status: ' + err.message);
        }
      },
      async togglePlanCompletion(task) {
        const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        await this.updatePlanStatus(task, nextStatus);
      },
      async deletePlan(planId) {
        if (!confirm('Are you sure you want to delete this study plan task?')) return;
        try {
          await api.deletePlannerTask(planId);
          this.plannerTasks = this.plannerTasks.filter(t => t.plan_id !== planId);
        } catch (err) {
          alert('Failed to delete study plan: ' + err.message);
        }
      },
      async createReminder() {
        if (!this.newReminder.title || !this.newReminder.time) {
          alert('Please enter a reminder title and select a date/time.');
          return;
        }
        try {
          const formattedTime = this.newReminder.time.replace('T', ' ');
          const created = await api.createReminder({
            title: this.newReminder.title,
            time: formattedTime,
            status: 'Set'
          });
          this.reminders.push(created);
          this.newReminder = { title: '', time: '', status: 'Set' };
          this.showAddReminderForm = false;
        } catch (err) {
          alert('Failed to create reminder: ' + err.message);
        }
      },
      async deleteReminder(id) {
        try {
          await api.deleteReminder(id);
          this.reminders = this.reminders.filter(r => r.id !== id);
        } catch (err) {
          alert('Failed to delete reminder: ' + err.message);
        }
      },
      async createMaterial() {
        if (!this.newMaterial.filename) {
          alert('Please provide a file name.');
          return;
        }
        try {
          const created = await api.createMaterial(this.newMaterial);
          this.materials.unshift(created);
          this.newMaterial = { filename: '', description: '' };
          this.showAddMaterialForm = false;
        } catch (err) {
          alert('Failed to log study material: ' + err.message);
        }
      },
      async generateSchedule() {
        this.generatingSchedule = true;
        try {
          const schedule = await api.generateAISchedule();
          this.aiSchedule = schedule;
        } catch (err) {
          alert('Failed to generate AI study schedule: ' + err.message);
        } finally {
          this.generatingSchedule = false;
        }
      },
      goToTutors() {
        window.location.href = '../../views/tutors/tutors_index.html';
      },
      setTimerMode(mode) {
        if (this.timerState === 'running') {
          if (!confirm('This will stop and reset the active focus timer. Proceed?')) return;
        }
        this.timerMode = mode;
        if (mode === 'pomodoro') {
          this.pomodoroSessionType = 'work';
        }
        this.resetTimer();
      },
      startTimer() {
        if (this.timerState === 'running') return;
        
        if (this.timerState === 'idle') {
          this.timerSecondsStudied = 0;
          if (this.timerMode === 'pomodoro') {
            const workMin = parseFloat(this.pomodoroWorkDuration) || 25;
            const breakMin = parseFloat(this.pomodoroBreakDuration) || 5;
            if (this.pomodoroSessionType === 'work') {
              this.timerSeconds = workMin * 60;
              this.timerTotalDuration = workMin * 60;
            } else {
              this.timerSeconds = breakMin * 60;
              this.timerTotalDuration = breakMin * 60;
            }
          } else if (this.timerMode === 'tracking') {
            const customMin = parseFloat(this.timerCustomDuration) || 25;
            this.timerSeconds = customMin * 60;
            this.timerTotalDuration = customMin * 60;
          } else if (this.timerMode === 'stopwatch') {
            this.timerSeconds = 0;
            this.timerTotalDuration = 0;
          }
        }
        
        this.timerState = 'running';
        this.timerInterval = setInterval(() => {
          if (this.timerMode === 'stopwatch') {
            this.timerSeconds++;
            this.timerSecondsStudied++;
            console.log(`Timer tick: ${this.timerSeconds}s (stopwatch)`);
          } else {
            this.timerSeconds--;
            this.timerSecondsStudied++;
            console.log(`Timer tick: ${this.timerSeconds}s (countdown)`);
            if (this.timerSeconds <= 0) {
              this.timerSeconds = 0;
              this.pauseTimer();
              this.timerState = 'idle';
              
              if (this.timerMode === 'pomodoro') {
                const workMin = parseFloat(this.pomodoroWorkDuration) || 25;
                const breakMin = parseFloat(this.pomodoroBreakDuration) || 5;
                if (this.pomodoroSessionType === 'work') {
                  alert(`Focus session for ${this.activeSubjectDisplay} completed! Starting break.`);
                  this.pomodoroSessionType = 'break';
                  this.timerSeconds = breakMin * 60;
                  this.timerTotalDuration = breakMin * 60;
                  this.startTimer();
                } else {
                  alert(`Break session completed! Back to study.`);
                  this.pomodoroSessionType = 'work';
                  this.timerSeconds = workMin * 60;
                  this.timerTotalDuration = workMin * 60;
                }
              } else {
                alert(`Focus session for ${this.activeSubjectDisplay} completed!`);
              }
            }
          }
        }, 1000);
      },
      pauseTimer() {
        this.timerState = 'paused';
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      },
      resetTimer() {
        this.timerState = 'idle';
        this.timerSecondsStudied = 0;
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        if (this.timerMode === 'pomodoro') {
          if (this.pomodoroSessionType === 'work') {
            this.timerSeconds = this.pomodoroWorkDuration * 60;
            this.timerTotalDuration = this.pomodoroWorkDuration * 60;
          } else {
            this.timerSeconds = this.pomodoroBreakDuration * 60;
            this.timerTotalDuration = this.pomodoroBreakDuration * 60;
          }
        } else if (this.timerMode === 'tracking') {
          this.timerSeconds = (this.timerCustomDuration || 25) * 60;
          this.timerTotalDuration = (this.timerCustomDuration || 25) * 60;
        } else if (this.timerMode === 'stopwatch') {
          this.timerSeconds = 0;
          this.timerTotalDuration = 0;
        }
      },
      async saveTimerSession() {
        const minutes = Math.max(1, Math.round(this.timerSecondsStudied / 60));
        const subjectName = this.activeSubjectDisplay;
        
        try {
          await api.createAnalyticsRecord({
            subject: subjectName,
            date: new Date().toISOString().substring(0, 10),
            study_minutes: minutes,
            modules_completed: 1,
            mastery: 70,
            quiz_score: null
          });
          alert(`Focus session of ${minutes} minute(s) successfully logged to your Progress Analytics!`);
          this.resetTimer();
        } catch (err) {
          alert('Failed to save study session to analytics: ' + err.message);
        }
      }
    },
    mounted() {
      this.loadPlannerData();
    },
    beforeUnmount() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    }
  });
})();
