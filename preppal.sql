-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 28, 2026 at 07:59 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `preppal`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_schedules`
--

CREATE TABLE `ai_schedules` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `schedule_data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `analytics_records`
--

CREATE TABLE `analytics_records` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `study_minutes` int NOT NULL DEFAULT '0',
  `modules_completed` int NOT NULL DEFAULT '0',
  `mastery` int NOT NULL DEFAULT '0',
  `quiz_score` int DEFAULT NULL,
  `skill_gap` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `analytics_records`
--

INSERT INTO `analytics_records` (`id`, `user_id`, `subject`, `date`, `study_minutes`, `modules_completed`, `mastery`, `quiz_score`, `skill_gap`, `created_at`) VALUES
(1, 1, 'Biology', '2026-05-01', 420, 6, 88, 91, 0, '2026-06-25 02:29:44'),
(2, 1, 'Chemistry', '2026-05-02', 390, 5, 92, 94, 0, '2026-06-25 02:29:44'),
(3, 1, 'Physics', '2026-05-03', 240, 3, 63, 68, 1, '2026-06-25 02:29:44'),
(4, 1, 'History', '2026-05-04', 180, 2, 57, 61, 1, '2026-06-25 02:29:44');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int NOT NULL,
  `author_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('info','success','warning','danger') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `starts_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `author_id`, `title`, `message`, `type`, `starts_at`, `expires_at`) VALUES
(1, 3, 'Welcome to PrepPal!', 'We are excited to launch our new dashboard built on express and database-backed services.', 'success', '2026-06-25 02:29:43', '2026-06-30 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `tutor_id` int NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `duration` int NOT NULL DEFAULT '1',
  `total_cost` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'confirmed',
  `payment_status` enum('unpaid','paid','refunded','payout_completed') COLLATE utf8mb4_unicode_ci DEFAULT 'paid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `student_id`, `tutor_id`, `booking_date`, `booking_time`, `duration`, `total_cost`, `status`, `payment_status`, `created_at`) VALUES
(1, 1, 4, '2026-06-25', '15:00:00', 2, 90.00, 'confirmed', 'paid', '2026-06-25 02:29:43'),
(2, 1, 5, '2026-06-26', '10:00:00', 1, 50.00, 'confirmed', 'paid', '2026-06-25 02:29:43');

-- --------------------------------------------------------

--
-- Table structure for table `flagged_content`
--

CREATE TABLE `flagged_content` (
  `id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `content_type` enum('quiz','deck','material') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_id` int NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','reviewed','dismissed','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flagged_content`
--

INSERT INTO `flagged_content` (`id`, `reporter_id`, `content_type`, `content_id`, `reason`, `status`, `created_at`) VALUES
(1, 1, 'quiz', 1, 'Question 2 has a spelling error', 'pending', '2026-06-25 02:29:43');

-- --------------------------------------------------------

--
-- Table structure for table `flashcards`
--

CREATE TABLE `flashcards` (
  `id` int NOT NULL,
  `deck_id` int NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flashcards`
--

INSERT INTO `flashcards` (`id`, `deck_id`, `question`, `answer`, `position`) VALUES
(5, 2, 'Hello', 'Hola', 0),
(6, 2, 'Goodbye', 'Adi├│s', 1),
(7, 2, 'Thank you', 'Gracias', 2),
(14, 1, 'What is mitosis?', 'Cell division producing two identical daughter cells', 0),
(15, 1, 'Define osmosis', 'Movement of water through a semipermeable membrane', 1),
(16, 1, 'What is ATP?', 'Adenosine triphosphate ÔÇö the energy currency of cells', 2),
(17, 1, 'Define photosynthesis', 'Process converting sunlight to glucose in plants', 3),
(18, 4, 'What is Fuzzy Logic?', 'Fuzzy Logic is a reasoning method that allows values to be partially true instead of only true (1) or false (0).', 0),
(19, 4, 'What is the main difference between Boolean Logic and Fuzzy Logic?', 'Boolean Logic: Only True (1) or False (0)\nFuzzy Logic: Truth can be any value between 0 and 1.', 1);

-- --------------------------------------------------------

--
-- Table structure for table `flashcard_attempts`
--

CREATE TABLE `flashcard_attempts` (
  `id` int NOT NULL,
  `deck_id` int NOT NULL,
  `user_id` int NOT NULL,
  `correct` int NOT NULL,
  `total` int NOT NULL,
  `wrong_cards` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flashcard_attempts`
--

INSERT INTO `flashcard_attempts` (`id`, `deck_id`, `user_id`, `correct`, `total`, `wrong_cards`, `created_at`) VALUES
(1, 1, 1, 3, 4, '[12]', '2026-06-25 02:34:50'),
(2, 1, 1, 4, 4, '[]', '2026-06-25 02:35:07');

-- --------------------------------------------------------

--
-- Table structure for table `flashcard_decks`
--

CREATE TABLE `flashcard_decks` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visibility` enum('public','private') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `owner_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flashcard_decks`
--

INSERT INTO `flashcard_decks` (`id`, `title`, `subject`, `topic`, `visibility`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Biology Vocabulary', 'Biology', 'Cells', 'public', 1, '2026-06-25 02:29:43', '2026-06-26 03:42:59'),
(2, 'Spanish Vocabulary', 'Languages', 'Spanish', 'public', 2, '2026-06-25 02:29:43', '2026-06-25 02:29:43'),
(4, 'Fuzzy Logic', 'Conputational Intelligence', 'Introduction', 'private', 1, '2026-06-26 03:44:44', '2026-06-26 03:44:44');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` enum('Easy','Medium','Hard') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Medium',
  `visibility` enum('public','private') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `owner_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `subject`, `topic`, `difficulty`, `visibility`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Biology Cell Structure', 'Biology', 'Cells', 'Medium', 'public', 1, '2026-06-25 02:29:43', '2026-06-25 02:33:27'),
(2, 'Algebra Basics', 'Mathematics', 'Algebra', 'Easy', 'public', 2, '2026-06-25 02:29:43', '2026-06-25 02:29:43'),
(3, 'My Private History Quiz', 'History', 'WW2', 'Hard', 'private', 1, '2026-06-25 02:29:43', '2026-06-25 02:29:43'),
(4, 'Fuzzy Logic', 'Computational Intelligence', 'Introduction', 'Easy', 'private', 1, '2026-06-26 03:46:31', '2026-06-26 03:46:31');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `user_id` int NOT NULL,
  `score` int NOT NULL,
  `total` int NOT NULL,
  `answers` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `user_id`, `score`, `total`, `answers`, `created_at`) VALUES
(1, 2, 1, 1, 2, '{\"0\": 1, \"1\": 0}', '2026-06-25 02:33:41'),
(2, 2, 1, 2, 2, '{\"0\": 1, \"1\": 1}', '2026-06-25 02:34:05');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `choices` json NOT NULL,
  `correct_index` int NOT NULL,
  `position` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `choices`, `correct_index`, `position`) VALUES
(4, 2, 'Solve: 2x = 10', '[\"x=2\", \"x=5\", \"x=8\", \"x=20\"]', 1, 0),
(5, 2, 'Slope of y = 3x + 2?', '[\"2\", \"3\", \"1\", \"0\"]', 1, 1),
(6, 3, 'When did WW2 end?', '[\"1943\", \"1944\", \"1945\", \"1946\"]', 2, 0),
(7, 1, 'What is the powerhouse of the cell?', '[\"Nucleus\", \"Mitochondria\", \"Ribosome\", \"Golgi body\"]', 1, 0),
(8, 1, 'Which organelle contains DNA?', '[\"Mitochondria\", \"Lysosome\", \"Nucleus\", \"Vacuole\"]', 2, 1),
(9, 1, 'What surrounds plant cells but not animal cells?', '[\"Cell membrane\", \"Cell wall\", \"Nucleus\", \"Cytoplasm\"]', 1, 2),
(10, 4, 'Which statement best describes fuzzy logic?', '[\"Only true\", \"Only false\", \"Values between 0 and 1\", \"Random values\"]', 2, 0),
(11, 4, 'Which is NOT a membership function?', '[\"Triangular\", \"Gaussian\", \"Circular\", \"Trapezoidal\"]', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` datetime NOT NULL,
  `status` enum('Active','Set','Dismissed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Set',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reminders`
--

INSERT INTO `reminders` (`id`, `user_id`, `title`, `time`, `status`, `created_at`) VALUES
(1, 1, 'Biology Review Reminder', '2026-06-23 20:00:00', 'Active', '2026-06-25 02:29:44'),
(2, 1, 'Math Practice Reminder', '2026-06-24 10:00:00', 'Set', '2026-06-25 02:29:44');

-- --------------------------------------------------------

--
-- Table structure for table `study_materials`
--

CREATE TABLE `study_materials` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `study_materials`
--

INSERT INTO `study_materials` (`id`, `user_id`, `filename`, `description`, `created_at`) VALUES
(1, 1, 'Biology_Chapter_5.pdf', 'Used for quiz preparation and flashcard review', '2026-06-25 02:29:44'),
(2, 1, 'Math_Formula_Notes.docx', 'Attached to the mathematics revision goal', '2026-06-25 02:29:44');

-- --------------------------------------------------------

--
-- Table structure for table `study_plans`
--

CREATE TABLE `study_plans` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `task` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deadline` date NOT NULL,
  `status` enum('Pending','In Progress','Completed','Scheduled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `study_plans`
--

INSERT INTO `study_plans` (`id`, `user_id`, `task`, `deadline`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Complete Mathematics Revision', '2026-06-05', 'Pending', '2026-06-25 02:29:44', '2026-06-25 02:29:44'),
(2, 1, 'Prepare Biology Quiz', '2026-06-07', 'In Progress', '2026-06-25 02:29:44', '2026-06-25 02:29:44'),
(3, 1, 'Review Chemistry Notes', '2026-06-09', 'Completed', '2026-06-25 02:29:44', '2026-06-25 02:29:44'),
(4, 1, 'Book Physics Tutor Session', '2026-06-10', 'Scheduled', '2026-06-25 02:29:44', '2026-06-25 02:29:44');

-- --------------------------------------------------------

--
-- Table structure for table `tutor_profiles`
--

CREATE TABLE `tutor_profiles` (
  `user_id` int NOT NULL,
  `rate` decimal(10,2) NOT NULL DEFAULT '30.00',
  `subjects` json NOT NULL,
  `rating` decimal(3,2) DEFAULT '5.00',
  `reviews_count` int DEFAULT '0',
  `status` enum('available','busy') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `verified` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tutor_profiles`
--

INSERT INTO `tutor_profiles` (`user_id`, `rate`, `subjects`, `rating`, `reviews_count`, `status`, `verified`) VALUES
(2, 35.00, '[\"Biology\"]', 4.50, 12, 'available', 1),
(4, 45.00, '[\"Chemistry\", \"Biology\"]', 4.90, 42, 'available', 1),
(5, 50.00, '[\"Mathematics\", \"Physics\"]', 4.80, 38, 'available', 1),
(6, 40.00, '[\"English Literature\", \"History\"]', 4.70, 29, 'busy', 1),
(7, 55.00, '[\"Computer Science\", \"Mathematics\"]', 5.00, 15, 'available', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `initials` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','student','tutor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `initials`, `password_hash`, `role`, `bio`, `created_at`) VALUES
(1, 'Alex Chen', 'alex@school.edu', 'AC', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'student', 'A passionate student eager to learn and improve skills.', '2026-06-25 02:29:43'),
(2, 'Sam Lee', 'sam@school.edu', 'SL', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'student', 'Expert tutor ready to help.', '2026-06-25 02:29:43'),
(3, 'Admin', 'admin@school.edu', 'AD', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'admin', 'Administrator of the PrepPal system.', '2026-06-25 02:29:43'),
(4, 'Dr. Sarah Jenkins', 'sarah@school.edu', 'SJ', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Former university professor with 10+ years teaching science courses.', '2026-06-25 02:29:43'),
(5, 'Prof. James Miller', 'james@school.edu', 'JM', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Passionate about making calculus and physics intuitive and visual.', '2026-06-25 02:29:43'),
(6, 'Mrs. Emily Chen', 'emily@school.edu', 'EC', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Dedicated to improving students essay writing and critical analysis skills.', '2026-06-25 02:29:43'),
(7, 'Mr. David Kross', 'david@school.edu', 'DK', '$2b$10$pfYsyYzTRUdB0TjPad6Ah.wpOuqACjlyikCQZaKsmMPXTh01BlqRu', 'tutor', 'Software engineer teaching algorithms and high school geometry.', '2026-06-25 02:29:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_schedules`
--
ALTER TABLE `ai_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `analytics_records`
--
ALTER TABLE `analytics_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `tutor_id` (`tutor_id`);

--
-- Indexes for table `flagged_content`
--
ALTER TABLE `flagged_content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`);

--
-- Indexes for table `flashcards`
--
ALTER TABLE `flashcards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deck_id` (`deck_id`);

--
-- Indexes for table `flashcard_attempts`
--
ALTER TABLE `flashcard_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deck_id` (`deck_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `flashcard_decks`
--
ALTER TABLE `flashcard_decks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `idx_deck_subject` (`subject`),
  ADD KEY `idx_deck_topic` (`topic`),
  ADD KEY `idx_deck_visibility` (`visibility`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `idx_quiz_subject` (`subject`),
  ADD KEY `idx_quiz_topic` (`topic`),
  ADD KEY `idx_quiz_visibility` (`visibility`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `study_plans`
--
ALTER TABLE `study_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tutor_profiles`
--
ALTER TABLE `tutor_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_schedules`
--
ALTER TABLE `ai_schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `analytics_records`
--
ALTER TABLE `analytics_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `flagged_content`
--
ALTER TABLE `flagged_content`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `flashcards`
--
ALTER TABLE `flashcards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `flashcard_attempts`
--
ALTER TABLE `flashcard_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `flashcard_decks`
--
ALTER TABLE `flashcard_decks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `study_materials`
--
ALTER TABLE `study_materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `study_plans`
--
ALTER TABLE `study_plans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_schedules`
--
ALTER TABLE `ai_schedules`
  ADD CONSTRAINT `ai_schedules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `analytics_records`
--
ALTER TABLE `analytics_records`
  ADD CONSTRAINT `analytics_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `flagged_content`
--
ALTER TABLE `flagged_content`
  ADD CONSTRAINT `flagged_content_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `flashcards`
--
ALTER TABLE `flashcards`
  ADD CONSTRAINT `flashcards_ibfk_1` FOREIGN KEY (`deck_id`) REFERENCES `flashcard_decks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `flashcard_attempts`
--
ALTER TABLE `flashcard_attempts`
  ADD CONSTRAINT `flashcard_attempts_ibfk_1` FOREIGN KEY (`deck_id`) REFERENCES `flashcard_decks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `flashcard_attempts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `flashcard_decks`
--
ALTER TABLE `flashcard_decks`
  ADD CONSTRAINT `flashcard_decks_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reminders`
--
ALTER TABLE `reminders`
  ADD CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD CONSTRAINT `study_materials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_plans`
--
ALTER TABLE `study_plans`
  ADD CONSTRAINT `study_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tutor_profiles`
--
ALTER TABLE `tutor_profiles`
  ADD CONSTRAINT `tutor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
