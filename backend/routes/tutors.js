const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to ensure the user is a tutor
router.use((req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  if (req.userRole !== 'tutor') {
    return res.status(403).json({ error: 'Access denied: Requires Tutor role' });
  }
  next();
});

// GET /api/tutors/dashboard - Get tutor dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const tutorId = req.userId;

    // 1. Fetch tutor profile details
    const [[profile]] = await pool.query(
      'SELECT rate, status, rating, reviews_count, availability FROM tutor_profiles WHERE user_id = ?',
      [tutorId]
    );

    let rate = 30.00;
    let status = 'available';
    let rating = 5.00;
    let reviewsCount = 0;
    let availability = null;

    if (profile) {
      rate = Number(profile.rate);
      status = profile.status;
      rating = Number(profile.rating);
      reviewsCount = profile.reviews_count;
      availability = profile.availability ? (typeof profile.availability === 'string' ? JSON.parse(profile.availability) : profile.availability) : null;
    }

    // 2. Fetch stats from bookings (confirmed or completed sessions)
    const [[earningsRow]] = await pool.query(
      'SELECT SUM(total_cost) AS gross FROM bookings WHERE tutor_id = ? AND status != "cancelled"',
      [tutorId]
    );
    const grossEarnings = Number(earningsRow.gross) || 0.00;
    const netEarnings = grossEarnings * 0.90; // 90% payout for tutors

    const [[hoursRow]] = await pool.query(
      'SELECT SUM(duration) AS hours FROM bookings WHERE tutor_id = ? AND status != "cancelled"',
      [tutorId]
    );
    const totalHours = Number(hoursRow.hours) || 0;

    const [[studentsRow]] = await pool.query(
      'SELECT COUNT(DISTINCT student_id) AS studentCount FROM bookings WHERE tutor_id = ? AND status != "cancelled"',
      [tutorId]
    );
    const uniqueStudents = studentsRow.studentCount || 0;

    const [[bookingsRow]] = await pool.query(
      'SELECT COUNT(*) AS totalBookings FROM bookings WHERE tutor_id = ? AND status != "cancelled"',
      [tutorId]
    );
    const totalBookings = bookingsRow.totalBookings || 0;

    res.json({
      rate,
      status,
      rating,
      reviewsCount,
      availability,
      earnings: {
        gross: grossEarnings,
        net: netEarnings
      },
      totalHours,
      uniqueStudents,
      totalBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tutor dashboard statistics' });
  }
});

// GET /api/tutors/bookings - Get tutor specific bookings
router.get('/bookings', async (req, res) => {
  try {
    const tutorId = req.userId;
    const [rows] = await pool.query(`
      SELECT b.id, b.student_id, b.booking_date, b.booking_time, b.duration, b.total_cost, b.status, b.payment_status,
             u.name AS student_name, u.initials AS student_initials, u.email AS student_email
      FROM bookings b
      JOIN users u ON b.student_id = u.id
      WHERE b.tutor_id = ?
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `, [tutorId]);

    const bookings = rows.map(b => ({
      id: b.id,
      studentId: b.student_id,
      studentName: b.student_name,
      studentInitials: b.student_initials,
      studentEmail: b.student_email,
      date: b.booking_date.toISOString().split('T')[0],
      time: b.booking_time.substring(0, 5),
      duration: b.duration,
      totalCost: Number(b.total_cost),
      status: b.status,
      paymentStatus: b.payment_status
    }));

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tutor bookings' });
  }
});

// PUT /api/tutors/status - Toggle tutor availability status
router.put('/status', async (req, res) => {
  try {
    const tutorId = req.userId;
    const { status } = req.body;

    if (!['available', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be available or busy.' });
    }

    const [[exists]] = await pool.query('SELECT user_id FROM tutor_profiles WHERE user_id = ?', [tutorId]);
    if (!exists) {
      await pool.query(
        'INSERT INTO tutor_profiles (user_id, status, subjects) VALUES (?, ?, ?)',
        [tutorId, status, JSON.stringify(['General'])]
      );
    } else {
      await pool.query('UPDATE tutor_profiles SET status = ? WHERE user_id = ?', [status, tutorId]);
    }

    res.json({ status: 'success', newStatus: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tutor status' });
  }
});

// PUT /api/tutors/rate - Update hourly rate
router.put('/rate', async (req, res) => {
  try {
    const tutorId = req.userId;
    const { rate } = req.body;
    const numericRate = Number(rate);
    if (isNaN(numericRate) || numericRate < 10 || numericRate > 200) {
      return res.status(400).json({ error: 'Invalid rate. Must be a number between RM10 and RM200.' });
    }

    const [[exists]] = await pool.query('SELECT user_id FROM tutor_profiles WHERE user_id = ?', [tutorId]);
    if (!exists) {
      await pool.query(
        'INSERT INTO tutor_profiles (user_id, rate, subjects) VALUES (?, ?, ?)',
        [tutorId, numericRate, JSON.stringify(['General'])]
      );
    } else {
      await pool.query('UPDATE tutor_profiles SET rate = ? WHERE user_id = ?', [numericRate, tutorId]);
    }

    res.json({ status: 'success', rate: numericRate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update hourly rate' });
  }
});

// PUT /api/tutors/availability - Update weekly timeslot availability
router.put('/availability', async (req, res) => {
  try {
    const tutorId = req.userId;
    const { availability } = req.body;

    const [[exists]] = await pool.query('SELECT user_id FROM tutor_profiles WHERE user_id = ?', [tutorId]);
    if (!exists) {
      await pool.query(
        'INSERT INTO tutor_profiles (user_id, availability, subjects) VALUES (?, ?, ?)',
        [tutorId, JSON.stringify(availability), JSON.stringify(['General'])]
      );
    } else {
      await pool.query('UPDATE tutor_profiles SET availability = ? WHERE user_id = ?', [JSON.stringify(availability), tutorId]);
    }

    res.json({ status: 'success', availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// GET /api/tutors/students - Get unique students who have booked this tutor
router.get('/students', async (req, res) => {
  try {
    const tutorId = req.userId;
    const [rows] = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.initials
      FROM bookings b
      JOIN users u ON b.student_id = u.id
      WHERE b.tutor_id = ? AND b.status != 'cancelled'
    `, [tutorId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students list' });
  }
});

// PUT /api/tutors/bookings/:id/complete - Complete class booking
router.put('/bookings/:id/complete', async (req, res) => {
  try {
    const tutorId = req.userId;
    const bookingId = req.params.id;

    const [result] = await pool.query(
      'UPDATE bookings SET status = "completed", payment_status = "payout_completed" WHERE id = ? AND tutor_id = ?',
      [bookingId, tutorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found or access denied.' });
    }

    // Set tutor profile status back to available if completing session
    await pool.query('UPDATE tutor_profiles SET status = "available" WHERE user_id = ?', [tutorId]);

    res.json({ status: 'success', message: 'Booking marked as completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete class booking' });
  }
});

module.exports = router;
