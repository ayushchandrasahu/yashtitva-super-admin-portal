const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'yashtitva_super_admin_secure_secret_key_2026';
const MAX_FILE_SIZE_MB = 10;

// Initialize database
initDB();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter / brute force prevention for login
const MAX_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip, userId) {
  const cutoff = Date.now() - LOCKOUT_PERIOD_MS;
  // Clean old attempts
  db.prepare('DELETE FROM login_attempts WHERE attemptTime < ?').run(cutoff);

  const attempts = db.prepare(`
    SELECT COUNT(*) as count FROM login_attempts 
    WHERE (ip = ? OR (userId = ? AND userId IS NOT NULL)) AND attemptTime >= ?
  `).get(ip, userId || '', cutoff);

  return attempts.count;
}

function recordLoginAttempt(ip, userId) {
  db.prepare(`
    INSERT INTO login_attempts (ip, userId, attemptTime) VALUES (?, ?, ?)
  `).run(ip, userId || '', Date.now());
}

function clearLoginAttempts(ip, userId) {
  db.prepare(`
    DELETE FROM login_attempts WHERE ip = ? OR (userId = ? AND userId IS NOT NULL)
  `).run(ip, userId || '');
}

// Authentication middleware
function authenticateSuperAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorized Super Admin token is required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = db.prepare('SELECT id, userId, name, role FROM admins WHERE id = ?').get(decoded.id);

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Super Admin privileges required.'
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        sessionExpired: true,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
}

// Multer storage for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `approval_${uniqueSuffix}_${safeName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    // Strictly accept PDF files only
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' && ext === '.pdf') {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only official PDF documents are accepted.'));
  }
});

/* ========================================================
   AUTH ROUTES
   ======================================================== */

// Super Admin Login
app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const { userId, password } = req.body;

  // Server-side validation
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({
      success: false,
      field: 'userId',
      message: 'User ID is required.'
    });
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({
      success: false,
      field: 'password',
      message: 'Password is required.'
    });
  }

  const cleanUserId = userId.trim();

  // Check rate limiting
  const attempts = checkRateLimit(ip, cleanUserId);
  if (attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Account temporarily locked for 15 minutes.'
    });
  }

  // Find admin
  const admin = db.prepare('SELECT * FROM admins WHERE userId = ?').get(cleanUserId);

  if (!admin) {
    recordLoginAttempt(ip, cleanUserId);
    return res.status(401).json({
      success: false,
      message: 'Invalid User ID or Password.'
    });
  }

  // Compare password hash
  const isMatch = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatch) {
    recordLoginAttempt(ip, cleanUserId);
    return res.status(401).json({
      success: false,
      message: 'Invalid User ID or Password.'
    });
  }

  // Successful login: clear failed attempts
  clearLoginAttempts(ip, cleanUserId);

  // Update last login
  db.prepare('UPDATE admins SET lastLogin = ? WHERE id = ?').run(new Date().toISOString(), admin.id);

  // Generate secure JWT token (valid for 8 hours)
  const token = jwt.sign(
    {
      id: admin.id,
      userId: admin.userId,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      userId: admin.userId,
      name: admin.name,
      role: admin.role
    }
  });
});

// Verify Session
app.get('/api/auth/verify', authenticateSuperAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      userId: req.user.userId,
      name: req.user.name,
      role: req.user.role
    }
  });
});

/* ========================================================
   COLLEGES ROUTES
   ======================================================== */

// Register New College
app.post('/api/colleges', authenticateSuperAdmin, (req, res) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          field: 'document',
          message: `The uploaded document exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`
        });
      }
      return res.status(400).json({
        success: false,
        field: 'document',
        message: err.message || 'File upload failed.'
      });
    }

    try {
      const {
        name,
        category,
        affiliatedUniversity,
        collegeCode,
        uniqueId,
        state,
        district,
        collegeType
      } = req.body;

      // 1. Validate required fields
      if (!name || !name.trim()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, field: 'name', message: 'Name of College is required.' });
      }

      const validCategories = ['Affiliated College', 'Deemed University', 'University'];
      if (!category || !validCategories.includes(category)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, field: 'category', message: 'Valid Institutional Category is required.' });
      }

      if (category === 'Affiliated College') {
        if (!affiliatedUniversity || !affiliatedUniversity.trim()) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            field: 'affiliatedUniversity',
            message: 'Name of Affiliated University is required for Affiliated Colleges.'
          });
        }
      }

      if (!collegeCode || !collegeCode.trim()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, field: 'collegeCode', message: 'College Code is required.' });
      }

      if (!uniqueId || !uniqueId.trim()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, field: 'uniqueId', message: 'Unique ID is required.' });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          field: 'document',
          message: 'Government Approval Document (PDF) is required.'
        });
      }

      const cleanCode = collegeCode.trim().toUpperCase();
      const cleanUniqueId = uniqueId.trim().toUpperCase();
      const cleanName = name.trim();
      const cleanState = (state && state.trim()) ? state.trim() : 'Maharashtra';
      const cleanDistrict = (district && district.trim()) ? district.trim() : 'Pune';
      const cleanType = (collegeType && collegeType.trim()) ? collegeType.trim() : 'Engineering';
      const cleanAffiliatedUniv = category === 'Affiliated College' ? affiliatedUniversity.trim() : null;

      // 2. Check for duplicate College Code
      const existingCode = db.prepare('SELECT id FROM colleges WHERE UPPER(collegeCode) = ?').get(cleanCode);
      if (existingCode) {
        fs.unlinkSync(req.file.path);
        return res.status(409).json({
          success: false,
          field: 'collegeCode',
          message: `A college with College Code "${cleanCode}" is already registered.`
        });
      }

      // 3. Check for duplicate Unique ID
      const existingUniqueId = db.prepare('SELECT id FROM colleges WHERE UPPER(uniqueId) = ?').get(cleanUniqueId);
      if (existingUniqueId) {
        fs.unlinkSync(req.file.path);
        return res.status(409).json({
          success: false,
          field: 'uniqueId',
          message: `A college with Unique ID "${cleanUniqueId}" is already registered.`
        });
      }

      // 4. Save registration with status 'Pending Verification'
      // Note: Submitting does NOT automatically issue a licence.
      const relativeDocPath = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');

      const insertStmt = db.prepare(`
        INSERT INTO colleges (
          name, category, affiliatedUniversity, collegeCode, uniqueId,
          state, district, collegeType, documentPath, documentOriginalName,
          documentSize, licenceStatus, registeredAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification', ?)
      `);

      const result = insertStmt.run(
        cleanName,
        category,
        cleanAffiliatedUniv,
        cleanCode,
        cleanUniqueId,
        cleanState,
        cleanDistrict,
        cleanType,
        relativeDocPath,
        req.file.originalname,
        req.file.size,
        new Date().toISOString()
      );

      return res.status(201).json({
        success: true,
        message: 'College registration application submitted successfully. Application is currently Pending Verification.',
        college: {
          id: result.lastInsertRowid,
          name: cleanName,
          collegeCode: cleanCode,
          uniqueId: cleanUniqueId,
          licenceStatus: 'Pending Verification',
          category,
          state: cleanState,
          district: cleanDistrict,
          documentName: req.file.originalname
        }
      });
    } catch (dbErr) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Registration error:', dbErr);
      return res.status(500).json({
        success: false,
        message: 'Server error while processing college registration.'
      });
    }
  });
});

// Get Registered Colleges (with filtering, search & pagination)
app.get('/api/colleges', authenticateSuperAdmin, (req, res) => {
  try {
    const { state, district, collegeType, search, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let whereClauses = [];
    let params = [];

    if (state && state.trim() && state !== 'ALL') {
      whereClauses.push('LOWER(state) = LOWER(?)');
      params.push(state.trim());
    }

    if (district && district.trim() && district !== 'ALL') {
      whereClauses.push('LOWER(district) = LOWER(?)');
      params.push(district.trim());
    }

    if (collegeType && collegeType.trim() && collegeType !== 'ALL') {
      whereClauses.push('LOWER(collegeType) = LOWER(?)');
      params.push(collegeType.trim());
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      whereClauses.push('(LOWER(name) LIKE ? OR LOWER(collegeCode) LIKE ? OR LOWER(uniqueId) LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count
    const countSql = `SELECT COUNT(*) as total FROM colleges ${whereSql}`;
    const totalCount = db.prepare(countSql).get(...params).total;

    // Fetch records
    const selectSql = `
      SELECT id, name, state, district, collegeType, collegeCode, uniqueId,
             category, affiliatedUniversity, licenceStatus, registeredAt
      FROM colleges
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const colleges = db.prepare(selectSql).all(...params, limitNum, offset);

    return res.status(200).json({
      success: true,
      colleges,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Fetch colleges error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registered colleges.'
    });
  }
});

// Get Single College Details
app.get('/api/colleges/:id', authenticateSuperAdmin, (req, res) => {
  try {
    const collegeId = parseInt(req.params.id, 10);
    const college = db.prepare('SELECT * FROM colleges WHERE id = ?').get(collegeId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College record not found.'
      });
    }

    const licence = db.prepare('SELECT * FROM licences WHERE collegeId = ?').get(collegeId);
    const payment = db.prepare('SELECT * FROM payments WHERE collegeId = ?').get(collegeId);

    return res.status(200).json({
      success: true,
      college: {
        ...college,
        licence: licence || null,
        payment: payment || null
      }
    });
  } catch (error) {
    console.error('Get college error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving college details.'
    });
  }
});

// Secure Document Download/View
app.get('/api/colleges/:id/document', authenticateSuperAdmin, (req, res) => {
  try {
    const collegeId = parseInt(req.params.id, 10);
    const college = db.prepare('SELECT documentPath, documentOriginalName FROM colleges WHERE id = ?').get(collegeId);

    if (!college || !college.documentPath) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const fullPath = path.resolve(__dirname, '..', college.documentPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Physical document file missing on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${college.documentOriginalName}"`);
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  } catch (error) {
    console.error('Document retrieval error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving document.' });
  }
});

// Outstanding Licence Dues (Calculated from actual database records)
app.get('/api/licence-dues/outstanding', authenticateSuperAdmin, (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id as collegeId,
        c.name as collegeName,
        c.district,
        p.outstandingAmount,
        p.dueDate,
        p.status as paymentStatus,
        p.invoiceNumber,
        p.totalAmount,
        p.paidAmount
      FROM payments p
      JOIN colleges c ON p.collegeId = c.id
      WHERE p.outstandingAmount > 0
      ORDER BY p.dueDate ASC
    `;

    const dues = db.prepare(sql).all();

    return res.status(200).json({
      success: true,
      count: dues.length,
      dues
    });
  } catch (error) {
    console.error('Fetch outstanding dues error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve outstanding licence dues.'
    });
  }
});

// Verification Action: Super Admin reviews document and can approve / issue licence or reject
app.post('/api/colleges/:id/verify', authenticateSuperAdmin, (req, res) => {
  try {
    const collegeId = parseInt(req.params.id, 10);
    const { action, notes, licenceFee } = req.body; // action: 'APPROVE' or 'REJECT'

    const college = db.prepare('SELECT * FROM colleges WHERE id = ?').get(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College record not found.' });
    }

    if (action === 'APPROVE') {
      const fee = parseFloat(licenceFee) || 200000;
      const verifiedAt = new Date().toISOString();
      const licenceNumber = `YASH-LIC-${new Date().getFullYear()}-${1000 + collegeId}`;

      const updateTx = db.transaction(() => {
        db.prepare(`
          UPDATE colleges 
          SET licenceStatus = 'Active', verifiedAt = ?, verificationNotes = ?
          WHERE id = ?
        `).run(verifiedAt, notes || 'Verified legal government approval documents.', collegeId);

        // Create licence
        const licRes = db.prepare(`
          INSERT INTO licences (collegeId, licenceNumber, planType, startDate, expiryDate, totalLicenceFee, status)
          VALUES (?, ?, 'Standard Campus License', ?, ?, ?, 'Active')
        `).run(
          collegeId,
          licenceNumber,
          verifiedAt.slice(0, 10),
          new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
          fee
        );

        // Create initial pending invoice
        db.prepare(`
          INSERT INTO payments (collegeId, licenceId, invoiceNumber, totalAmount, paidAmount, outstandingAmount, dueDate, status)
          VALUES (?, ?, ?, ?, 0, ?, ?, 'Pending Payment')
        `).run(
          collegeId,
          licRes.lastInsertRowid,
          `INV-YASH-${202600 + collegeId}`,
          fee,
          fee,
          new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
        );
      });

      updateTx();

      return res.status(200).json({
        success: true,
        message: `College verified and software licence ${licenceNumber} issued.`
      });
    } else if (action === 'REJECT') {
      db.prepare(`
        UPDATE colleges
        SET licenceStatus = 'Rejected', verifiedAt = ?, verificationNotes = ?
        WHERE id = ?
      `).run(new Date().toISOString(), notes || 'Verification rejected due to invalid documents.', collegeId);

      return res.status(200).json({
        success: true,
        message: 'College registration application has been rejected.'
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action specified.' });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process verification.' });
  }
});

// Serve frontend production build if available
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Yashtitva Super Admin Backend running on port ${PORT}`);
});
