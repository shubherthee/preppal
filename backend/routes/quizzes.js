const express = require('express');
const router = express.Router();
const pool = require('../db');

//  GET /api/quizzes 
// Query params: subject, topic, search, mine=true
router.get('/', async (req, res) => {
  try {
    const { subject, topic, search, mine } = req.query;
    const userId = req.userId;

    let sql = `
      SELECT q.id, q.title, q.subject, q.topic, q.difficulty, q.visibility,
             q.owner_id, u.name AS owner_name, q.created_at,
             (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count
      FROM quizzes q
      JOIN users u ON u.id = q.owner_id
      WHERE 1=1
    `;
    const params = [];

    if (mine === 'true') {
      sql += ' AND q.owner_id = ?';
      params.push(userId);
    } else {
      // visible = public, OR private owned by current user
      sql += ' AND (q.visibility = "public" OR q.owner_id = ?)';
      params.push(userId);
    }

    if (subject) { sql += ' AND q.subject = ?'; params.push(subject); }
    if (topic)   { sql += ' AND q.topic = ?';   params.push(topic); }
    if (search) {
      sql += ' AND (q.title LIKE ? OR q.subject LIKE ? OR q.topic LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    sql += ' ORDER BY q.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

//  GET /api/quizzes/attempts/mine 
// All past attempts by the current user, across all quizzes
router.get('/attempts/mine', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      `SELECT a.id, a.quiz_id, a.score, a.total, a.created_at,
              q.title, q.subject, q.topic, q.difficulty
       FROM quiz_attempts a
       JOIN quizzes q ON q.id = a.quiz_id
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

//  GET /api/quizzes/attempts/:attemptId 
// Full review (question-by-question) for one past attempt
router.get('/attempts/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.userId;

    const [[attempt]] = await pool.query(
      `SELECT a.*, q.title, q.subject, q.topic, q.difficulty
       FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id
       WHERE a.id = ?`,
      [attemptId]
    );
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.user_id !== userId) return res.status(403).json({ error: 'Not your attempt' });

    const [questions] = await pool.query(
      `SELECT id, question_text AS text, choices, correct_index AS \`correct\`
       FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC`,
      [attempt.quiz_id]
    );

    const answers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;

    const results = questions.map((q, i) => {
      const choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
      const chosen = answers[i] !== undefined ? answers[i] : answers[String(i)];
      const isCorrect = chosen === q.correct;
      return { index: i, text: q.text, choices, correct: q.correct, chosen: chosen !== undefined ? chosen : null, isCorrect };
    });

    res.json({
      id: attempt.id,
      quizId: attempt.quiz_id,
      title: attempt.title,
      subject: attempt.subject,
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      score: attempt.score,
      total: attempt.total,
      createdAt: attempt.created_at,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
});

//  GET /api/quizzes/subjects-topics 
// Returns distinct subjects/topics for filter dropdowns
router.get('/meta/filters', async (req, res) => {
  try {
    const userId = req.userId;
    const [subjects] = await pool.query(
      `SELECT DISTINCT subject FROM quizzes WHERE visibility='public' OR owner_id=? ORDER BY subject`,
      [userId]
    );
    const [topics] = await pool.query(
      `SELECT DISTINCT topic FROM quizzes WHERE visibility='public' OR owner_id=? ORDER BY topic`,
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

//  GET /api/quizzes/:id 
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [[quiz]] = await pool.query(
      `SELECT q.*, u.name AS owner_name FROM quizzes q
       JOIN users u ON u.id = q.owner_id WHERE q.id = ?`,
      [id]
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.visibility === 'private' && quiz.owner_id !== userId) {
      return res.status(403).json({ error: 'This quiz is private' });
    }

    const [questions] = await pool.query(
      `SELECT id, question_text AS text, choices, correct_index AS \`correct\`
       FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC`,
      [id]
    );

    questions.forEach(q => {
      q.choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
    });

    res.json({ ...quiz, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

//  POST /api/quizzes 
// Body: { title, subject, topic, difficulty, visibility, questions:[{text,choices,correct}] }
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { title, subject, topic, difficulty, visibility, questions } = req.body;
    const userId = req.userId;

    if (!title || !subject || !topic || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'title, subject, topic and at least one question are required' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO quizzes (title, subject, topic, difficulty, visibility, owner_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, subject, topic, difficulty || 'Medium', visibility || 'public', userId]
    );
    const quizId = result.insertId;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await conn.query(
        `INSERT INTO quiz_questions (quiz_id, question_text, choices, correct_index, position)
         VALUES (?, ?, ?, ?, ?)`,
        [quizId, q.text, JSON.stringify(q.choices), q.correct, i]
      );
    }

    await conn.commit();
    res.status(201).json({ id: quizId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  } finally {
    conn.release();
  }
});

//  PUT /api/quizzes/:id 
router.put('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, subject, topic, difficulty, visibility, questions } = req.body;

    const [[quiz]] = await conn.query('SELECT owner_id FROM quizzes WHERE id = ?', [id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    if (quiz.owner_id !== userId) return res.status(403).json({ error: 'You can only edit your own quizzes' });

    if (!title || !subject || !topic || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'title, subject, topic and at least one question are required' });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE quizzes SET title=?, subject=?, topic=?, difficulty=?, visibility=? WHERE id=?`,
      [title, subject, topic, difficulty || 'Medium', visibility || 'public', id]
    );

    // Replace questions wholesale (simplest correct approach for an edit form)
    await conn.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [id]);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await conn.query(
        `INSERT INTO quiz_questions (quiz_id, question_text, choices, correct_index, position)
         VALUES (?, ?, ?, ?, ?)`,
        [id, q.text, JSON.stringify(q.choices), q.correct, i]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to update quiz' });
  } finally {
    conn.release();
  }
});

//  DELETE /api/quizzes/:id 
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [[quiz]] = await pool.query('SELECT owner_id FROM quizzes WHERE id = ?', [id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    if (quiz.owner_id !== userId) return res.status(403).json({ error: 'You can only delete your own quizzes' });

    await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

//  POST /api/quizzes/:id/attempts 
// Body: { answers: { "0": 1, "1": 2, ... } }  (questionIndex -> chosenChoiceIndex)
// Returns: { score, total, results: [...] }
router.post('/:id/attempts', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { answers } = req.body;

    const [[quiz]] = await pool.query('SELECT visibility, owner_id FROM quizzes WHERE id = ?', [id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    if (quiz.visibility === 'private' && quiz.owner_id !== userId) {
      return res.status(403).json({ error: 'This quiz is private' });
    }

    const [questions] = await pool.query(
      `SELECT id, question_text AS text, choices, correct_index AS \`correct\`
       FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC`,
      [id]
    );

    let score = 0;
    const results = questions.map((q, i) => {
      const choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
      const chosen = answers[i] !== undefined ? answers[i] : answers[String(i)];
      const isCorrect = chosen === q.correct;
      if (isCorrect) score++;
      return {
        index: i,
        text: q.text,
        choices,
        correct: q.correct,
        chosen: chosen !== undefined ? chosen : null,
        isCorrect,
      };
    });

    await pool.query(
      `INSERT INTO quiz_attempts (quiz_id, user_id, score, total, answers) VALUES (?, ?, ?, ?, ?)`,
      [id, userId, score, questions.length, JSON.stringify(answers)]
    );

    res.json({ score, total: questions.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
});

module.exports = router;
