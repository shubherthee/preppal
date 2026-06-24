const express  = require('express');
const router   = express.Router();
const pool     = require('../db');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

// ── Multer storage config ─────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Prefix with timestamp to avoid collisions
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
  fileFilter: (req, file, cb) => {
    // Allow common study file types
    const allowed = [
      '.pdf', '.doc', '.docx', '.ppt', '.pptx',
      '.xls', '.xlsx', '.txt', '.md', '.csv',
      '.png', '.jpg', '.jpeg', '.gif', '.webp',
      '.mp4', '.mov', '.avi', '.zip',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error(`File type ${ext} is not allowed`));
  },
});

// ── GET all materials for the logged-in user ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, filename, original_name, description, subject, topic, type, file_size, mime_type,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM study_materials
       WHERE user_id = ?
       ORDER BY id DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch content materials' });
  }
});

// ── GET a single material ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM study_materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Material not found' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// ── GET download a file ───────────────────────────────────────────────
router.get('/:id/download', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM study_materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Material not found' });
    if (!row.filename) return res.status(404).json({ error: 'No file attached' });

    const filePath = path.join(UPLOADS_DIR, row.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

    res.download(filePath, row.original_name || row.filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Download failed' });
  }
});

// ── POST upload one or more files ────────────────────────────────────
// Accepts multipart/form-data with field name "files" (multiple allowed)
// Also accepts optional fields: description, subject, topic
router.post('/upload', upload.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const { description, subject, topic } = req.body;
  const created = [];

  try {
    for (const file of req.files) {
      const [result] = await pool.query(
        `INSERT INTO study_materials
           (user_id, filename, original_name, description, subject, topic, type, file_size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.userId,
          file.filename,                        // stored name (timestamped)
          file.originalname,                    // original name shown to user
          description || '',
          subject || '',
          topic   || '',
          'file',
          file.size,
          file.mimetype,
        ]
      );
      created.push({
        id:            result.insertId,
        filename:      file.filename,
        original_name: file.originalname,
        description:   description || '',
        subject:       subject || '',
        topic:         topic   || '',
        type:          'file',
        file_size:     file.size,
        mime_type:     file.mimetype,
      });
    }
    res.status(201).json({ uploaded: created.length, files: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save file records' });
  }
});

// ── POST create a folder (metadata only, no actual file) ─────────────
router.post('/folder', async (req, res) => {
  const { filename, description, subject, topic } = req.body;
  if (!filename) return res.status(400).json({ error: 'Folder name is required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO study_materials
         (user_id, filename, original_name, description, subject, topic, type)
       VALUES (?, ?, ?, ?, ?, ?, 'folder')`,
      [req.userId, filename, filename, description || '', subject || '', topic || '']
    );
    res.status(201).json({
      id:            result.insertId,
      filename,
      original_name: filename,
      description:   description || '',
      subject:       subject || '',
      topic:         topic   || '',
      type:          'folder',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// ── POST create a manual record (link / AI summary / etc.) ───────────
router.post('/', async (req, res) => {
  const { filename, description, subject, topic, type } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO study_materials
         (user_id, filename, original_name, description, subject, topic, type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, filename, filename, description || '', subject || '', topic || '', type || 'file']
    );
    res.status(201).json({
      id: result.insertId,
      filename, original_name: filename,
      description: description || '',
      subject: subject || '', topic: topic || '',
      type: type || 'file',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// ── PUT update metadata ───────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const [[mat]] = await pool.query(
      'SELECT id FROM study_materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!mat) return res.status(404).json({ error: 'Material not found or access denied' });

    const allowed  = ['original_name', 'description', 'subject', 'topic'];
    const updates  = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    // Allow renaming via "filename" key from frontend
    if (req.body.filename !== undefined) updates.original_name = req.body.filename;

    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update' });

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE study_materials SET ${setClause} WHERE id = ?`,
      [...Object.values(updates), req.params.id]);
    res.json({ message: 'Material updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// ── DELETE a material (also removes file from disk) ───────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [[mat]] = await pool.query(
      'SELECT id, filename, type FROM study_materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!mat) return res.status(404).json({ error: 'Material not found or access denied' });

    // Remove physical file if it exists
    if (mat.type === 'file' && mat.filename) {
      const filePath = path.join(UPLOADS_DIR, mat.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM study_materials WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// ── Multer error handler ──────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 50MB)' });
  if (err.message) return res.status(400).json({ error: err.message });
  next(err);
});

module.exports = router;