const express = require('express');
const router = express.Router();
const pool = require('../db');

// ── SCHEMA NOTE ───────────────────────────────────────────────────────
// The tracker reuses the study_plans table with an extended shape.
// Extra columns (exam_type, priority, completed) are added by migrate.js.
// All existing planner rows have exam_type = NULL (treated as study tasks).
// ─────────────────────────────────────────────────────────────────────

// Helper: compute badge text from deadline date
function computeBadge(deadlineStr) {
  const now   = new Date();
  const due   = new Date(deadlineStr);
  const diff  = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { text: 'Overdue',        cls: 'badge-red' };
  if (diff === 0) return { text: 'Today',          cls: 'badge-red' };
  if (diff === 1) return { text: 'Tomorrow',       cls: 'badge-red' };
  if (diff <= 3)  return { text: `${diff} days left`, cls: 'badge-orange' };
  if (diff <= 7)  return { text: `${diff} days left`, cls: 'badge-purple' };
  return           { text: `${diff} days left`,    cls: 'badge-blue' };
}

// Helper: map priority to border color class
function priorityColor(priority) {
  if (priority === 'high')   return 'border-orange';
  if (priority === 'low')    return 'border-blue';
  return 'border-yellow'; // medium (default)
}

// GET all tracker deadlines for current user
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id,
              task AS title,
              DATE_FORMAT(deadline, '%Y-%m-%d') AS deadline,
              status,
              COALESCE(exam_type, 'Task') AS exam_type,
              COALESCE(priority, 'medium') AS priority,
              COALESCE(completed, FALSE) AS completed,
              exam_time,
              subject
       FROM study_plans
       WHERE user_id = ?
       ORDER BY deadline ASC`,
      [req.userId]
    );

    // Attach computed badge + color for the frontend
    const enriched = rows.map(r => ({
      ...r,
      completed: Boolean(r.completed),
      colorClass: priorityColor(r.priority),
      ...computeBadge(r.deadline),
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tracker deadlines' });
  }
});

// GET summary counts (used by stat cards)
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekLater = new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0];

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM study_plans WHERE user_id = ? AND COALESCE(completed, 0) = 0',
      [req.userId]
    );
    const [[{ this_week }]] = await pool.query(
      'SELECT COUNT(*) AS this_week FROM study_plans WHERE user_id = ? AND deadline BETWEEN ? AND ? AND COALESCE(completed, 0) = 0',
      [req.userId, today, weekLater]
    );
    const [[{ completed }]] = await pool.query(
      'SELECT COUNT(*) AS completed FROM study_plans WHERE user_id = ? AND COALESCE(completed, 0) = 1',
      [req.userId]
    );
    const [[{ overdue }]] = await pool.query(
      'SELECT COUNT(*) AS overdue FROM study_plans WHERE user_id = ? AND deadline < ? AND COALESCE(completed, 0) = 0',
      [req.userId, today]
    );

    res.json({ upcoming: total, this_week, completed, overdue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tracker stats' });
  }
});

// POST create a new deadline
router.post('/', async (req, res) => {
  const { title, deadline, exam_type, priority, exam_time, subject, status } = req.body;
  if (!title || !deadline) return res.status(400).json({ error: 'title and deadline are required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO study_plans
         (user_id, task, deadline, status, exam_type, priority, exam_time, subject)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        title,
        deadline,
        status || 'Pending',
        exam_type || 'Task',
        priority || 'medium',
        exam_time || null,
        subject || null,
      ]
    );

    const badge = computeBadge(deadline);
    res.status(201).json({
      id: result.insertId,
      title,
      deadline,
      status: status || 'Pending',
      exam_type: exam_type || 'Task',
      priority: priority || 'medium',
      exam_time: exam_time || null,
      subject: subject || null,
      completed: false,
      colorClass: priorityColor(priority || 'medium'),
      text: badge.text,
      cls: badge.cls,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create deadline' });
  }
});

// PUT update a deadline (title, date, priority, completed toggle, etc.)
router.put('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id FROM study_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Deadline not found or access denied' });

    const allowed = ['task', 'deadline', 'status', 'exam_type', 'priority', 'exam_time', 'subject', 'completed'];
    const fieldMap = { title: 'task' }; // frontend sends "title", DB column is "task"

    const updates = {};
    for (const [k, v] of Object.entries(req.body)) {
      const col = fieldMap[k] || k;
      if (allowed.includes(col) && v !== undefined) updates[col] = v;
    }

    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update' });

    const setClause = Object.keys(updates).map(c => `${c} = ?`).join(', ');
    await pool.query(
      `UPDATE study_plans SET ${setClause} WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );
    res.json({ message: 'Deadline updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update deadline' });
  }
});

// PATCH toggle completed status
router.patch('/:id/complete', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id, COALESCE(completed, 0) AS completed FROM study_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Deadline not found or access denied' });

    const newVal = row.completed ? 0 : 1;
    await pool.query('UPDATE study_plans SET completed = ? WHERE id = ?', [newVal, req.params.id]);
    res.json({ id: req.params.id, completed: Boolean(newVal) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle completion' });
  }
});

// DELETE a deadline
router.delete('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id FROM study_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Deadline not found or access denied' });

    await pool.query('DELETE FROM study_plans WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete deadline' });
  }
});

module.exports = router;