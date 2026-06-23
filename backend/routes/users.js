const express = require('express');
const router = express.Router();
const pool = require('../db');

//  GET /api/users/me 
// Returns the "logged in" user based on x-user-id header (defaults to 1)
router.get('/me', async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id, name, email, initials FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

//  GET /api/users 
// List all users — handy for a login/profile-switcher dropdown in dev
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, initials FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
