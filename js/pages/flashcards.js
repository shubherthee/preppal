// js/pages/flashcards.js
// Flashcards page: browse/search/filter, create/edit/delete (owner only),
// study a deck with flip + right/wrong tracking, and view results.

(function () {
  const api = PrepPalAPI;

  const template = `
    <div class="page-header">
      <div class="greeting" style="margin-bottom:0"><h1>{{pageTitle}}</h1><p>{{pageSubtitle}}</p></div>
      <button class="btn-primary" style="width:auto;padding:10px 22px;white-space:nowrap" @click="openCreateDeck">+ Create Deck</button>
    </div>

    <div class="tabs">
      <div class="tab" :class="{active:tab==='browse'}" @click="switchTab('browse')">Browse</div>
      <div class="tab" :class="{active:tab==='my'}" @click="switchTab('my')">My Decks</div>
      <div class="tab" :class="{active:tab==='history'}" @click="switchTab('history')">History</div>
      <div class="tab" :class="{active:tab==='play'}" v-if="playingDeck">Studying</div>
    </div>

    <template v-if="tab!=='play' && tab!=='history' && !deckResults">
      <div class="filter-bar">
        <input v-model="search" @input="debouncedLoad" placeholder="Search by title, subject or topic…"/>
        <select v-model="filterSubject" @change="loadDecks"><option value="">All subjects</option><option v-for="s in subjects" :key="s">{{s}}</option></select>
        <select v-model="filterTopic" @change="loadDecks"><option value="">All topics</option><option v-for="t in topics" :key="t">{{t}}</option></select>
      </div>

      <div v-if="loading" class="empty-state">Loading decks…</div>
      <div v-else-if="errorMsg" class="empty-state" style="color:var(--rose)">{{errorMsg}}</div>
      <template v-else>
        <div class="quiz-grid">
          <div class="quiz-card" v-for="d in decks" :key="d.id">
            <div class="quiz-card-header">
              <div>
                <div class="quiz-title">{{d.title}}</div>
                <div class="quiz-meta">{{d.subject}} · {{d.topic}} · {{d.card_count}} cards</div>
              </div>
              <span class="badge" :class="d.visibility==='public'?'badge-public':'badge-private'">{{d.visibility}}</span>
            </div>
            <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px">By {{d.owner_name}}</div>
            <div class="quiz-card-footer">
              <button class="btn-sm primary" @click="startDeck(d.id)">Study Deck</button>
              <div class="owner-actions" v-if="d.owner_id===currentUserId">
                <button class="btn-sm" @click="openEditDeck(d.id)">Edit</button>
                <button class="btn-sm" style="color:var(--rose)" @click="deleteDeck(d.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="decks.length===0">
          <div style="font-size:3rem;margin-bottom:12px">🧠</div>
          <div>No decks found. Create one to get started!</div>
        </div>
      </template>
    </template>

    <!-- ── HISTORY ────────────────────────────────────────────────── -->
    <template v-if="tab==='history' && !deckResults">
      <div v-if="historyLoading" class="empty-state">Loading history…</div>
      <template v-else>
        <div class="history-group" v-for="g in groupedDeckAttempts" :key="g.deckId">
          <div class="card">
            <div class="quiz-card-header">
              <div>
                <div class="quiz-title">{{g.title}}</div>
                <div class="quiz-meta">{{g.subject}} · {{g.topic}} · {{g.attempts.length}} session{{g.attempts.length>1?'s':''}}</div>
              </div>
              <span class="badge badge-public">Best {{g.best}}%</span>
            </div>
            <div class="attempt-list">
              <div class="attempt-row" v-for="a in g.attempts" :key="a.id">
                <span class="attempt-date">{{formatDate(a.created_at)}}</span>
                <span class="attempt-score">{{a.correct}}/{{a.total}} ({{Math.round(a.correct/a.total*100)}}%)</span>
                <button class="btn-sm" @click="viewAttempt(a.id)">Review</button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="groupedDeckAttempts.length===0">
          <div style="font-size:3rem;margin-bottom:12px">📊</div>
          <div>No study sessions yet. Study a deck to see your history here.</div>
        </div>
      </template>
    </template>

    <!-- ── STUDY SESSION ──────────────────────────────────────────── -->
    <template v-if="tab==='play' && playingDeck && !deckResults">
      <div class="quiz-take-wrap">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:'Sora',sans-serif;font-size:1rem;font-weight:700">{{playingDeck.title}}</span>
          <button class="btn-sm" @click="exitDeck">✕ Exit</button>
        </div>
        <div class="progress-bar-outer"><div class="progress-bar-inner" :style="{width:((currentCard+1)/playingDeck.cards.length*100)+'%'}"></div></div>
        <div class="question-num">Card {{currentCard+1}} of {{playingDeck.cards.length}}</div>
        <div @click="cardFlipped=!cardFlipped" style="cursor:pointer;perspective:1000px;margin-bottom:20px">
          <div :style="{transform:cardFlipped?'rotateY(180deg)':'rotateY(0deg)',transition:'transform .5s',transformStyle:'preserve-3d',position:'relative',minHeight:'200px'}">
            <div class="card" style="position:absolute;width:100%;min-height:200px;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px">
              <div style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Question</div>
              <div style="font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text)">{{playingDeck.cards[currentCard].q}}</div>
              <div style="margin-top:16px;font-size:.8rem;color:var(--muted)">Click to flip</div>
            </div>
            <div class="card" style="position:absolute;width:100%;min-height:200px;backface-visibility:hidden;transform:rotateY(180deg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:var(--indigo-lt);border-color:var(--indigo)">
              <div style="font-size:.72rem;font-weight:700;color:var(--indigo);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Answer</div>
              <div style="font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text)">{{playingDeck.cards[currentCard].a}}</div>
            </div>
          </div>
        </div>
        <div v-if="cardFlipped" style="display:flex;gap:12px;justify-content:center">
          <button class="btn-sm" style="flex:1;max-width:180px;padding:12px;color:var(--rose);border-color:var(--rose)" @click="markCard('wrong')">✗ Got it wrong</button>
          <button class="btn-sm primary" style="flex:1;max-width:180px;padding:12px" @click="markCard('correct')">✓ Got it right</button>
        </div>
        <div v-else style="text-align:center;color:var(--muted);font-size:.85rem;margin-top:8px">Flip the card then mark whether you got it right or wrong</div>
      </div>
    </template>

    <!-- ── RESULTS ────────────────────────────────────────────────── -->
    <template v-if="deckResults">
      <div class="quiz-take-wrap">
        <div class="score-circle">
          <div class="score-num">{{deckResults.correct}}/{{deckResults.total}}</div>
          <div class="score-label">Correct</div>
        </div>
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:700;margin-bottom:6px">
            {{Math.round(deckResults.correct/deckResults.total*100)}}% — {{deckResults.correct===deckResults.total?'Perfect!':deckResults.correct>=deckResults.total*.7?'Great job!':'Keep reviewing!'}}
          </div>
          <div style="color:var(--muted);font-size:.9rem">{{deckResults.correct}} correct · {{wrongCardDetails.length}} to review</div>
        </div>
        <template v-if="wrongCardDetails.length>0">
          <div class="section-title">Cards to Review</div>
          <div class="review-item" v-for="c in wrongCardDetails" :key="c.id">
            <div class="review-q">{{c.q}}</div>
            <div class="review-ans" style="color:#1D9E75;margin-top:4px">{{c.a}}</div>
          </div>
        </template>
        <div v-else class="card" style="text-align:center;color:#1D9E75;font-weight:600;padding:20px">🎉 You knew all the cards!</div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:center">
          <button class="btn-sm" @click="startDeck(resultsDeckId)">Study Again</button>
          <button class="btn-sm primary" @click="backFromResults">{{resultsContext==='history' ? 'Back to History' : 'Back to Browse'}}</button>
        </div>
      </div>
    </template>

    <!-- ── CREATE / EDIT MODAL ────────────────────────────────────── -->
    <div class="modal-overlay" v-if="showDeckModal" @click.self="showDeckModal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{editingDeckId?'Edit Deck':'Create New Deck'}}</h3>
          <button class="btn-sm" @click="showDeckModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="error-msg">{{formError}}</div>
          <div class="form-row">
            <div class="form-field"><label>Deck Title</label><input v-model="form.title" placeholder="e.g. Biology Vocabulary"/></div>
            <div class="form-field"><label>Subject</label><input v-model="form.subject" placeholder="e.g. Biology"/></div>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Topic</label><input v-model="form.topic" placeholder="e.g. Cell Biology"/></div>
            <div class="form-field"><label>Visibility</label>
              <select v-model="form.visibility"><option value="public">Public</option><option value="private">Private</option></select>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div class="section-title" style="margin-bottom:0">Cards</div>
            <button class="btn-sm" @click="form.cards.push({q:'',a:''})">+ Add Card</button>
          </div>
          <div class="question-block" v-for="(c,ci) in form.cards" :key="ci">
            <div class="question-block-header">
              <span class="question-block-title">Card {{ci+1}}</span>
              <button class="btn-sm" style="color:var(--rose)" @click="form.cards.splice(ci,1)" v-if="form.cards.length>1">Remove</button>
            </div>
            <div class="form-field"><label>Question / Front</label><input v-model="c.q" placeholder="Enter question or term"/></div>
            <div class="form-field"><label>Answer / Back</label><textarea v-model="c.a" placeholder="Enter answer or definition" rows="2" style="resize:vertical"></textarea></div>
          </div>
          <div class="modal-footer">
            <button class="btn-sm" @click="showDeckModal=false">Cancel</button>
            <button class="btn-sm primary" @click="saveDeck" :disabled="saving">{{saving?'Saving…':(editingDeckId?'Save Changes':'Create Deck')}}</button>
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
        decks: [],
        subjects: [],
        topics: [],
        search: '',
        filterSubject: '',
        filterTopic: '',
        loading: false,
        errorMsg: '',
        _debounce: null,

        showDeckModal: false,
        editingDeckId: null,
        formError: '',
        saving: false,
        form: { title: '', subject: '', topic: '', visibility: 'public', cards: [] },

        playingDeck: null,
        currentCard: 0,
        cardFlipped: false,
        cardResultsMap: {}, // { [cardId]: 'correct' | 'wrong' }
        deckResults: null,
        resultsDeckId: null,
        resultsContext: 'play', // 'play' | 'history'
        resultsWrongCards: [], // [{id,q,a}]

        attempts: [],
        historyLoading: false,
      };
    },

    computed: {
      wrongCardDetails() {
        return this.resultsWrongCards;
      },
      groupedDeckAttempts() {
        const map = new Map();
        for (const a of this.attempts) {
          if (!map.has(a.deck_id)) {
            map.set(a.deck_id, {
              deckId: a.deck_id, title: a.title, subject: a.subject,
              topic: a.topic, attempts: [], best: 0,
            });
          }
          const g = map.get(a.deck_id);
          g.attempts.push(a);
          const pct = Math.round((a.correct / a.total) * 100);
          if (pct > g.best) g.best = pct;
        }
        return Array.from(map.values());
      },
    },

    methods: {
      async loadDecks() {
        this.loading = true;
        this.errorMsg = '';
        try {
          const params = { search: this.search, subject: this.filterSubject, topic: this.filterTopic };
          if (this.tab === 'my') params.mine = 'true';
          this.decks = await api.getDecks(params);
        } catch (err) {
          this.errorMsg = err.message || 'Failed to load decks';
        } finally {
          this.loading = false;
        }
      },

      debouncedLoad() {
        clearTimeout(this._debounce);
        this._debounce = setTimeout(() => this.loadDecks(), 300);
      },

      async loadFilters() {
        try {
          const { subjects, topics } = await api.getDeckFilters();
          this.subjects = subjects;
          this.topics = topics;
        } catch (err) { /* non-fatal */ }
      },

      switchTab(t) {
        this.tab = t;
        this.playingDeck = null;
        this.deckResults = null;
        if (t === 'history') {
          this.loadAttempts();
        } else {
          this.loadDecks();
        }
      },

      async loadAttempts() {
        this.historyLoading = true;
        try {
          this.attempts = await api.getMyDeckAttempts();
        } catch (err) {
          this.attempts = [];
        } finally {
          this.historyLoading = false;
        }
      },

      async viewAttempt(attemptId) {
        try {
          const data = await api.getDeckAttempt(attemptId);
          this.deckResults = { correct: data.correct, total: data.total };
          this.resultsWrongCards = data.wrongCards;
          this.resultsDeckId = data.deckId;
          this.resultsContext = 'history';
        } catch (err) {
          alert(err.message || 'Failed to load attempt');
        }
      },

      backFromResults() {
        this.deckResults = null;
        if (this.resultsContext === 'history') {
          this.tab = 'history';
          this.loadAttempts();
        } else {
          this.exitDeck();
        }
      },

      formatDate(d) {
        return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
      },

      openCreateDeck() {
        this.editingDeckId = null;
        this.formError = '';
        this.form = { title: '', subject: '', topic: '', visibility: 'public', cards: [{ q: '', a: '' }] };
        this.showDeckModal = true;
      },

      async openEditDeck(id) {
        this.formError = '';
        try {
          const deck = await api.getDeck(id);
          this.editingDeckId = id;
          this.form = {
            title: deck.title, subject: deck.subject, topic: deck.topic, visibility: deck.visibility,
            cards: deck.cards.map(c => ({ q: c.q, a: c.a })),
          };
          this.showDeckModal = true;
        } catch (err) {
          alert(err.message || 'Failed to load deck for editing');
        }
      },

      async saveDeck() {
        this.formError = '';
        if (!this.form.title || !this.form.subject || !this.form.topic) {
          this.formError = 'Title, subject and topic are required.';
          return;
        }
        for (const c of this.form.cards) {
          if (!c.q.trim() || !c.a.trim()) {
            this.formError = 'Every card needs both a question and an answer.';
            return;
          }
        }
        this.saving = true;
        try {
          if (this.editingDeckId) {
            await api.updateDeck(this.editingDeckId, this.form);
          } else {
            await api.createDeck(this.form);
          }
          this.showDeckModal = false;
          await this.loadDecks();
          await this.loadFilters();
        } catch (err) {
          this.formError = err.message || 'Failed to save deck';
        } finally {
          this.saving = false;
        }
      },

      async deleteDeck(id) {
        if (!confirm('Delete this deck? This cannot be undone.')) return;
        try {
          await api.deleteDeck(id);
          await this.loadDecks();
        } catch (err) {
          alert(err.message || 'Failed to delete deck');
        }
      },

      async startDeck(id) {
        try {
          const deck = await api.getDeck(id);
          this.playingDeck = deck;
          this.currentCard = 0;
          this.cardFlipped = false;
          this.cardResultsMap = {};
          this.deckResults = null;
          this.tab = 'play';
        } catch (err) {
          alert(err.message || 'Failed to load deck');
        }
      },

      async markCard(result) {
        const cardId = this.playingDeck.cards[this.currentCard].id;
        this.cardResultsMap[cardId] = result;

        if (this.currentCard < this.playingDeck.cards.length - 1) {
          this.currentCard++;
          this.cardFlipped = false;
        } else {
          try {
            const res = await api.submitDeckAttempt(this.playingDeck.id, this.cardResultsMap);
            this.deckResults = { correct: res.correct, total: res.total };
            const wrongIds = new Set(res.wrongCards);
            this.resultsWrongCards = this.playingDeck.cards.filter(c => wrongIds.has(c.id));
            this.resultsDeckId = this.playingDeck.id;
            this.resultsContext = 'play';
          } catch (err) {
            alert(err.message || 'Failed to submit results');
          }
        }
      },

      exitDeck() {
        this.playingDeck = null;
        this.deckResults = null;
        this.tab = 'browse';
        this.loadDecks();
      },
    },

    mounted() {
      this.loadDecks();
      this.loadFilters();
    },
  });
})();
