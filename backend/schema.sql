-- PrepPal database schema
-- Run with: mysql -u root -p < schema.sql
-- Run with: Get-Content schema.sql | mysql -u root -P 3307

CREATE DATABASE IF NOT EXISTS preppal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE preppal;

-- WIPE OLD TABLES TO PREVENT CACHED SCHEMA ERRORS
DROP TABLE IF EXISTS analytics_records;
DROP TABLE IF EXISTS ai_schedules;
DROP TABLE IF EXISTS study_materials;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS study_plans;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS flagged_content;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tutor_profiles;
DROP TABLE IF EXISTS flashcard_attempts;
DROP TABLE IF EXISTS flashcards;
DROP TABLE IF EXISTS flashcard_decks;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS users;

-- ── USERS ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE,
  initials      VARCHAR(5) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'student', 'tutor') NOT NULL DEFAULT 'student',
  bio           TEXT DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── QUIZZES ───────────────────────────────────────────────────────────
CREATE TABLE quizzes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  subject    VARCHAR(100) NOT NULL,
  topic      VARCHAR(100) NOT NULL,
  difficulty ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  visibility ENUM('public','private') NOT NULL DEFAULT 'public',
  owner_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_quiz_subject (subject),
  INDEX idx_quiz_topic (topic),
  INDEX idx_quiz_visibility (visibility)
);

CREATE TABLE quiz_questions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id       INT NOT NULL,
  question_text TEXT NOT NULL,
  choices       JSON NOT NULL,        -- e.g. ["Choice A","Choice B","Choice C","Choice D"]
  correct_index INT NOT NULL,         -- index into `choices`
  position      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id    INT NOT NULL,
  user_id    INT NOT NULL,
  score      INT NOT NULL,
  total      INT NOT NULL,
  answers    JSON NOT NULL,           -- map of questionIndex -> chosenChoiceIndex
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── FLASHCARD DECKS ───────────────────────────────────────────────────
CREATE TABLE flashcard_decks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  subject    VARCHAR(100) NOT NULL,
  topic      VARCHAR(100) NOT NULL,
  visibility ENUM('public','private') NOT NULL DEFAULT 'public',
  owner_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_deck_subject (subject),
  INDEX idx_deck_topic (topic),
  INDEX idx_deck_visibility (visibility)
);

CREATE TABLE flashcards (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  deck_id  INT NOT NULL,
  question TEXT NOT NULL,
  answer   TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
);

CREATE TABLE flashcard_attempts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  deck_id     INT NOT NULL,
  user_id     INT NOT NULL,
  correct     INT NOT NULL,
  total       INT NOT NULL,
  wrong_cards JSON NOT NULL,          -- array of flashcard ids marked wrong
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── TUTOR PROFILES ────────────────────────────────────────────────────
CREATE TABLE tutor_profiles (
  user_id       INT PRIMARY KEY,
  rate          DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
  subjects      JSON NOT NULL,                 -- e.g. ["Mathematics", "Physics"]
  rating        DECIMAL(3, 2) DEFAULT 5.00,
  reviews_count INT DEFAULT 0,
  status        ENUM('available', 'busy') DEFAULT 'available',
  verified      BOOLEAN DEFAULT FALSE,
  availability  JSON DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── TUTOR BOOKINGS ────────────────────────────────────────────────────
CREATE TABLE bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  tutor_id       INT NOT NULL,
  booking_date   DATE NOT NULL,
  booking_time   TIME NOT NULL,
  duration       INT NOT NULL DEFAULT 1,        -- in hours
  total_cost     DECIMAL(10, 2) NOT NULL,
  status         ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
  payment_status ENUM('unpaid', 'paid', 'refunded', 'payout_completed') DEFAULT 'paid',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── FLAGGED CONTENT ───────────────────────────────────────────────────
CREATE TABLE flagged_content (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id   INT NOT NULL,
  content_type  ENUM('quiz', 'deck', 'material') NOT NULL,
  content_id    INT NOT NULL,                  -- points to quiz_id or deck_id
  reason        VARCHAR(255) NOT NULL,         -- e.g. "Inaccurate answers", "Spam"
  status        ENUM('pending', 'reviewed', 'dismissed', 'deleted') DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── SYSTEM ANNOUNCEMENTS ──────────────────────────────────────────────
CREATE TABLE announcements (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  author_id     INT NOT NULL,
  title         VARCHAR(150) NOT NULL,
  message       TEXT NOT NULL,
  type          ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
  starts_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── STUDY PLANNER & REMINDERS ─────────────────────────────────────────
CREATE TABLE study_plans (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  task       VARCHAR(255) NOT NULL,
  deadline   DATE NOT NULL,
  status     ENUM('Pending', 'In Progress', 'Completed', 'Scheduled') NOT NULL DEFAULT 'Pending',
  exam_type  VARCHAR(50) DEFAULT 'Task',
  priority   VARCHAR(20) DEFAULT 'medium',
  exam_time  TIME DEFAULT NULL,
  subject    VARCHAR(100) DEFAULT NULL,
  completed  TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reminders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(255) NOT NULL,
  time       DATETIME NOT NULL,
  status     ENUM('Active', 'Set', 'Dismissed') NOT NULL DEFAULT 'Set',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE study_materials (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) DEFAULT NULL,
  description   VARCHAR(255) DEFAULT NULL,
  subject       VARCHAR(100) DEFAULT NULL,
  topic         VARCHAR(100) DEFAULT NULL,
  type          VARCHAR(50) DEFAULT 'file',
  file_size     INT DEFAULT NULL,
  mime_type     VARCHAR(100) DEFAULT NULL,
  parent_id     INT DEFAULT NULL,
  student_id    INT DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_study_materials_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_schedules (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  schedule_data JSON NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── PROGRESS TRACKING & ANALYTICS ─────────────────────────────────────
CREATE TABLE analytics_records (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  subject           VARCHAR(100) NOT NULL,
  date              DATE NOT NULL,
  study_minutes     INT NOT NULL DEFAULT 0,
  modules_completed INT NOT NULL DEFAULT 0,
  mastery           INT NOT NULL DEFAULT 0,
  quiz_score        INT DEFAULT NULL,
  skill_gap         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── SEED DATA ─────────────────────────────────────────────────────────

-- Seed users
INSERT INTO users (id, name, email, initials, password_hash, role, bio) VALUES
  (1, 'Alex Chen', 'alex@school.edu', 'AC', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'student', 'A passionate student eager to learn and improve skills.'),
  (2, 'Sam Lee',   'sam@school.edu',  'SL', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'student', 'Expert tutor ready to help.'),
  (3, 'Admin', 'admin@school.edu', 'AD', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'admin', 'Administrator of the PrepPal system.'),
  (4, 'Dr. Sarah Jenkins', 'sarah@school.edu', 'SJ', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Former university professor with 10+ years teaching science courses.'),
  (5, 'Prof. James Miller', 'james@school.edu', 'JM', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Passionate about making calculus and physics intuitive and visual.'),
  (6, 'Mrs. Emily Chen', 'emily@school.edu', 'EC', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Dedicated to improving students essay writing and critical analysis skills.'),
  (7, 'Mr. David Kross', 'david@school.edu', 'DK', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Software engineer teaching algorithms and high school geometry.')
ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), bio=VALUES(bio);

-- Tutor profile seed
INSERT INTO tutor_profiles (user_id, rate, subjects, rating, reviews_count, status, verified) VALUES
  (2, 35.00, '["Biology"]', 4.5, 12, 'available', TRUE),
  (4, 45.00, '["Chemistry", "Biology"]', 4.9, 42, 'available', TRUE),
  (5, 50.00, '["Mathematics", "Physics"]', 4.8, 38, 'available', TRUE),
  (6, 40.00, '["English Literature", "History"]', 4.7, 29, 'busy', TRUE),
  (7, 55.00, '["Computer Science", "Mathematics"]', 5.0, 15, 'available', TRUE)
ON DUPLICATE KEY UPDATE rate=VALUES(rate), subjects=VALUES(subjects), rating=VALUES(rating), reviews_count=VALUES(reviews_count), status=VALUES(status), verified=VALUES(verified);

-- Sample quiz
INSERT INTO quizzes (id, title, subject, topic, difficulty, visibility, owner_id) VALUES
  (1, 'Biology — Cell Structure', 'Biology', 'Cells', 'Medium', 'public', 1),
  (2, 'Algebra Basics', 'Mathematics', 'Algebra', 'Easy', 'public', 2),
  (3, 'My Private History Quiz', 'History', 'WW2', 'Hard', 'private', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO quiz_questions (quiz_id, question_text, choices, correct_index, position) VALUES
  (1, 'What is the powerhouse of the cell?', '["Nucleus","Mitochondria","Ribosome","Golgi body"]', 1, 0),
  (1, 'Which organelle contains DNA?', '["Mitochondria","Lysosome","Nucleus","Vacuole"]', 2, 1),
  (1, 'What surrounds plant cells but not animal cells?', '["Cell membrane","Cell wall","Nucleus","Cytoplasm"]', 1, 2),
  (2, 'Solve: 2x = 10', '["x=2","x=5","x=8","x=20"]', 1, 0),
  (2, 'Slope of y = 3x + 2?', '["2","3","1","0"]', 1, 1),
  (3, 'When did WW2 end?', '["1943","1944","1945","1946"]', 2, 0);

-- Sample flashcard decks
INSERT INTO flashcard_decks (id, title, subject, topic, visibility, owner_id) VALUES
  (1, 'Biology Vocabulary', 'Biology', 'Cells', 'public', 1),
  (2, 'Spanish Vocabulary', 'Languages', 'Spanish', 'public', 2),
  (3, 'My Private Math Cards', 'Mathematics', 'Calculus', 'private', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO flashcards (deck_id, question, answer, position) VALUES
  (1, 'What is mitosis?', 'Cell division producing two identical daughter cells', 0),
  (1, 'Define osmosis', 'Movement of water through a semipermeable membrane', 1),
  (1, 'What is ATP?', 'Adenosine triphosphate — the energy currency of cells', 2),
  (1, 'Define photosynthesis', 'Process converting sunlight to glucose in plants', 3),
  (2, 'Hello', 'Hola', 0),
  (2, 'Goodbye', 'Adiós', 1),
  (2, 'Thank you', 'Gracias', 2),
  (3, 'Derivative of x²?', '2x', 0),
  (3, 'Integral of 2x?', 'x² + C', 1);

-- Seed some bookings
INSERT INTO bookings (id, student_id, tutor_id, booking_date, booking_time, duration, total_cost, status, payment_status) VALUES
  (1, 1, 4, '2026-06-25', '15:00:00', 2, 90.00, 'confirmed', 'paid'),
  (2, 1, 5, '2026-06-26', '10:00:00', 1, 50.00, 'confirmed', 'paid')
ON DUPLICATE KEY UPDATE total_cost=VALUES(total_cost);

-- Seed flagged content
INSERT INTO flagged_content (id, reporter_id, content_type, content_id, reason, status) VALUES
  (1, 1, 'quiz', 1, 'Question 2 has a spelling error', 'pending')
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- Seed announcements
INSERT INTO announcements (id, author_id, title, message, type, expires_at) VALUES
  (1, 3, 'Welcome to PrepPal!', 'We are excited to launch our new dashboard built on express and database-backed services.', 'success', '2026-07-01 00:00:00')
ON DUPLICATE KEY UPDATE message=VALUES(message);

-- Seed study plans
INSERT INTO study_plans (id, user_id, task, deadline, status) VALUES
  (1, 1, 'Complete Mathematics Revision', '2026-06-05', 'Pending'),
  (2, 1, 'Prepare Biology Quiz', '2026-06-07', 'In Progress'),
  (3, 1, 'Review Chemistry Notes', '2026-06-09', 'Completed'),
  (4, 1, 'Book Physics Tutor Session', '2026-06-10', 'Scheduled')
ON DUPLICATE KEY UPDATE task=VALUES(task);

-- Seed reminders
INSERT INTO reminders (id, user_id, title, time, status) VALUES
  (1, 1, 'Biology Review Reminder', '2026-06-23 20:00:00', 'Active'),
  (2, 1, 'Math Practice Reminder', '2026-06-24 10:00:00', 'Set')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed study materials
INSERT INTO study_materials (id, user_id, filename, description) VALUES
  (1, 1, 'Biology_Chapter_5.pdf', 'Used for quiz preparation and flashcard review'),
  (2, 1, 'Math_Formula_Notes.docx', 'Attached to the mathematics revision goal')
ON DUPLICATE KEY UPDATE filename=VALUES(filename);

-- Seed analytics records
INSERT INTO analytics_records (id, user_id, subject, date, study_minutes, modules_completed, mastery, quiz_score, skill_gap) VALUES
  (1, 1, 'Biology', '2026-05-01', 420, 6, 88, 91, false),
  (2, 1, 'Chemistry', '2026-05-02', 390, 5, 92, 94, false),
  (3, 1, 'Physics', '2026-05-03', 240, 3, 63, 68, true),
  (4, 1, 'History', '2026-05-04', 180, 2, 57, 61, true)
ON DUPLICATE KEY UPDATE subject=VALUES(subject);