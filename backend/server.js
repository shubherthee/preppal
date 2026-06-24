const express = require('express');
const cors = require('cors');
require('dotenv').config();

const attachUser = require('./middleware/auth');
const quizzesRouter = require('./routes/quizzes');
const decksRouter = require('./routes/flashcards');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const plannerRouter = require('./routes/planner');
const analyticsRouter = require('./routes/analytics');
const contentRouter = require('./routes/content');
const trackerRouter = require('./routes/tracker');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(attachUser);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/quizzes', quizzesRouter);
app.use('/api/decks', decksRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/content', contentRouter);
app.use('/api/tracker', trackerRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PrepPal API running on http://localhost:${PORT}`);
});
