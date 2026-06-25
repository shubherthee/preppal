const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  console.log('Connected to MySQL server.');

  try {
    // 1. Ensure database exists
    await connection.query('CREATE DATABASE IF NOT EXISTS `preppal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE `preppal`');
    console.log('Using database preppal.');

    // 2. Ensure users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log("Table 'users' does not exist yet. Running table creation...");
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id            INT AUTO_INCREMENT PRIMARY KEY,
          name          VARCHAR(100) NOT NULL,
          email         VARCHAR(150) UNIQUE,
          initials      VARCHAR(5) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role          ENUM('admin', 'student', 'tutor') NOT NULL DEFAULT 'student',
          bio           TEXT DEFAULT NULL,
          created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Table 'users' created.");
    } else {
      // 3. Check if password_hash column exists
      const [columns] = await connection.query('SHOW COLUMNS FROM users LIKE "password_hash"');
      if (columns.length === 0) {
        console.log("Adding column 'password_hash' to 'users' table...");
        await connection.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL');
        console.log("Column 'password_hash' added successfully.");
      } else {
        console.log("Column 'password_hash' already exists.");
      }

      // Check if role column exists
      const [roleColumns] = await connection.query('SHOW COLUMNS FROM users LIKE "role"');
      if (roleColumns.length === 0) {
        console.log("Adding column 'role' to 'users' table...");
        await connection.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'student', 'tutor') NOT NULL DEFAULT 'student'");
        console.log("Column 'role' added successfully.");
      } else {
        console.log("Column 'role' already exists.");
      }

      // Check if bio column exists
      const [bioColumns] = await connection.query('SHOW COLUMNS FROM users LIKE "bio"');
      if (bioColumns.length === 0) {
        console.log("Adding column 'bio' to 'users' table...");
        await connection.query('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL');
        console.log("Column 'bio' added successfully.");
      } else {
        console.log("Column 'bio' already exists.");
      }
    }

    // 4. Update existing users with a hashed password 'password123'
    const passwordHash = await bcrypt.hash('password123', 10);
    const [result] = await connection.query('UPDATE users SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ""', [passwordHash]);
    console.log(`Updated ${result.affectedRows} users with default password hash.`);

    // 5. Alter column to be NOT NULL to maintain integrity
    await connection.query('ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NOT NULL');
    console.log("Ensured users.password_hash is NOT NULL.");

    // 6. Update existing users to have default bios based on role if null or empty
    const [bioResult] = await connection.query(`
      UPDATE users 
      SET bio = CASE 
        WHEN role = 'admin' THEN 'Administrator of the PrepPal system.'
        WHEN role = 'tutor' THEN 'Expert tutor ready to help.'
        ELSE 'A passionate student eager to learn and improve skills.'
      END
      WHERE bio IS NULL OR bio = ''
    `);
    console.log(`Updated default bios for ${bioResult.affectedRows} users.`);

    // 7. Ensure new admin and tutor tables exist
    console.log("Creating tutor_profiles, bookings, flagged_content, and announcements tables if they do not exist...");
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tutor_profiles (
        user_id       INT PRIMARY KEY,
        rate          DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
        subjects      JSON NOT NULL,
        rating        DECIMAL(3, 2) DEFAULT 5.00,
        reviews_count INT DEFAULT 0,
        status        ENUM('available', 'busy') DEFAULT 'available',
        verified      BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        student_id    INT NOT NULL,
        tutor_id      INT NOT NULL,
        booking_date  DATE NOT NULL,
        booking_time  TIME NOT NULL,
        duration      INT NOT NULL DEFAULT 1,
        total_cost    DECIMAL(10, 2) NOT NULL,
        status        ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        payment_status ENUM('unpaid', 'paid', 'refunded', 'payout_completed') DEFAULT 'paid',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS flagged_content (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        reporter_id   INT NOT NULL,
        content_type  ENUM('quiz', 'deck', 'material') NOT NULL,
        content_id    INT NOT NULL,
        reason        VARCHAR(255) NOT NULL,
        status        ENUM('pending', 'reviewed', 'dismissed', 'deleted') DEFAULT 'pending',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        author_id     INT NOT NULL,
        title         VARCHAR(150) NOT NULL,
        message       TEXT NOT NULL,
        type          ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
        starts_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at    TIMESTAMP NULL,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Admin and tutor tables checked/created.");

    // 8. Auto-create tutor profiles for existing tutors who don't have one
    const [tutors] = await connection.query("SELECT id FROM users WHERE role = 'tutor'");
    let createdProfilesCount = 0;
    for (const tutor of tutors) {
      const [existing] = await connection.query("SELECT user_id FROM tutor_profiles WHERE user_id = ?", [tutor.id]);
      if (existing.length === 0) {
        await connection.query(`
          INSERT INTO tutor_profiles (user_id, rate, subjects, rating, reviews_count, status, verified)
          VALUES (?, 35.00, '["General"]', 5.00, 0, 'available', TRUE)
        `, [tutor.id]);
        createdProfilesCount++;
      }
    }
    if (createdProfilesCount > 0) {
      console.log(`Created ${createdProfilesCount} missing tutor profiles.`);
    }

    // Tracker columns 
    console.log('Adding tracker columns to study_plans if missing...');
    const trackerCols = [
      ["exam_type", "ALTER TABLE study_plans ADD COLUMN exam_type VARCHAR(50) DEFAULT 'Task'"],
      ["priority",  "ALTER TABLE study_plans ADD COLUMN priority  VARCHAR(20) DEFAULT 'medium'"],
      ["exam_time", "ALTER TABLE study_plans ADD COLUMN exam_time TIME DEFAULT NULL"],
      ["subject",   "ALTER TABLE study_plans ADD COLUMN subject   VARCHAR(100) DEFAULT NULL"],
      ["completed", "ALTER TABLE study_plans ADD COLUMN completed TINYINT(1) DEFAULT 0"],
    ];
    for (const [colName, sql] of trackerCols) {
      const [cols] = await connection.query(`SHOW COLUMNS FROM study_plans LIKE '${colName}'`);
      if (cols.length === 0) {
        await connection.query(sql);
        console.log(`  Added: ${colName}`);
      } else {
        console.log(`  Already exists: ${colName}`);
      }
    }
    
    // ── Content Hub extra columns ─────────────────────────────────────
    console.log('Adding content hub columns to study_materials if missing...');
    const contentCols = [
      ["original_name", "ALTER TABLE study_materials ADD COLUMN original_name VARCHAR(255) DEFAULT NULL"],
      ["subject",       "ALTER TABLE study_materials ADD COLUMN subject       VARCHAR(100) DEFAULT NULL"],
      ["topic",         "ALTER TABLE study_materials ADD COLUMN topic         VARCHAR(100) DEFAULT NULL"],
      ["type",          "ALTER TABLE study_materials ADD COLUMN type          VARCHAR(50)  DEFAULT 'file'"],
      ["file_size",     "ALTER TABLE study_materials ADD COLUMN file_size     INT          DEFAULT NULL"],
      ["mime_type",     "ALTER TABLE study_materials ADD COLUMN mime_type     VARCHAR(100) DEFAULT NULL"],
      ["parent_id",     "ALTER TABLE study_materials ADD COLUMN parent_id     INT          DEFAULT NULL"],
    ];
    for (const [colName, sql] of contentCols) {
      const [cols] = await connection.query(`SHOW COLUMNS FROM study_materials LIKE '${colName}'`);
      if (cols.length === 0) {
        await connection.query(sql);
        console.log(`  ✓ Added: ${colName}`);
      } else {
        console.log(`  – Already exists: ${colName}`);
      }
    }
    console.log('Content hub columns done.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

run();
