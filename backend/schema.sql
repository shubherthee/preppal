-- PrepPal database schema
-- Run with: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS preppal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE preppal;

-- ── USERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE,
  initials   VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── QUIZZES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
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

CREATE TABLE IF NOT EXISTS quiz_questions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id       INT NOT NULL,
  question_text TEXT NOT NULL,
  choices       JSON NOT NULL,        -- e.g. ["Choice A","Choice B","Choice C","Choice D"]
  correct_index INT NOT NULL,         -- index into `choices`
  position      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
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
CREATE TABLE IF NOT EXISTS flashcard_decks (
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

CREATE TABLE IF NOT EXISTS flashcards (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  deck_id  INT NOT NULL,
  question TEXT NOT NULL,
  answer   TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flashcard_attempts (
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

-- ── SEED DATA ─────────────────────────────────────────────────────────
INSERT INTO users (id, name, email, initials) VALUES
  (1, 'Alex Chen', 'alex@school.edu', 'AC'),
  (2, 'Sam Lee',   'sam@school.edu',  'SL')
ON DUPLICATE KEY UPDATE name=VALUES(name);

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
