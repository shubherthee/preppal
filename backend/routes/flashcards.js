const express = require('express');
const router = express.Router();
const pool = require('../db');

// ── GET /api/decks ─────────────────────────────────────────────────────
// Query params: subject, topic, search, mine=true
router.get('/', async (req, res) => {
  try {
    const { subject, topic, search, mine } = req.query;
    const userId = req.userId;

    let sql = `
      SELECT d.id, d.title, d.subject, d.topic, d.visibility,
             d.owner_id, u.name AS owner_name, d.created_at,
             (SELECT COUNT(*) FROM flashcards f WHERE f.deck_id = d.id) AS card_count
      FROM flashcard_decks d
      JOIN users u ON u.id = d.owner_id
      WHERE 1=1
    `;
    const params = [];

    if (mine === 'true') {
      sql += ' AND d.owner_id = ?';
      params.push(userId);
    } else {
      sql += ' AND (d.visibility = "public" OR d.owner_id = ?)';
      params.push(userId);
    }

    if (subject) { sql += ' AND d.subject = ?'; params.push(subject); }
    if (topic)   { sql += ' AND d.topic = ?';   params.push(topic); }
    if (search) {
      sql += ' AND (d.title LIKE ? OR d.subject LIKE ? OR d.topic LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    sql += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// ── GET /api/decks/attempts/mine ──────────────────────────────────────
// All past study sessions by the current user, across all decks
router.get('/attempts/mine', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      `SELECT a.id, a.deck_id, a.correct, a.total, a.created_at,
              d.title, d.subject, d.topic
       FROM flashcard_attempts a
       JOIN flashcard_decks d ON d.id = a.deck_id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempt history' });
  }
});

// ── GET /api/decks/attempts/:attemptId ────────────────────────────────
// Full detail (including the cards marked wrong) for one past session
router.get('/attempts/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.userId;

    const [[attempt]] = await pool.query(
      `SELECT a.*, d.title, d.subject, d.topic
       FROM flashcard_attempts a JOIN flashcard_decks d ON d.id = a.deck_id
       WHERE a.id = ?`,
      [attemptId]
    );
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.user_id !== userId) return res.status(403).json({ error: 'Not your attempt' });

    const wrongIds = typeof attempt.wrong_cards === 'string' ? JSON.parse(attempt.wrong_cards) : attempt.wrong_cards;

    let wrongCards = [];
    if (Array.isArray(wrongIds) && wrongIds.length > 0) {
      const [cards] = await pool.query(
        `SELECT id, question AS q, answer AS a FROM flashcards WHERE id IN (?)`,
        [wrongIds]
      );
      wrongCards = cards;
    }

    res.json({
      id: attempt.id,
      deckId: attempt.deck_id,
      title: attempt.title,
      subject: attempt.subject,
      topic: attempt.topic,
      correct: attempt.correct,
      total: attempt.total,
      createdAt: attempt.created_at,
      wrongCards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
});

// ── GET /api/decks/meta/filters ───────────────────────────────────────
router.get('/meta/filters', async (req, res) => {
  try {
    const userId = req.userId;
    const [subjects] = await pool.query(
      `SELECT DISTINCT subject FROM flashcard_decks WHERE visibility='public' OR owner_id=? ORDER BY subject`,
      [userId]
    );
    const [topics] = await pool.query(
      `SELECT DISTINCT topic FROM flashcard_decks WHERE visibility='public' OR owner_id=? ORDER BY topic`,
      [userId]
    );
    res.json({
      subjects: subjects.map(r => r.subject),
      topics: topics.map(r => r.topic),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// ── GET /api/decks/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [[deck]] = await pool.query(
      `SELECT d.*, u.name AS owner_name FROM flashcard_decks d
       JOIN users u ON u.id = d.owner_id WHERE d.id = ?`,
      [id]
    );
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    if (deck.visibility === 'private' && deck.owner_id !== userId) {
      return res.status(403).json({ error: 'This deck is private' });
    }

    const [cards] = await pool.query(
      `SELECT id, question AS q, answer AS a FROM flashcards WHERE deck_id = ? ORDER BY position ASC`,
      [id]
    );

    res.json({ ...deck, cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
});

// ── POST /api/decks ────────────────────────────────────────────────────
// Body: { title, subject, topic, visibility, cards:[{q,a}] }
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { title, subject, topic, visibility, cards } = req.body;
    const userId = req.userId;

    if (!title || !subject || !topic || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'title, subject, topic and at least one card are required' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO flashcard_decks (title, subject, topic, visibility, owner_id) VALUES (?, ?, ?, ?, ?)`,
      [title, subject, topic, visibility || 'public', userId]
    );
    const deckId = result.insertId;

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      await conn.query(
        `INSERT INTO flashcards (deck_id, question, answer, position) VALUES (?, ?, ?, ?)`,
        [deckId, c.q, c.a, i]
      );
    }

    await conn.commit();
    res.status(201).json({ id: deckId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create deck' });
  } finally {
    conn.release();
  }
});

// ── PUT /api/decks/:id ──────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, subject, topic, visibility, cards } = req.body;

    const [[deck]] = await conn.query('SELECT owner_id FROM flashcard_decks WHERE id = ?', [id]);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    if (deck.owner_id !== userId) return res.status(403).json({ error: 'You can only edit your own decks' });

    if (!title || !subject || !topic || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'title, subject, topic and at least one card are required' });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE flashcard_decks SET title=?, subject=?, topic=?, visibility=? WHERE id=?`,
      [title, subject, topic, visibility || 'public', id]
    );

    await conn.query('DELETE FROM flashcards WHERE deck_id = ?', [id]);
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      await conn.query(
        `INSERT INTO flashcards (deck_id, question, answer, position) VALUES (?, ?, ?, ?)`,
        [id, c.q, c.a, i]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to update deck' });
  } finally {
    conn.release();
  }
});

// ── DELETE /api/decks/:id ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [[deck]] = await pool.query('SELECT owner_id FROM flashcard_decks WHERE id = ?', [id]);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    if (deck.owner_id !== userId) return res.status(403).json({ error: 'You can only delete your own decks' });

    await pool.query('DELETE FROM flashcard_decks WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

// ── POST /api/decks/:id/attempts ────────────────────────────────────────
// Body: { results: { "<cardId>": "correct"|"wrong", ... } }
router.post('/:id/attempts', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { results } = req.body; // { cardId: 'correct'|'wrong' }

    const [[deck]] = await pool.query('SELECT visibility, owner_id FROM flashcard_decks WHERE id = ?', [id]);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    if (deck.visibility === 'private' && deck.owner_id !== userId) {
      return res.status(403).json({ error: 'This deck is private' });
    }

    const entries = Object.entries(results || {});
    const total = entries.length;
    const correct = entries.filter(([, v]) => v === 'correct').length;
    const wrongCards = entries.filter(([, v]) => v === 'wrong').map(([k]) => parseInt(k, 10));

    await pool.query(
      `INSERT INTO flashcard_attempts (deck_id, user_id, correct, total, wrong_cards) VALUES (?, ?, ?, ?, ?)`,
      [id, userId, correct, total, JSON.stringify(wrongCards)]
    );

    res.json({ correct, total, wrongCards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
});

module.exports = router;
