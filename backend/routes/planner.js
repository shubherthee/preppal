const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateStudySchedule } = require('../services/openrouter');

//  STUDY PLANS CRUD 

// Get all study plans for the logged-in user
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id as plan_id, user_id, task, DATE_FORMAT(deadline, "%Y-%m-%d") as deadline, status FROM study_plans WHERE user_id = ? ORDER BY deadline ASC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch study plans' });
  }
});

// Create a study plan
router.post('/', async (req, res) => {
  const { task, deadline, status } = req.body;
  if (!task || !deadline) {
    return res.status(400).json({ error: 'Task name and deadline are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO study_plans (user_id, task, deadline, status) VALUES (?, ?, ?, ?)',
      [req.userId, task, deadline, status || 'Pending']
    );
    res.status(201).json({
      plan_id: result.insertId,
      user_id: req.userId,
      task,
      deadline,
      status: status || 'Pending'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create study plan' });
  }
});

// Update a study plan
router.put('/:id', async (req, res) => {
  const { task, deadline, status } = req.body;
  try {
    // Verify ownership
    const [[plan]] = await pool.query('SELECT id FROM study_plans WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!plan) return res.status(404).json({ error: 'Study plan not found or access denied' });

    const updates = {};
    if (task !== undefined) updates.task = task;
    if (deadline !== undefined) updates.deadline = deadline;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    await pool.query(`UPDATE study_plans SET ${setClause} WHERE id = ?`, values);
    res.json({ message: 'Study plan updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update study plan' });
  }
});

// Delete a study plan
router.delete('/:id', async (req, res) => {
  try {
    const [[plan]] = await pool.query('SELECT id FROM study_plans WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!plan) return res.status(404).json({ error: 'Study plan not found or access denied' });

    await pool.query('DELETE FROM study_plans WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete study plan' });
  }
});


//  REMINDERS 

// Get all reminders
router.get('/reminders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, DATE_FORMAT(time, "%Y-%m-%d %H:%i") as time, status FROM reminders WHERE user_id = ? ORDER BY time ASC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create a reminder
router.post('/reminders', async (req, res) => {
  const { title, time, status } = req.body;
  if (!title || !time) {
    return res.status(400).json({ error: 'Title and time are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reminders (user_id, title, time, status) VALUES (?, ?, ?, ?)',
      [req.userId, title, time, status || 'Set']
    );
    res.status(201).json({
      id: result.insertId,
      user_id: req.userId,
      title,
      time,
      status: status || 'Set'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Delete a reminder
router.delete('/reminders/:id', async (req, res) => {
  try {
    const [[reminder]] = await pool.query('SELECT id FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!reminder) return res.status(404).json({ error: 'Reminder not found or access denied' });

    await pool.query('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});


//  MATERIALS 

// Get all study materials
router.get('/materials', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, filename, description, created_at FROM study_materials WHERE user_id = ? ORDER BY id DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch study materials' });
  }
});

// Create a study material record
router.post('/materials', async (req, res) => {
  const { filename, description } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO study_materials (user_id, filename, description) VALUES (?, ?, ?)',
      [req.userId, filename, description || '']
    );
    res.status(201).json({
      id: result.insertId,
      user_id: req.userId,
      filename,
      description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log study material' });
  }
});


//  AI SCHEDULE GENERATOR 

// Get current generated AI schedule
router.get('/schedule', async (req, res) => {
  try {
    const [[schedule]] = await pool.query('SELECT schedule_data FROM ai_schedules WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    if (!schedule) {
      return res.json([]);
    }
    // Handle database string/json format
    const data = typeof schedule.schedule_data === 'string' ? JSON.parse(schedule.schedule_data) : schedule.schedule_data;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Generate and cache recommended schedule using OpenRouter
router.post('/generate-schedule', async (req, res) => {
  try {
    // 1. Get user's active plans
    const [plans] = await pool.query('SELECT task, DATE_FORMAT(deadline, "%Y-%m-%d") as deadline, status FROM study_plans WHERE user_id = ?', [req.userId]);

    // 2. Get user's analytics (to know what subjects they are studying or struggling with)
    const [analytics] = await pool.query('SELECT subject, mastery, quiz_score FROM analytics_records WHERE user_id = ?', [req.userId]);

    // 3. Call OpenRouter AI service
    const generatedSchedule = await generateStudySchedule(plans, analytics);

    // 4. Save/Cache in database
    const scheduleJson = JSON.stringify(generatedSchedule);
    
    // Check if user already has a schedule record
    const [[existing]] = await pool.query('SELECT id FROM ai_schedules WHERE user_id = ?', [req.userId]);
    if (existing) {
      await pool.query('UPDATE ai_schedules SET schedule_data = ? WHERE id = ?', [scheduleJson, existing.id]);
    } else {
      await pool.query('INSERT INTO ai_schedules (user_id, schedule_data) VALUES (?, ?)', [req.userId, scheduleJson]);
    }

    res.json(generatedSchedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate study schedule' });
  }
});

module.exports = router;
