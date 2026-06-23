const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

// Admin check middleware
function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }
  next();
}

// Attach middleware to all routes in this router
router.use(requireAdmin);

// ── GET /api/admin/stats ──────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[{ count: studentCount }]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
    const [[{ count: tutorCount }]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'tutor'");
    const [[{ count: bookingCount }]] = await pool.query("SELECT COUNT(*) AS count FROM bookings");
    
    // Fetch tutors list
    const [tutorRows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.initials, u.bio, 
             tp.rate, tp.subjects, tp.rating, tp.reviews_count, tp.status, tp.verified
      FROM users u
      LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor'
      ORDER BY u.id
    `);

    const avatars = [
      'assets/tutor-sarah.png',
      'assets/tutor-james.png',
      'assets/tutor-emily.png',
      'assets/tutor-david.png'
    ];

    const tutors = tutorRows.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      initials: t.initials,
      bio: t.bio || 'Experienced academic tutor.',
      rate: Number(t.rate) || 30,
      subjects: typeof t.subjects === 'string' ? JSON.parse(t.subjects) : (t.subjects || ['General']),
      rating: Number(t.rating) || 5.0,
      reviewsCount: t.reviews_count || 0,
      status: t.status || 'available',
      verified: !!t.verified,
      avatar: avatars[(t.id - 1) % avatars.length]
    }));

    res.json({
      studentCount,
      tutorCount,
      bookingCount,
      tutors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// ── GET /api/admin/bookings ───────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.student_id, b.tutor_id, b.booking_date, b.booking_time, b.duration, b.total_cost, b.status, b.payment_status,
             u_student.name AS student_name, u_student.initials AS student_initials,
             u_tutor.name AS tutor_name, tp.rate AS tutor_rate, tp.subjects AS tutor_subjects, tp.status AS tutor_status, u_tutor.bio AS tutor_bio, tp.rating AS tutor_rating
      FROM bookings b
      JOIN users u_student ON b.student_id = u_student.id
      JOIN users u_tutor ON b.tutor_id = u_tutor.id
      LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.user_id
      ORDER BY b.id DESC
    `);

    const avatars = [
      'assets/tutor-sarah.png',
      'assets/tutor-james.png',
      'assets/tutor-emily.png',
      'assets/tutor-david.png'
    ];

    const bookings = rows.map(b => ({
      id: b.id,
      studentId: b.student_id,
      studentName: b.student_name,
      studentInitials: b.student_initials,
      date: b.booking_date.toISOString().split('T')[0], // yyyy-mm-dd format
      time: b.booking_time.substring(0, 5), // hh:mm format
      duration: b.duration,
      totalCost: Number(b.total_cost),
      status: b.status,
      paymentStatus: b.payment_status,
      tutor: {
        id: b.tutor_id,
        name: b.tutor_name,
        rate: Number(b.tutor_rate) || 30,
        subjects: typeof b.tutor_subjects === 'string' ? JSON.parse(b.tutor_subjects) : (b.tutor_subjects || ['General']),
        status: b.tutor_status || 'available',
        bio: b.tutor_bio || 'Experienced academic tutor.',
        rating: Number(b.tutor_rating) || 5.0,
        avatar: avatars[(b.tutor_id - 1) % avatars.length]
      }
    }));

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ── DELETE /api/admin/bookings/:id ────────────────────────────────────
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ── POST /api/admin/tutors ────────────────────────────────────────────
router.post('/tutors', async (req, res) => {
  try {
    const { name, email, rate, subjects, status, bio } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const tempPassword = 'password123';
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    // Generate initials
    const parts = name.trim().split(/\s+/);
    let initials = '??';
    if (parts.length > 0) {
      if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
    }

    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password_hash, initials, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, initials, 'tutor', bio || 'Expert tutor.']
    );
    const userId = userResult.insertId;

    const subjectsArr = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(Boolean);
    await pool.query(
      'INSERT INTO tutor_profiles (user_id, rate, subjects, rating, reviews_count, status, verified) VALUES (?, ?, ?, 5.0, 0, ?, TRUE)',
      [userId, Number(rate) || 30.00, JSON.stringify(subjectsArr), status || 'available']
    );

    const avatars = [
      'assets/tutor-sarah.png',
      'assets/tutor-james.png',
      'assets/tutor-emily.png',
      'assets/tutor-david.png'
    ];

    res.status(201).json({
      status: 'success',
      tutor: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        initials,
        bio: bio || 'Expert tutor.',
        rate: Number(rate) || 30.00,
        subjects: subjectsArr,
        rating: 5.0,
        reviewsCount: 0,
        status: status || 'available',
        verified: true,
        avatar: avatars[(userId - 1) % avatars.length]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tutor' });
  }
});

// ── PUT /api/admin/tutors/:id ─────────────────────────────────────────
router.put('/tutors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rate, subjects, status, bio } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Update user bio & name
    await pool.query('UPDATE users SET name = ?, bio = ? WHERE id = ?', [name.trim(), bio || '', id]);

    // Update profile
    const subjectsArr = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(Boolean);
    await pool.query(
      'UPDATE tutor_profiles SET rate = ?, subjects = ?, status = ? WHERE user_id = ?',
      [Number(rate) || 30.00, JSON.stringify(subjectsArr), status || 'available', id]
    );

    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tutor details' });
  }
});

// ── DELETE /api/admin/tutors/:id ──────────────────────────────────────
router.delete('/tutors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Tutor deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tutor' });
  }
});

// ── PUT /api/admin/tutors/:id/status ──────────────────────────────────
router.put('/tutors/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['available', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE tutor_profiles SET status = ? WHERE user_id = ?', [status, id]);
    res.json({ status: 'success', message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tutor status' });
  }
});

// ── GET /api/admin/moderation ─────────────────────────────────────────
router.get('/moderation', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT fc.id, fc.reporter_id, fc.content_type, fc.content_id, fc.reason, fc.status, fc.created_at,
             u.name AS reporter_name,
             CASE
               WHEN fc.content_type = 'quiz' THEN q.title
               WHEN fc.content_type = 'deck' THEN fd.title
               ELSE 'Unknown Content'
             END AS content_title
      FROM flagged_content fc
      JOIN users u ON fc.reporter_id = u.id
      LEFT JOIN quizzes q ON fc.content_type = 'quiz' AND fc.content_id = q.id
      LEFT JOIN flashcard_decks fd ON fc.content_type = 'deck' AND fc.content_id = fd.id
      ORDER BY fc.id DESC
    `);
    
    const reports = rows.map(r => ({
      id: r.id,
      reporterId: r.reporter_id,
      reporterName: r.reporter_name,
      contentType: r.content_type,
      contentId: r.content_id,
      contentTitle: r.content_title || `Deleted Content (ID: ${r.content_id})`,
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at
    }));

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flagged content' });
  }
});

// ── PUT /api/admin/moderation/:id/status ──────────────────────────────
router.put('/moderation/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'reviewed', 'dismissed', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE flagged_content SET status = ? WHERE id = ?', [status, id]);
    res.json({ status: 'success', message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update moderation status' });
  }
});

// ── DELETE /api/admin/moderation/:id/content ──────────────────────────
router.delete('/moderation/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const [[report]] = await pool.query('SELECT content_type, content_id FROM flagged_content WHERE id = ?', [id]);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.content_type === 'quiz') {
      await pool.query('DELETE FROM quizzes WHERE id = ?', [report.content_id]);
    } else if (report.content_type === 'deck') {
      await pool.query('DELETE FROM flashcard_decks WHERE id = ?', [report.content_id]);
    }

    // Mark report as deleted
    await pool.query('UPDATE flagged_content SET status = "deleted" WHERE id = ?', [id]);

    res.json({ status: 'success', message: 'Content deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// ── GET /api/admin/announcements ──────────────────────────────────────
router.get('/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.author_id, a.title, a.message, a.type, a.starts_at, a.expires_at,
             u.name AS author_name
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// ── POST /api/admin/announcements ─────────────────────────────────────
router.post('/announcements', async (req, res) => {
  try {
    const { title, message, type, expires_at } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const expiry = expires_at ? new Date(expires_at) : null;
    
    await pool.query(
      'INSERT INTO announcements (author_id, title, message, type, expires_at) VALUES (?, ?, ?, ?, ?)',
      [req.userId, title, message, type || 'info', expiry]
    );

    res.status(201).json({ status: 'success', message: 'Announcement created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// ── DELETE /api/admin/announcements/:id ───────────────────────────────
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;
