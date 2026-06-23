// js/pages/quizzes.js
// Quizzes page: browse/search/filter, create/edit/delete (owner only),
// take a quiz, and view results — all backed by the REST API.

(function () {
  const api = PrepPalAPI;

  const template = `
    <div class="page-header">
      <div class="greeting" style="margin-bottom:0"><h1>{{pageTitle}}</h1><p>{{pageSubtitle}}</p></div>
      <button class="btn-primary" style="width:auto;padding:10px 22px;white-space:nowrap" @click="openCreateQuiz">+ Create Quiz</button>
    </div>

    <div class="tabs">
      <div class="tab" :class="{active:tab==='browse'}" @click="switchTab('browse')">Browse</div>
      <div class="tab" :class="{active:tab==='my'}" @click="switchTab('my')">My Quizzes</div>
      <div class="tab" :class="{active:tab==='history'}" @click="switchTab('history')">History</div>
      <div class="tab" :class="{active:tab==='take'}" v-if="takingQuiz">Taking Quiz</div>
    </div>

    <template v-if="tab!=='take' && tab!=='history' && !quizResults">
      <div class="filter-bar">
        <input v-model="search" @input="debouncedLoad" placeholder="Search by title, subject or topic…"/>
        <select v-model="filterSubject" @change="loadQuizzes"><option value="">All subjects</option><option v-for="s in subjects" :key="s">{{s}}</option></select>
        <select v-model="filterTopic" @change="loadQuizzes"><option value="">All topics</option><option v-for="t in topics" :key="t">{{t}}</option></select>
      </div>

      <div v-if="loading" class="empty-state">Loading quizzes…</div>
      <div v-else-if="errorMsg" class="empty-state" style="color:var(--rose)">{{errorMsg}}</div>
      <template v-else>
        <div class="quiz-grid">
          <div class="quiz-card" v-for="q in quizzes" :key="q.id">
            <div class="quiz-card-header">
              <div>
                <div class="quiz-title">{{q.title}}</div>
                <div class="quiz-meta">{{q.subject}} · {{q.topic}} · {{q.question_count}} questions</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
                <span class="badge" :class="q.visibility==='public'?'badge-public':'badge-private'">{{q.visibility}}</span>
                <span class="badge" :class="'badge-'+q.difficulty.toLowerCase()">{{q.difficulty}}</span>
              </div>
            </div>
            <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px">By {{q.owner_name}}</div>
            <div class="quiz-card-footer">
              <button class="btn-sm primary" @click="startQuiz(q.id)">Start Quiz</button>
              <div class="owner-actions" v-if="q.owner_id===currentUserId">
                <button class="btn-sm" @click="openEditQuiz(q.id)">Edit</button>
                <button class="btn-sm" style="color:var(--rose)" @click="deleteQuiz(q.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="quizzes.length===0">
          <div style="font-size:3rem;margin-bottom:12px"></div>
          <div>No quizzes found. Adjust your filters or create a new quiz.</div>
        </div>
      </template>
    </template>

    <!--  HISTORY  -->
    <template v-if="tab==='history' && !quizResults">
      <div v-if="historyLoading" class="empty-state">Loading history…</div>
      <template v-else>
        <div class="history-group" v-for="g in groupedAttempts" :key="g.quizId">
          <div class="card">
            <div class="quiz-card-header">
              <div>
                <div class="quiz-title">{{g.title}}</div>
                <div class="quiz-meta">{{g.subject}} · {{g.topic}} · {{g.attempts.length}} attempt{{g.attempts.length>1?'s':''}}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
                <span class="badge" :class="'badge-'+g.difficulty.toLowerCase()">{{g.difficulty}}</span>
                <span class="badge badge-public">Best {{g.best}}%</span>
              </div>
            </div>
            <div class="attempt-list">
              <div class="attempt-row" v-for="a in g.attempts" :key="a.id">
                <span class="attempt-date">{{formatDate(a.created_at)}}</span>
                <span class="attempt-score">{{a.score}}/{{a.total}} ({{Math.round(a.score/a.total*100)}}%)</span>
                <button class="btn-sm" @click="viewAttempt(a.id)">Review</button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="groupedAttempts.length===0">
          <div style="font-size:3rem;margin-bottom:12px"></div>
          <div>No quiz attempts yet. Take a quiz to see your history here.</div>
        </div>
      </template>
    </template>

    <!--  TAKING A QUIZ  -->
    <template v-if="tab==='take' && takingQuiz && !quizResults">
      <div class="quiz-take-wrap">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:'Sora',sans-serif;font-size:1rem;font-weight:700">{{takingQuiz.title}}</span>
          <button class="btn-sm" @click="exitQuiz"> Exit</button>
        </div>
        <div class="progress-bar-outer"><div class="progress-bar-inner" :style="{width:((currentQ+1)/takingQuiz.questions.length*100)+'%'}"></div></div>
        <div class="question-num">Question {{currentQ+1}} of {{takingQuiz.questions.length}}</div>
        <div class="question-text">{{takingQuiz.questions[currentQ].text}}</div>
        <div class="choices-list">
          <div class="choice-opt" v-for="(c,ci) in takingQuiz.questions[currentQ].choices" :key="ci"
            :class="{selected:quizAnswers[currentQ]===ci}"
            @click="quizAnswers[currentQ]=ci">{{c}}</div>
        </div>
        <div class="quiz-nav">
          <button class="btn-sm" @click="currentQ--" :disabled="currentQ===0"> Previous</button>
          <button class="btn-sm primary" v-if="currentQ<takingQuiz.questions.length-1" @click="currentQ++" :disabled="quizAnswers[currentQ]===undefined">Next </button>
          <button class="btn-sm primary" v-else @click="submitQuiz" :disabled="quizAnswers[currentQ]===undefined">Submit Quiz</button>
        </div>
      </div>
    </template>

    <!--  RESULTS  -->
    <template v-if="quizResults">
      <div class="quiz-take-wrap">
        <div class="score-circle">
          <div class="score-num">{{quizResults.score}}/{{quizResults.total}}</div>
          <div class="score-label">Score</div>
        </div>
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:700;margin-bottom:6px">
            {{Math.round(quizResults.score/quizResults.total*100)}}% — {{quizResults.score===quizResults.total?'Perfect!':quizResults.score>=quizResults.total*.7?'Great job!':'Keep practicing!'}}
          </div>
          <div style="color:var(--muted);font-size:.9rem">{{quizResults.score}} correct out of {{quizResults.total}} questions</div>
        </div>
        <template v-if="wrongResults.length>0">
          <div class="section-title">Review Wrong Answers</div>
          <div class="review-item" v-for="r in wrongResults" :key="r.index">
            <div class="review-q">{{r.text}}</div>
            <div class="review-ans" style="color:var(--rose)">Your answer: {{r.chosen!==null ? r.choices[r.chosen] : 'No answer'}}</div>
            <div class="review-ans" style="color:#1D9E75;margin-top:2px">Correct: {{r.choices[r.correct]}}</div>
          </div>
        </template>
        <div v-else class="card" style="text-align:center;color:#1D9E75;font-weight:600;padding:20px"> All answers correct!</div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:center">
          <button class="btn-sm" @click="startQuiz(resultsQuizId)">Retake</button>
          <button class="btn-sm primary" @click="backFromResults">{{resultsContext==='history' ? 'Back to History' : 'Back to Browse'}}</button>
        </div>
      </div>
    </template>

    <!--  CREATE / EDIT MODAL  -->
    <div class="modal-overlay" v-if="showQuizModal" @click.self="showQuizModal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{editingQuizId?'Edit Quiz':'Create New Quiz'}}</h3>
          <button class="btn-sm" @click="showQuizModal=false"></button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="error-msg">{{formError}}</div>
          <div class="form-row">
            <div class="form-field"><label>Title</label><input v-model="form.title" placeholder="Quiz title"/></div>
            <div class="form-field"><label>Subject</label><input v-model="form.subject" placeholder="e.g. Biology"/></div>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Topic</label><input v-model="form.topic" placeholder="e.g. Cell Structure"/></div>
            <div class="form-field"><label>Difficulty</label>
              <select v-model="form.difficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>
            </div>
          </div>
          <div class="form-field"><label>Visibility</label>
            <select v-model="form.visibility">
              <option value="public">Public — everyone can see and take it</option>
              <option value="private">Private — only you can see it</option>
            </select>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div class="section-title" style="margin-bottom:0">Questions</div>
            <button class="btn-sm" @click="form.questions.push({text:'',choices:['','','',''],correct:0})">+ Add Question</button>
          </div>
          <div class="question-block" v-for="(q,qi) in form.questions" :key="qi">
            <div class="question-block-header">
              <span class="question-block-title">Question {{qi+1}}</span>
              <button class="btn-sm" style="color:var(--rose)" @click="form.questions.splice(qi,1)" v-if="form.questions.length>1">Remove</button>
            </div>
            <div class="form-field"><input v-model="q.text" :placeholder="'Enter question '+(qi+1)"/></div>
            <div style="font-size:.8rem;font-weight:600;color:var(--muted);margin-bottom:8px">Choices <span style="font-weight:400">(select the correct answer)</span></div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div class="choice-row" v-for="(c,ci) in q.choices" :key="ci">
                <input type="radio" class="correct-radio" :name="'q'+qi" :value="ci" v-model="q.correct"/>
                <input type="text" v-model="q.choices[ci]" :placeholder="'Choice '+(ci+1)" style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:DM Sans,sans-serif;font-size:.88rem;background:var(--surface);color:var(--text);outline:none"/>
                <button class="btn-sm" style="padding:6px 10px" @click="q.choices.splice(ci,1)" v-if="q.choices.length>2"></button>
              </div>
            </div>
            <button class="btn-sm" style="margin-top:8px" @click="q.choices.push('')" v-if="q.choices.length<6">+ Add choice</button>
          </div>
          <div class="modal-footer">
            <button class="btn-sm" @click="showQuizModal=false">Cancel</button>
            <button class="btn-sm primary" @click="saveQuiz" :disabled="saving">{{saving?'Saving…':(editingQuizId?'Save Changes':'Create Quiz')}}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  PrepPalCore.mountApp({
    template,

    data() {
      return {
        tab: 'browse',
        quizzes: [],
        subjects: [],
        topics: [],
        search: '',
        filterSubject: '',
        filterTopic: '',
        loading: false,
        errorMsg: '',
        _debounce: null,

        showQuizModal: false,
        editingQuizId: null,
        formError: '',
        saving: false,
        form: { title: '', subject: '', topic: '', difficulty: 'Medium', visibility: 'public', questions: [] },

        takingQuiz: null,
        currentQ: 0,
        quizAnswers: {},
        quizResults: null,
        resultsQuizId: null,
        resultsContext: 'take', // 'take' | 'history'

        attempts: [],
        historyLoading: false,
      };
    },

    computed: {
      wrongResults() {
        if (!this.quizResults) return [];
        return this.quizResults.results.filter(r => !r.isCorrect);
      },
      groupedAttempts() {
        const map = new Map();
        for (const a of this.attempts) {
          if (!map.has(a.quiz_id)) {
            map.set(a.quiz_id, {
              quizId: a.quiz_id, title: a.title, subject: a.subject,
              topic: a.topic, difficulty: a.difficulty, attempts: [], best: 0,
            });
          }
          const g = map.get(a.quiz_id);
          g.attempts.push(a);
          const pct = Math.round((a.score / a.total) * 100);
          if (pct > g.best) g.best = pct;
        }
        return Array.from(map.values());
      },
    },

    methods: {
      async loadQuizzes() {
        this.loading = true;
        this.errorMsg = '';
        try {
          const params = { search: this.search, subject: this.filterSubject, topic: this.filterTopic };
          if (this.tab === 'my') params.mine = 'true';
          this.quizzes = await api.getQuizzes(params);
        } catch (err) {
          this.errorMsg = err.message || 'Failed to load quizzes';
        } finally {
          this.loading = false;
        }
      },

      debouncedLoad() {
        clearTimeout(this._debounce);
        this._debounce = setTimeout(() => this.loadQuizzes(), 300);
      },

      async loadFilters() {
        try {
          const { subjects, topics } = await api.getQuizFilters();
          this.subjects = subjects;
          this.topics = topics;
        } catch (err) { /* non-fatal */ }
      },

      switchTab(t) {
        this.tab = t;
        this.takingQuiz = null;
        this.quizResults = null;
        if (t === 'history') {
          this.loadAttempts();
        } else {
          this.loadQuizzes();
        }
      },

      async loadAttempts() {
        this.historyLoading = true;
        try {
          this.attempts = await api.getMyQuizAttempts();
        } catch (err) {
          this.attempts = [];
        } finally {
          this.historyLoading = false;
        }
      },

      async viewAttempt(attemptId) {
        try {
          const data = await api.getQuizAttempt(attemptId);
          this.quizResults = { score: data.score, total: data.total, results: data.results };
          this.resultsQuizId = data.quizId;
          this.resultsContext = 'history';
        } catch (err) {
          alert(err.message || 'Failed to load attempt');
        }
      },

      backFromResults() {
        this.quizResults = null;
        if (this.resultsContext === 'history') {
          this.tab = 'history';
          this.loadAttempts();
        } else {
          this.exitQuiz();
        }
      },

      formatDate(d) {
        return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
      },

      openCreateQuiz() {
        this.editingQuizId = null;
        this.formError = '';
        this.form = { title: '', subject: '', topic: '', difficulty: 'Medium', visibility: 'public', questions: [{ text: '', choices: ['', '', '', ''], correct: 0 }] };
        this.showQuizModal = true;
      },

      async openEditQuiz(id) {
        this.formError = '';
        try {
          const quiz = await api.getQuiz(id);
          this.editingQuizId = id;
          this.form = {
            title: quiz.title, subject: quiz.subject, topic: quiz.topic,
            difficulty: quiz.difficulty, visibility: quiz.visibility,
            questions: quiz.questions.map(q => ({ text: q.text, choices: [...q.choices], correct: q.correct })),
          };
          this.showQuizModal = true;
        } catch (err) {
          alert(err.message || 'Failed to load quiz for editing');
        }
      },

      async saveQuiz() {
        this.formError = '';
        if (!this.form.title || !this.form.subject || !this.form.topic) {
          this.formError = 'Title, subject and topic are required.';
          return;
        }
        for (const q of this.form.questions) {
          if (!q.text.trim() || q.choices.some(c => !c.trim())) {
            this.formError = 'Every question needs text and all choices filled in.';
            return;
          }
        }
        this.saving = true;
        try {
          if (this.editingQuizId) {
            await api.updateQuiz(this.editingQuizId, this.form);
          } else {
            await api.createQuiz(this.form);
          }
          this.showQuizModal = false;
          await this.loadQuizzes();
          await this.loadFilters();
        } catch (err) {
          this.formError = err.message || 'Failed to save quiz';
        } finally {
          this.saving = false;
        }
      },

      async deleteQuiz(id) {
        if (!confirm('Delete this quiz? This cannot be undone.')) return;
        try {
          await api.deleteQuiz(id);
          await this.loadQuizzes();
        } catch (err) {
          alert(err.message || 'Failed to delete quiz');
        }
      },

      async startQuiz(id) {
        try {
          const quiz = await api.getQuiz(id);
          this.takingQuiz = quiz;
          this.currentQ = 0;
          this.quizAnswers = {};
          this.quizResults = null;
          this.tab = 'take';
        } catch (err) {
          alert(err.message || 'Failed to load quiz');
        }
      },

      async submitQuiz() {
        try {
          this.quizResults = await api.submitQuizAttempt(this.takingQuiz.id, this.quizAnswers);
          this.resultsQuizId = this.takingQuiz.id;
          this.resultsContext = 'take';
        } catch (err) {
          alert(err.message || 'Failed to submit quiz');
        }
      },

      exitQuiz() {
        this.takingQuiz = null;
        this.quizResults = null;
        this.tab = 'browse';
        this.loadQuizzes();
      },
    },

    mounted() {
      this.loadQuizzes();
      this.loadFilters();
    },
  });
})();
