const express = require('express');
const router = express.Router();
const pool = require('../db');
const { analyzeSkillGaps } = require('../services/openrouter');

//  GET STATS AND RECORDS 
router.get('/', async (req, res) => {
  try {
    // 1. Get manual logs
    const [manualLogs] = await pool.query(
      'SELECT id, subject, DATE_FORMAT(date, "%Y-%m-%d") as date, study_minutes, modules_completed, mastery, quiz_score, skill_gap FROM analytics_records WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );

    // 2. Get real quiz attempts to integrate
    const [quizAttempts] = await pool.query(
      `SELECT qa.id, q.title as subject, DATE_FORMAT(qa.created_at, "%Y-%m-%d") as date, 
       qa.score, qa.total, ROUND((qa.score / qa.total) * 100) as percentage
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       WHERE qa.user_id = ?`,
      [req.userId]
    );

    // 3. Get real deck attempts to integrate
    const [deckAttempts] = await pool.query(
      `SELECT fa.id, fd.title as subject, DATE_FORMAT(fa.created_at, "%Y-%m-%d") as date, 
       fa.correct, fa.total, ROUND((fa.correct / fa.total) * 100) as percentage
       FROM flashcard_attempts fa 
       JOIN flashcard_decks fd ON fa.deck_id = fd.id 
       WHERE fa.user_id = ?`,

      [req.userId]
    );

    // Combine manual logs and automatic logs for the dashboard
    // If a quiz or deck attempt exists, we can treat it as a record with virtual study time (e.g. 15 mins)
    const integratedRecords = [...manualLogs];

    quizAttempts.forEach(qa => {
      integratedRecords.push({
        id: `quiz-${qa.id}`,
        subject: `Quiz: ${qa.subject}`,
        date: qa.date,
        study_minutes: 15, // virtual study time for a quiz
        modules_completed: 1,
        mastery: qa.percentage,
        quiz_score: qa.percentage,
        skill_gap: qa.percentage < 70
      });
    });

    deckAttempts.forEach(da => {
      integratedRecords.push({
        id: `deck-${da.id}`,
        subject: `Deck: ${da.subject}`,
        date: da.date,
        study_minutes: 10, // virtual study time for cards
        modules_completed: 1,
        mastery: da.percentage,
        quiz_score: null,
        skill_gap: da.percentage < 70
      });
    });

    // Sort combined records by date descending
    integratedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(integratedRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

//  LOG STUDY SESSION 
router.post('/', async (req, res) => {
  const { subject, date, study_minutes, modules_completed, mastery, quiz_score } = req.body;

  if (!subject || !date) {
    return res.status(400).json({ error: 'Subject and date are required' });
  }

  const minutes = Number(study_minutes || 0);
  const modules = Number(modules_completed || 0);
  const masteryVal = Number(mastery || 0);
  const scoreVal = quiz_score !== undefined && quiz_score !== null ? Number(quiz_score) : null;

  // Determine skill gap automatically if score/mastery is low
  const hasSkillGap = (masteryVal < 70) || (scoreVal !== null && scoreVal < 70);

  try {
    const [result] = await pool.query(
      `INSERT INTO analytics_records 
       (user_id, subject, date, study_minutes, modules_completed, mastery, quiz_score, skill_gap) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, subject, date, minutes, modules, masteryVal, scoreVal, hasSkillGap]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.userId,
      subject,
      date,
      study_minutes: minutes,
      modules_completed: modules,
      mastery: masteryVal,
      quiz_score: scoreVal,
      skill_gap: hasSkillGap
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log study session' });
  }
});

//  AI SKILL GAP ANALYSIS 
router.post('/skill-gaps', async (req, res) => {
  try {
    // 1. Get manual logs
    const [records] = await pool.query('SELECT subject, mastery, quiz_score FROM analytics_records WHERE user_id = ?', [req.userId]);

    // 2. Get real quiz/deck history
    const [quizzes] = await pool.query('SELECT score, total FROM quiz_attempts WHERE user_id = ?', [req.userId]);
    const [decks] = await pool.query('SELECT correct, total FROM flashcard_attempts WHERE user_id = ?', [req.userId]);

    // 3. Trigger OpenRouter AI service
    const attempts = [...quizzes, ...decks];
    const skillGaps = await analyzeSkillGaps(records, attempts);

    res.json(skillGaps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to perform skill gap analysis' });
  }
});

module.exports = router;
