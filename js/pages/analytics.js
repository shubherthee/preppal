// js/pages/analytics.js
// Progress Tracking & Analytics page: view performance charts, log study sessions, and run AI skill gap analyses.

(function () {
  const api = PrepPalAPI;

  const template = `
    <div class="topbar">
      <div class="search-wrap">
        <span class="search-icon"></span>
        <input
          type="text"
          v-model="analyticsSearch"
          placeholder="Search subjects, scores, mastery, or study time..."
        />
      </div>
      <div class="notif-btn">●<span class="notif-dot" v-if="skillGaps.length"></span></div>
      <div class="topbar-avatar" style="background: linear-gradient(135deg, var(--indigo), var(--mint))">{{ initials }}</div>
    </div>

    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-val">{{ totalStudyMinutes }} min</div>
        <div class="stat-label">Total Study Time</div>
      </div>

      <div class="stat-card">
        <div class="stat-val">{{ averageQuizScore }}%</div>
        <div class="stat-label">Average Quiz Score</div>
      </div>

      <div class="stat-card">
        <div class="stat-val">{{ averageMastery }}%</div>
        <div class="stat-label">Average Mastery</div>
      </div>

      <div class="stat-card">
        <div class="stat-val" :style="{ color: skillGaps.length > 0 ? 'var(--rose)' : 'inherit' }">{{ skillGaps.length }}</div>
        <div class="stat-label">Skill Gaps Found</div>
      </div>
    </div>

    <div class="bottom-grid">
      <!-- Performance Dashboard -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;">
          <div>
            <div class="section-title" style="margin-bottom:4px;">Performance Dashboard</div>
            <p style="color:var(--muted);font-size:.9rem;margin:0;">
              Your academic tracking logs (integrated with real quiz and flashcard history).
            </p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="showLogForm = !showLogForm">
              {{ showLogForm ? 'Close Form' : '+ Log Study Session' }}
            </button>
            <button class="btn-primary" style="width:auto;padding:8px 16px;background:var(--border);color:var(--text)" @click="loadAnalyticsData">
              Refresh
            </button>
          </div>
        </div>

        <!-- Log Study Session Form -->
        <div v-if="showLogForm" class="card" style="box-shadow:none;background:#f8fafc;border:1px solid var(--border);margin-bottom:16px;padding:16px;">
          <h3 style="margin-top:0;margin-bottom:12px;font-size:1rem;">Log Study Session</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Subject</label>
              <input type="text" v-model="newLog.subject" placeholder="e.g. Organic Chemistry" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Date</label>
              <input type="date" v-model="newLog.date" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Study Minutes</label>
              <input type="number" v-model.number="newLog.study_minutes" placeholder="60" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Modules Completed</label>
              <input type="number" v-model.number="newLog.modules_completed" placeholder="1" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Mastery Level (%)</label>
              <input type="number" v-model.number="newLog.mastery" placeholder="e.g. 80" min="0" max="100" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Quiz Score (%, Optional)</label>
              <input type="number" v-model.number="newLog.quiz_score" placeholder="e.g. 85" min="0" max="100" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
          </div>
          <div style="text-align:right;">
            <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="logSession">Save Session Log</button>
          </div>
        </div>

        <div v-if="analyticsLoading" class="card" style="box-shadow:none;background:#f8fafc;">
          Loading analytics data...
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>

        <div class="activity-list" v-if="!analyticsLoading && filteredAnalyticsRecords.length">
          <div class="activity-item" v-for="record in filteredAnalyticsRecords" :key="record.id">
            <div class="act-icon" style="background:#edf7f0;color:#1f7a4c;">
              {{ (record.subject || 'A').charAt(0) }}
            </div>
            <div>
              <div class="act-title" style="font-weight:600;">{{ record.subject }}</div>
              <div class="act-sub">
                Study Time: {{ record.study_minutes }} minutes ·
                Modules: {{ record.modules_completed }} ·
                Mastery: {{ record.mastery }}%
              </div>
            </div>
            <div class="act-time" style="font-weight:700;font-size:1.1rem;color:var(--indigo-dk)">
              {{ record.quiz_score !== null && record.quiz_score !== undefined ? record.quiz_score + '%' : 'N/A' }}
            </div>
          </div>
        </div>

        <div v-if="!analyticsLoading && !errorMsg && !filteredAnalyticsRecords.length" class="card" style="box-shadow:none;background:#f8fafc;text-align:center;padding:24px;">
          No matching performance logs found.
        </div>
      </div>

      <!-- Mastery Tracking -->
      <div class="card">
        <div class="section-title">Mastery Tracking</div>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:18px;">
          A summary of your skill profiles and subject competence levels.
        </p>

        <div class="activity-list" v-if="analyticsRecords.length">
          <div class="qa-card" v-for="record in analyticsRecords.slice(0, 5)" :key="'mastery-' + record.id" style="margin-bottom:10px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <div class="qa-name" style="font-weight:600;">{{ record.subject }}</div>
              <span class="badge" :style="{
                background: record.mastery >= 85 ? '#edf7f0' : record.mastery >= 70 ? '#eef7ff' : '#ffe5e1',
                color: record.mastery >= 85 ? '#1f7a4c' : record.mastery >= 70 ? '#1c5db6' : '#d92d20'
              }">{{ record.mastery }}% Mastery</span>
            </div>
            <div style="background:var(--border);height:6px;border-radius:3px;width:100%;overflow:hidden;">
              <div :style="{ 
                width: record.mastery + '%',
                background: record.mastery >= 85 ? 'var(--mint)' : record.mastery >= 70 ? 'var(--indigo)' : 'var(--rose)'
              }" style="height:100%"></div>
            </div>
          </div>
        </div>
        <div v-else style="text-align:center;color:var(--muted);padding:16px;background:#f8fafc;border-radius:6px;">
          Log study sessions to view skill mastery breakdown.
        </div>
      </div>
    </div>

    <div class="bottom-grid" style="margin-top:24px;">
      <!-- AI Skill Gap Analysis -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;">
          <div class="section-title" style="margin:0;">AI Skill Gap Analysis</div>
          <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="runSkillGapAnalysis" :disabled="analyzingSkillGaps">
            {{ analyzingSkillGaps ? 'Analyzing...' : 'Run Skill Gap Analysis' }}
          </button>
        </div>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:18px;">
          Queries the OpenRouter AI service to highlight weaker subjects based on recent performance scores and maps out actionable steps.
        </p>

        <div v-if="analyzingSkillGaps" style="text-align:center;padding:24px;background:#f8fafc;border-radius:6px;">
           AI is searching for scoring anomalies and learning weak points...
        </div>

        <div class="activity-list" v-else-if="skillGaps.length">
          <div
            class="activity-item"
            v-for="(gap, idx) in skillGaps"
            :key="'gap-' + idx"
            style="margin-bottom:8px;"
          >
            <div class="act-icon" :style="{ 
              background: gap.status === 'Critical' ? '#ffe5e1' : '#fff4db',
              color: gap.status === 'Critical' ? '#d92d20' : '#b25f11'
            }">
              {{ gap.subject.substring(0,2).toUpperCase() }}
            </div>
            <div style="flex-grow:1;padding-right:12px;">
              <div class="act-title" style="font-weight:600;">{{ gap.subject }}</div>
              <div class="act-sub">{{ gap.reason }}</div>
            </div>
            <div class="act-time" :style="{
              color: gap.status === 'Critical' ? 'var(--rose)' : 'var(--amber)'
            }" style="font-weight:700;">{{ gap.status }}</div>
          </div>
        </div>
        <div v-else style="text-align:center;color:var(--muted);padding:24px;background:#f8fafc;border-radius:6px;">
          No skill gaps loaded. Run analysis to identify learning gaps with AI.
        </div>
      </div>

      <!-- Tutor Review and Feedback -->
      <div class="card">
        <div class="section-title">Tutor Review & Study Tips</div>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:18px;">
          Strategic tips and feedback to improve study efficiency.
        </p>

        <div class="activity-list">
          <div class="activity-item">
            <div class="act-icon" style="background:#eef7ff;color:#1c5db6;"></div>
            <div>
              <div class="act-title" style="font-weight:600;">Spaced Repetition</div>
              <div class="act-sub">Practice flashcards 1 day, 3 days, and 7 days after reading slides to lock content in long-term memory.</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="act-icon" style="background:#edf7f0;color:#1f7a4c;"></div>
            <div>
              <div class="act-title" style="font-weight:600;">Active Recall</div>
              <div class="act-sub">Try taking quizzes before reviewing the syllabus. Testing mistakes forces the brain to form stronger neural links.</div>
            </div>
          </div>

          <div class="activity-item" style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;gap:12px;align-items:center;">
              <div class="act-icon" style="background:#fff4e6;color:#b25f11;"></div>
              <div>
                <div class="act-title" style="font-weight:600;">Need expert feedback?</div>
                <div class="act-sub">Share your analytics dashboard with a verified PrepPal tutor.</div>
              </div>
            </div>
            <button class="btn-primary" style="width:auto;padding:8px 14px;" @click="goToTutors">
              Find Tutor
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  PrepPalCore.mountApp({
    template,
    data() {
      return {
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
      }
    },
    methods: {
      async loadAnalyticsData() {
        this.analyticsLoading = true;
        this.errorMsg = '';
        try {
          const records = await api.getAnalyticsRecords();
          this.analyticsRecords = records;
          
          // Check local storage or generate initial gaps
          const storedGaps = localStorage.getItem('preppal_skillgaps');
          if (storedGaps) {
            this.skillGaps = JSON.parse(storedGaps);
          } else {
            // Filter records that have skill gaps to show initially
            this.skillGaps = records
              .filter(r => r.skill_gap === true || r.mastery < 70 || (r.quiz_score !== null && r.quiz_score < 70))
              .map(r => ({
                subject: r.subject.replace('Quiz: ', '').replace('Deck: ', ''),
                reason: `Performance score of ${r.quiz_score || r.mastery}% is below targeted 70%. Needs practice.`,
                status: (r.quiz_score || r.mastery) < 60 ? 'Critical' : 'Weak'
              }));
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
          
          // reset form
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
