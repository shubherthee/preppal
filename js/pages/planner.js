// js/pages/planner.js
// Study Planner & Reminder page: manage plans, reminders, resources, and AI schedule.

(function () {
  const api = PrepPalAPI;

  const template = `
    <div class="topbar">
      <div class="search-wrap">
        <span class="search-icon"></span>
        <input
          type="text"
          v-model="plannerSearch"
          placeholder="Search study plans, deadlines, or status..."
        />
      </div>
      <div class="notif-btn">●<span class="notif-dot" v-if="reminders.length"></span></div>
      <div class="topbar-avatar" style="background: linear-gradient(135deg, var(--indigo), var(--mint))">{{ initials }}</div>
    </div>

    <div class="greeting">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background:#eef7ff;color:#1c5db6;"></div>
          <span class="stat-badge" style="background:#eef7ff;color:#1c5db6;">Active</span>
        </div>
        <div class="stat-val">{{ plannerTasks.length }}</div>
        <div class="stat-label">Loaded Study Plans</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background:#fff4e6;color:#b25f11;"></div>
          <span class="stat-badge" style="background:#fff4e6;color:#b25f11;">Active</span>
        </div>
        <div class="stat-val">{{ reminders.filter(r => r.status === 'Active' || r.status === 'Set').length }}</div>
        <div class="stat-label">Reminders Set</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background:#edf7f0;color:#1f7a4c;"></div>
          <span class="stat-badge" style="background:#edf7f0;color:#1f7a4c;">Files</span>
        </div>
        <div class="stat-val">{{ materials.length }}</div>
        <div class="stat-label">Uploaded Materials</div>
      </div>
    </div>

    <div class="bottom-grid">
      <!-- Study Plan Tasks -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;">
          <div>
            <div class="section-title" style="margin-bottom:4px;">Study Plan Tasks</div>
            <p style="color:var(--muted);font-size:.9rem;margin:0;">
              Manage your tasks, set deadlines, and track status.
            </p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="showAddPlanForm = !showAddPlanForm">
              {{ showAddPlanForm ? 'Close Form' : '+ Add Plan' }}
            </button>
            <button class="btn-primary" style="width:auto;padding:8px 16px;background:var(--border);color:var(--text)" @click="loadPlannerData">
              Refresh
            </button>
          </div>
        </div>

        <!-- Add Plan Form -->
        <div v-if="showAddPlanForm" class="card" style="box-shadow:none;background:#f8fafc;border:1px solid var(--border);margin-bottom:16px;padding:16px;">
          <h3 style="margin-top:0;margin-bottom:12px;font-size:1rem;">New Study Plan Task</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Task Name</label>
              <input type="text" v-model="newPlan.task" placeholder="e.g. Complete Mathematics Revision" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
            <div>
              <label style="display:block;font-size:.8rem;color:var(--muted);margin-bottom:4px;">Deadline</label>
              <input type="date" v-model="newPlan.deadline" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;" />
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <label style="font-size:.8rem;color:var(--muted);margin-right:8px;">Status</label>
              <select v-model="newPlan.status" style="padding:6px;border:1px solid var(--border);border-radius:4px;">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
            <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="createPlan">Save Task</button>
          </div>
        </div>

        <div v-if="plannerLoading" class="card" style="box-shadow:none;background:#f8fafc;">
          Loading study planner data...
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>

        <div class="activity-list" v-if="!plannerLoading && filteredPlannerTasks.length">
          <div class="activity-item" v-for="task in filteredPlannerTasks" :key="task.plan_id">
            <div class="act-icon" style="background:#eef7ff;color:#1c5db6;">
              {{ (task.task || 'P').charAt(0) }}
            </div>
            <div style="flex-grow:1;padding-right:16px;">
              <div class="act-title" :style="task.status === 'Completed' ? 'text-decoration: line-through; color: var(--muted);' : ''">{{ task.task }}</div>
              <div class="act-sub">Deadline: {{ task.deadline }}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <select v-model="task.status" @change="updatePlanStatus(task)" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:0.8rem;outline:none;">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
              </select>
              <button @click="deletePlan(task.plan_id)" style="background:none;border:none;color:var(--rose);cursor:pointer;font-size:1.1rem;" title="Delete Plan"></button>
            </div>
          </div>
        </div>

        <div v-if="!plannerLoading && !errorMsg && !filteredPlannerTasks.length" class="card" style="box-shadow:none;background:#f8fafc;text-align:center;padding:24px;">
          No matching study plans found.
        </div>
      </div>

      <!-- Resource Materials -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div class="section-title" style="margin:0;">Resource Materials</div>
          <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:0.8rem;" @click="showAddMaterialForm = !showAddMaterialForm">
            {{ showAddMaterialForm ? 'Cancel' : '+ Add File' }}
          </button>
        </div>
        <p style="color:var(--muted);margin-bottom:18px;font-size:.9rem;">
          Upload lecture notes, slides, PDFs, and references needed for the study plan.
        </p>

        <!-- Add Material Form -->
        <div v-if="showAddMaterialForm" class="card" style="box-shadow:none;background:#f8fafc;border:1px solid var(--border);margin-bottom:16px;padding:12px;">
          <div style="margin-bottom:8px;">
            <input type="text" v-model="newMaterial.filename" placeholder="File name (e.g. Biology_Lecture_1.pdf)" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;" />
          </div>
          <div style="margin-bottom:8px;">
            <input type="text" v-model="newMaterial.description" placeholder="Short description" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;" />
          </div>
          <div style="text-align:right;">
            <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:0.8rem;" @click="createMaterial">Save Reference</button>
          </div>
        </div>

        <div class="activity-list" v-if="materials.length">
          <div class="qa-card" v-for="mat in materials" :key="mat.id" style="margin-bottom:8px;padding:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div class="qa-name" style="font-weight:600;font-size:0.9rem;"> {{ mat.filename }}</div>
              <span style="font-size:0.7rem;color:var(--muted)">{{ formatDate(mat.created_at) }}</span>
            </div>
            <div class="qa-desc" style="font-size:0.8rem;color:var(--muted);margin-top:4px;">{{ mat.description }}</div>
          </div>
        </div>
        <div v-else style="text-align:center;color:var(--muted);padding:16px;font-size:0.85rem;background:#f8fafc;border-radius:6px;">
          No study materials logged yet.
        </div>
      </div>
    </div>

    <div class="bottom-grid" style="margin-top:24px;">
      <!-- AI Recommended Schedule -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;">
          <div class="section-title" style="margin:0;">AI Recommended Schedule</div>
          <button class="btn-primary" style="width:auto;padding:8px 16px;" @click="generateSchedule" :disabled="generatingSchedule">
            {{ generatingSchedule ? 'Generating...' : 'Generate Study Schedule' }}
          </button>
        </div>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:18px;">
          Leverages OpenRouter AI models to analyze your plans and performance, mapping out a personalized study routine.
        </p>

        <div v-if="generatingSchedule" style="text-align:center;padding:24px;background:#f8fafc;border-radius:6px;">
           AI is analyzing your goals and quiz scores to compile a schedule...
        </div>

        <div class="upcoming-list" v-else-if="aiSchedule.length">
          <div class="upcoming-item" v-for="(item, idx) in aiSchedule" :key="idx">
            <span class="upcoming-dot" :style="{ background: idx === 0 ? '#1d4ed8' : idx === 1 ? '#16a34a' : '#f59e0b' }"></span>
            <div style="flex-grow:1;padding-right:8px;">
              <div class="upcoming-name" style="font-weight:600;">{{ item.day }}</div>
              <div class="upcoming-date" style="font-size:0.85rem;color:var(--muted);">{{ item.task }}</div>
            </div>
            <span class="upcoming-badge" :style="{ 
              background: idx === 0 ? '#e0e7ff' : idx === 1 ? '#dcfce7' : '#fff4db',
              color: idx === 0 ? '#1d4ed8' : idx === 1 ? '#15803d' : '#b25f11'
            }">{{ item.hours }}</span>
          </div>
        </div>
        <div v-else style="text-align:center;color:var(--muted);padding:24px;background:#f8fafc;border-radius:6px;">
          No AI schedule generated yet. Click the button to customize your schedule with AI.
        </div>
      </div>

      <!-- Reminders -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div class="section-title" style="margin:0;">Reminders and Tutor Session</div>
          <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:0.8rem;" @click="showAddReminderForm = !showAddReminderForm">
            {{ showAddReminderForm ? 'Cancel' : '+ Add Reminder' }}
          </button>
        </div>

        <!-- Add Reminder Form -->
        <div v-if="showAddReminderForm" class="card" style="box-shadow:none;background:#f8fafc;border:1px solid var(--border);margin-bottom:16px;padding:12px;">
          <div style="margin-bottom:8px;">
            <input type="text" v-model="newReminder.title" placeholder="Reminder Title (e.g. Math Practice Review)" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;" />
          </div>
          <div style="margin-bottom:8px;">
            <input type="datetime-local" v-model="newReminder.time" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;" />
          </div>
          <div style="text-align:right;">
            <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:0.8rem;" @click="createReminder">Set Reminder</button>
          </div>
        </div>

        <div class="activity-list" v-if="reminders.length">
          <div class="activity-item" v-for="rem in reminders" :key="rem.id">
            <div class="act-icon" style="background:#eef7ff;color:#1c5db6;">R</div>
            <div style="flex-grow:1;padding-right:12px;">
              <div class="act-title" style="font-weight:600;">{{ rem.title }}</div>
              <div class="act-sub">{{ rem.time }}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="badge" style="background:#eef7ff;color:#1c5db6;font-size:0.75rem;padding:4px 8px;">{{ rem.status }}</span>
              <button @click="deleteReminder(rem.id)" style="background:none;border:none;color:var(--rose);cursor:pointer;font-size:1rem;" title="Delete Reminder"></button>
            </div>
          </div>
        </div>
        <div v-else style="text-align:center;color:var(--muted);padding:16px;font-size:0.85rem;background:#f8fafc;border-radius:6px;margin-bottom:12px;">
          No active reminders.
        </div>

        <div class="activity-item" style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:12px;align-items:center;">
            <div class="act-icon" style="background:#edf7f0;color:#1f7a4c;">TS</div>
            <div>
              <div class="act-title" style="font-weight:600;">Booked Tutor Sessions</div>
              <div class="act-sub">Schedule live review calls with verified tutors</div>
            </div>
          </div>
          <button class="btn-primary" style="width:auto;padding:8px 14px;" @click="goToTutors">
            Book
          </button>
        </div>
      </div>
    </div>
  `;

  PrepPalCore.mountApp({
    template,
    data() {
      return {
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
        newMaterial: { filename: '', description: '' }
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
      }
    },
    methods: {
      async loadPlannerData() {
        this.plannerLoading = true;
        this.errorMsg = '';
        try {
          // Parallel fetch of planner data
          const [tasks, reminders, materials, schedule] = await Promise.all([
            api.getPlannerTasks(),
            api.getReminders(),
            api.getMaterials(),
            api.getAISchedule()
          ]);
          this.plannerTasks = tasks;
          this.reminders = reminders;
          this.materials = materials;
          this.aiSchedule = schedule;
        } catch (err) {
          console.error(err);
          this.errorMsg = 'Unable to sync study planner data with backend REST server.';
        } finally {
          this.plannerLoading = false;
        }
      },
      async createPlan() {
        if (!this.newPlan.task || !this.newPlan.deadline) {
          alert('Please enter a task name and select a deadline date.');
          return;
        }
        try {
          const created = await api.createPlannerTask(this.newPlan);
          this.plannerTasks.push(created);
          // reset form
          this.newPlan = { task: '', deadline: '', status: 'Pending' };
          this.showAddPlanForm = false;
        } catch (err) {
          alert('Failed to save study plan: ' + err.message);
        }
      },
      async updatePlanStatus(task) {
        try {
          await api.updatePlannerTask(task.plan_id, { status: task.status });
        } catch (err) {
          alert('Failed to update task status: ' + err.message);
        }
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
          // format local datetime value
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
      formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      },
      goToTutors() {
        window.location.href = '../../views/tutors/tutors_index.html';
      }
    },
    mounted() {
      this.loadPlannerData();
    }
  });
})();
