const express  = require('express');
const router   = express.Router();
const pool     = require('../db');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { summarizeFileContent } = require('../services/openrouter');

// ── Multer storage config ─────────────────────────────────────────────
// In serverless environments (like Vercel), the filesystem is read-only except for '/tmp'.
const isServerless = process.env.VERCEL || process.env.NOW_BUILDER;
const UPLOADS_DIR = isServerless 
  ? '/tmp/uploads' 
  : path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.csv', '.json', '.js', '.css', '.html', '.xml', '.sql']);
const TEXT_MIME_PREFIXES = ['text/'];

function isReadableTextFile(material) {
  const ext = path.extname(material.original_name || material.filename || '').toLowerCase();
  const mime = material.mime_type || '';
  return TEXT_EXTENSIONS.has(ext) || TEXT_MIME_PREFIXES.some(prefix => mime.startsWith(prefix));
}

async function findOrCreateFolder(userId, name, parentId, inherited = {}) {
  const [[existing]] = await pool.query(
    `SELECT id, filename, original_name, description, subject, topic, type, file_size, mime_type, parent_id,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
     FROM study_materials
     WHERE user_id = ? AND type = 'folder' AND original_name = ? AND ${parentId ? 'parent_id = ?' : 'parent_id IS NULL'}
     LIMIT 1`,
    parentId ? [userId, name, parentId] : [userId, name]
  );
  if (existing) return existing;

  const [result] = await pool.query(
    `INSERT INTO study_materials
       (user_id, filename, original_name, description, subject, topic, type, parent_id)
     VALUES (?, ?, ?, ?, ?, ?, 'folder', ?)`,
    [userId, name, name, inherited.description || '', inherited.subject || '', inherited.topic || '', parentId || null]
  );

  return {
    id: result.insertId,
    filename: name,
    original_name: name,
    description: inherited.description || '',
    subject: inherited.subject || '',
    topic: inherited.topic || '',
    type: 'folder',
    parent_id: parentId || null,
    created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

async function resolveFolderPath(userId, relativePath, inherited = {}, rootParentId = null) {
  const parts = String(relativePath || '')
    .replace(/\\/g, '/')
    .split('/')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) return { parentId: rootParentId || null, folders: [] };

  const folderNames = parts.slice(0, -1);
  const folders = [];
  let parentId = rootParentId || null;
  for (const folderName of folderNames) {
    const folder = await findOrCreateFolder(userId, folderName, parentId, inherited);
    folders.push(folder);
    parentId = folder.id;
  }

  return { parentId, folders };
}

// ── GET all materials for the logged-in user ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, filename, original_name, description, subject, topic, type, file_size, mime_type, parent_id, student_id,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM study_materials
       WHERE user_id = ? OR student_id = ?
       ORDER BY id DESC`,
      [req.userId, req.userId]
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
      'SELECT * FROM study_materials WHERE id = ? AND (user_id = ? OR student_id = ?)',
      [req.params.id, req.userId, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Material not found or access denied' });
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
      'SELECT * FROM study_materials WHERE id = ? AND (user_id = ? OR student_id = ?)',
      [req.params.id, req.userId, req.userId]
    );
    if (!row) return res.status(404).json({ error: 'Material not found or access denied' });
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
router.post('/upload', upload.array('files', 100), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const { description, subject, topic, parent_id, student_id } = req.body;
  const rootParentId = parent_id ? Number(parent_id) : null;
  const studentId = student_id ? Number(student_id) : null;
  let relativePaths = [];
  try {
    relativePaths = req.body.relativePaths ? JSON.parse(req.body.relativePaths) : [];
  } catch (_) {
    relativePaths = [];
  }
  const created = [];
  const touchedFolders = new Map();

  try {
    if (rootParentId) {
      const [[folder]] = await pool.query(
        'SELECT id FROM study_materials WHERE id = ? AND user_id = ? AND type = "folder"',
        [rootParentId, req.userId]
      );
      if (!folder) return res.status(400).json({ error: 'Target folder not found' });
    }

    for (const [index, file] of req.files.entries()) {
      const folderInfo = await resolveFolderPath(req.userId, relativePaths[index] || file.originalname, {
        description,
        subject,
        topic,
      }, rootParentId);
      folderInfo.folders.forEach(folder => touchedFolders.set(folder.id, folder));

      const [result] = await pool.query(
        `INSERT INTO study_materials
           (user_id, filename, original_name, description, subject, topic, type, file_size, mime_type, parent_id, student_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          folderInfo.parentId,
          studentId || null,
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
        parent_id:     folderInfo.parentId,
        student_id:    studentId || null,
      });
    }
    res.status(201).json({ uploaded: created.length, files: created, folders: Array.from(touchedFolders.values()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save file records' });
  }
});

// ── POST create a folder (metadata only, no actual file) ─────────────
router.post('/folder', async (req, res) => {
  const { filename, description, subject, topic, parent_id } = req.body;
  if (!filename) return res.status(400).json({ error: 'Folder name is required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO study_materials
         (user_id, filename, original_name, description, subject, topic, type, parent_id)
       VALUES (?, ?, ?, ?, ?, ?, 'folder', ?)`,
      [req.userId, filename, filename, description || '', subject || '', topic || '', parent_id || null]
    );
    res.status(201).json({
      id:            result.insertId,
      filename,
      original_name: filename,
      description:   description || '',
      subject:       subject || '',
      topic:         topic   || '',
      type:          'folder',
      parent_id:     parent_id || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// ── POST create a manual record (link / AI summary / etc.) ───────────
router.post('/', async (req, res) => {
  const { filename, description, subject, topic, type, parent_id } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO study_materials
         (user_id, filename, original_name, description, subject, topic, type, parent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, filename, filename, description || '', subject || '', topic || '', type || 'file', parent_id || null]
    );
    res.status(201).json({
      id: result.insertId,
      filename, original_name: filename,
      description: description || '',
      subject: subject || '', topic: topic || '',
      type: type || 'file',
      parent_id: parent_id || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

router.post('/:id/move', async (req, res) => {
  const targetParentId = req.body.parent_id || null;

  try {
    const [[mat]] = await pool.query(
      'SELECT id, type FROM study_materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!mat) return res.status(404).json({ error: 'Material not found or access denied' });

    if (targetParentId) {
      if (Number(targetParentId) === Number(req.params.id)) {
        return res.status(400).json({ error: 'Cannot move an item into itself' });
      }
      const [[folder]] = await pool.query(
        'SELECT id FROM study_materials WHERE id = ? AND user_id = ? AND type = "folder"',
        [targetParentId, req.userId]
      );
      if (!folder) return res.status(400).json({ error: 'Target folder not found' });

      if (mat.type === 'folder') {
        let currentParent = Number(targetParentId);
        while (currentParent) {
          if (currentParent === Number(req.params.id)) {
            return res.status(400).json({ error: 'Cannot move a folder into one of its own folders' });
          }
          const [[parent]] = await pool.query(
            'SELECT parent_id FROM study_materials WHERE id = ? AND user_id = ?',
            [currentParent, req.userId]
          );
          currentParent = parent ? Number(parent.parent_id) : null;
        }
      }
    }

    await pool.query(
      'UPDATE study_materials SET parent_id = ? WHERE id = ? AND user_id = ?',
      [targetParentId, req.params.id, req.userId]
    );
    res.json({ message: 'Material moved', parent_id: targetParentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to move material' });
  }
});

router.post('/:id/summary', async (req, res) => {
  try {
    const [[mat]] = await pool.query(
      'SELECT * FROM study_materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!mat) return res.status(404).json({ error: 'Material not found or access denied' });
    if (mat.type !== 'file' || !isReadableTextFile(mat)) {
      return res.json({ summary: 'file not supported for ai summary' });
    }

    const filePath = path.join(UPLOADS_DIR, mat.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

    const text = fs.readFileSync(filePath, 'utf8');
    const summary = await summarizeFileContent(mat.original_name || mat.filename, text);
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary' });
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

    if (mat.type === 'folder') {
      await pool.query('UPDATE study_materials SET parent_id = NULL WHERE parent_id = ? AND user_id = ?', [req.params.id, req.userId]);
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
