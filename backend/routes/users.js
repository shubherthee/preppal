const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'preppal_secret_key_change_this_12345';

// ── POST /api/users/login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [[user]] = await pool.query(
      'SELECT id, name, email, initials, password_hash, role, bio FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        role: user.role,
        bio: user.bio || '',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /api/users/register ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    // Check if email already exists
    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Generate initials (e.g. "Alex Chen" -> "AC")
    const parts = name.trim().split(/\s+/);
    let initials = '??';
    if (parts.length > 0) {
      if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const defaultBio = 'A passionate student eager to learn and improve skills.';

    // Insert user (default role is 'student')
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, initials, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, initials, 'student', defaultBio]
    );

    const userId = result.insertId;

    // Sign JWT token for automatic login
    const token = jwt.sign(
      { id: userId, email: email.trim().toLowerCase(), name: name.trim(), role: 'student' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        initials,
        role: 'student',
        bio: defaultBio,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── GET /api/users/me ─────────────────────────────────────────────────
// Returns the "logged in" user based on JWT
router.get('/me', async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id, name, email, initials, role, bio FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── GET /api/users ────────────────────────────────────────────────────
// List all users — only accessible to admin
router.get('/', async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    const [rows] = await pool.query('SELECT id, name, email, initials, role, bio FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── POST /api/users ───────────────────────────────────────────────────
// Create user — only accessible to admin
router.post('/', async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { name, email, password, role, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }

    if (!['admin', 'student', 'tutor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email already exists
    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const defaultBio = role === 'admin'
      ? 'Administrator of the PrepPal system.'
      : role === 'tutor'
        ? 'Expert tutor ready to help.'
        : 'A passionate student eager to learn and improve skills.';
    const finalBio = bio !== undefined ? bio : defaultBio;

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, initials, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, initials, role, finalBio]
    );

    res.status(201).json({
      status: 'success',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        initials,
        role,
        bio: finalBio,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ── PUT /api/users/profile ─────────────────────────────────────────────
// Update own profile (name, email, password, bio)
router.put('/profile', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, password, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check if email is already taken by another user
    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use by another account' });
    }

    // Generate initials (e.g. "Alex Chen" -> "AC")
    const parts = name.trim().split(/\s+/);
    let initials = '??';
    if (parts.length > 0) {
      if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
    }

    let query = 'UPDATE users SET name = ?, email = ?, initials = ?, bio = ?';
    let params = [name.trim(), email.trim().toLowerCase(), initials, bio || ''];

    if (password) {
      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      params.push(passwordHash);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    await pool.query(query, params);

    // Fetch the updated user details to return
    const [[user]] = await pool.query('SELECT id, name, email, initials, role, bio FROM users WHERE id = ?', [userId]);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        role: user.role,
        bio: user.bio || '',
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────
// Update user — only accessible to admin
router.put('/:id', async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { id } = req.params;
    const { name, email, role, bio } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email and role are required' });
    }

    if (!['admin', 'student', 'tutor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Generate initials (e.g. "Alex Chen" -> "AC")
    const parts = name.trim().split(/\s+/);
    let initials = '??';
    if (parts.length > 0) {
      if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
    }

    const finalBio = bio !== undefined ? bio : '';

    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, initials = ?, bio = ? WHERE id = ?',
      [name.trim(), email.trim().toLowerCase(), role, initials, finalBio, id]
    );

    res.json({
      status: 'success',
      user: { id: Number(id), name: name.trim(), email: email.trim().toLowerCase(), role, initials, bio: finalBio }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────
// Delete user — only accessible to admin
router.delete('/:id', async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (Number(id) === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── STUDENT TUTORS & BOOKINGS ─────────────────────────────────────────

// GET /api/users/tutors - Get all verified tutors
router.get('/tutors', async (req, res) => {
  try {
    const [tutorRows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.initials, u.bio, 
             tp.rate, tp.subjects, tp.rating, tp.reviews_count, tp.status, tp.verified
      FROM users u
      JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor' AND tp.verified = TRUE
      ORDER BY tp.rating DESC, u.id
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

    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tutors list' });
  }
});

// POST /api/users/bookings - Book a session
router.post('/bookings', async (req, res) => {
  try {
    const studentId = req.userId;
    const { tutorId, date, time, duration, totalCost } = req.body;
    if (!tutorId || !date || !time) {
      return res.status(400).json({ error: 'Tutor ID, date, and time are required' });
    }

    let cost = totalCost;
    if (!cost) {
      const [[tutor]] = await pool.query('SELECT rate FROM tutor_profiles WHERE user_id = ?', [tutorId]);
      if (!tutor) {
        return res.status(404).json({ error: 'Tutor profile not found' });
      }
      cost = tutor.rate * (duration || 1);
    }

    const [result] = await pool.query(
      'INSERT INTO bookings (student_id, tutor_id, booking_date, booking_time, duration, total_cost, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, "confirmed", "paid")',
      [studentId, tutorId, date, time, duration || 1, cost]
    );

    // Set status to busy
    await pool.query('UPDATE tutor_profiles SET status = "busy" WHERE user_id = ?', [tutorId]);

    // Fetch the created booking with tutor details
    const [[bookingRow]] = await pool.query(`
      SELECT b.id, b.student_id, b.tutor_id, b.booking_date, b.booking_time, b.duration, b.total_cost, b.status, b.payment_status,
             u_tutor.name AS tutor_name, tp.rate AS tutor_rate, tp.subjects AS tutor_subjects, tp.status AS tutor_status, u_tutor.bio AS tutor_bio, tp.rating AS tutor_rating
      FROM bookings b
      JOIN users u_tutor ON b.tutor_id = u_tutor.id
      LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.user_id
      WHERE b.id = ?
    `, [result.insertId]);

    const avatars = [
      'assets/tutor-sarah.png',
      'assets/tutor-james.png',
      'assets/tutor-emily.png',
      'assets/tutor-david.png'
    ];

    const newBooking = {
      id: bookingRow.id,
      studentId: bookingRow.student_id,
      date: bookingRow.booking_date.toISOString().split('T')[0],
      time: bookingRow.booking_time.substring(0, 5),
      duration: bookingRow.duration,
      totalCost: Number(bookingRow.total_cost),
      status: bookingRow.status,
      paymentStatus: bookingRow.payment_status,
      tutor: {
        id: bookingRow.tutor_id,
        name: bookingRow.tutor_name,
        rate: Number(bookingRow.tutor_rate) || 30,
        subjects: typeof bookingRow.tutor_subjects === 'string' ? JSON.parse(bookingRow.tutor_subjects) : (bookingRow.tutor_subjects || ['General']),
        status: bookingRow.tutor_status || 'available',
        bio: bookingRow.tutor_bio || 'Experienced academic tutor.',
        rating: Number(bookingRow.tutor_rating) || 5.0,
        avatar: avatars[(bookingRow.tutor_id - 1) % avatars.length]
      }
    };

    res.status(201).json({ status: 'success', booking: newBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/users/bookings/mine - Get current user bookings
router.get('/bookings/mine', async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole; // from JWT token ('student', 'tutor', 'admin')

    if (userRole === 'tutor') {
      const [rows] = await pool.query(`
        SELECT b.id, b.student_id, b.tutor_id, b.booking_date, b.booking_time, b.duration, b.total_cost, b.status, b.payment_status, b.meeting_link,
               u_student.name AS student_name, u_student.email AS student_email, u_student.initials AS student_initials
        FROM bookings b
        JOIN users u_student ON b.student_id = u_student.id
        WHERE b.tutor_id = ?
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `, [userId]);

      const bookings = rows.map(b => ({
        id: b.id,
        tutorId: b.tutor_id,
        date: b.booking_date.toISOString().split('T')[0],
        time: b.booking_time.substring(0, 5),
        duration: b.duration,
        totalCost: Number(b.total_cost),
        status: b.status,
        paymentStatus: b.payment_status,
        meetingLink: b.meeting_link,
        student: {
          id: b.student_id,
          name: b.student_name,
          email: b.student_email,
          initials: b.student_initials
        }
      }));
      return res.json(bookings);
    } else {
      // Default to student
      const [rows] = await pool.query(`
        SELECT b.id, b.student_id, b.tutor_id, b.booking_date, b.booking_time, b.duration, b.total_cost, b.status, b.payment_status, b.meeting_link,
               u_tutor.name AS tutor_name, tp.rate AS tutor_rate, tp.subjects AS tutor_subjects, tp.status AS tutor_status, u_tutor.bio AS tutor_bio, tp.rating AS tutor_rating
        FROM bookings b
        JOIN users u_tutor ON b.tutor_id = u_tutor.id
        LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.user_id
        WHERE b.student_id = ?
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `, [userId]);

      const avatars = [
        'assets/tutor-sarah.png',
        'assets/tutor-james.png',
        'assets/tutor-emily.png',
        'assets/tutor-david.png'
      ];

      const bookings = rows.map(b => ({
        id: b.id,
        studentId: b.student_id,
        date: b.booking_date.toISOString().split('T')[0],
        time: b.booking_time.substring(0, 5),
        duration: b.duration,
        totalCost: Number(b.total_cost),
        status: b.status,
        paymentStatus: b.payment_status,
        meetingLink: b.meeting_link,
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
      return res.json(bookings);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings list' });
  }
});

// GET /api/users/bookings/:id - Get specific booking details
router.get('/bookings/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const bookingId = req.params.id;

    // Fetch booking
    const [[booking]] = await pool.query(
      'SELECT b.id, b.student_id, b.tutor_id, b.booking_date, b.booking_time, b.duration, b.total_cost, b.status, b.payment_status, b.meeting_link FROM bookings b WHERE b.id = ?',
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization: must be either the student or the tutor for this booking
    if (booking.student_id !== userId && booking.tutor_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch student details
    const [[student]] = await pool.query(
      'SELECT name, email, initials FROM users WHERE id = ?',
      [booking.student_id]
    );

    // Fetch tutor details
    const [[tutor]] = await pool.query(
      'SELECT name, email, initials FROM users WHERE id = ?',
      [booking.tutor_id]
    );

    res.json({
      id: booking.id,
      studentId: booking.student_id,
      tutorId: booking.tutor_id,
      date: booking.booking_date.toISOString().split('T')[0],
      time: booking.booking_time.substring(0, 5),
      duration: booking.duration,
      totalCost: Number(booking.total_cost),
      status: booking.status,
      paymentStatus: booking.payment_status,
      meetingLink: booking.meeting_link,
      studentName: student ? student.name : 'Unknown',
      studentEmail: student ? student.email : '',
      tutorName: tutor ? tutor.name : 'Unknown',
      tutorEmail: tutor ? tutor.email : ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

module.exports = router;
