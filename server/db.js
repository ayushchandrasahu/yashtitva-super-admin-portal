const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'yashtitva.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
      createdAt TEXT NOT NULL,
      lastLogin TEXT
    );

    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      affiliatedUniversity TEXT,
      collegeCode TEXT UNIQUE NOT NULL,
      uniqueId TEXT UNIQUE NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      collegeType TEXT NOT NULL,
      documentPath TEXT NOT NULL,
      documentOriginalName TEXT NOT NULL,
      documentSize INTEGER NOT NULL,
      licenceStatus TEXT NOT NULL DEFAULT 'Pending Verification',
      verificationNotes TEXT,
      registeredAt TEXT NOT NULL,
      verifiedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS licences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collegeId INTEGER NOT NULL,
      licenceNumber TEXT UNIQUE NOT NULL,
      planType TEXT NOT NULL,
      startDate TEXT NOT NULL,
      expiryDate TEXT NOT NULL,
      totalLicenceFee REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (collegeId) REFERENCES colleges(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collegeId INTEGER NOT NULL,
      licenceId INTEGER,
      invoiceNumber TEXT UNIQUE NOT NULL,
      totalAmount REAL NOT NULL,
      paidAmount REAL NOT NULL DEFAULT 0,
      outstandingAmount REAL NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL,
      lastPaymentDate TEXT,
      FOREIGN KEY (collegeId) REFERENCES colleges(id) ON DELETE CASCADE,
      FOREIGN KEY (licenceId) REFERENCES licences(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      userId TEXT,
      attemptTime INTEGER NOT NULL
    );
  `);

  seedData();
}

function seedData() {
  // Check if admin exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Admin@Yashtitva2026!', salt);

    db.prepare(`
      INSERT INTO admins (userId, passwordHash, name, role, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', passwordHash, 'Yashtitva Super Admin', 'SUPER_ADMIN', new Date().toISOString());

    console.log('Default Super Admin account seeded successfully.');
  }

  // Check if colleges exist
  const collegeCount = db.prepare('SELECT COUNT(*) as count FROM colleges').get().count;
  if (collegeCount === 0) {
    const insertCollege = db.prepare(`
      INSERT INTO colleges (
        name, category, affiliatedUniversity, collegeCode, uniqueId,
        state, district, collegeType, documentPath, documentOriginalName,
        documentSize, licenceStatus, registeredAt, verifiedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLicence = db.prepare(`
      INSERT INTO licences (
        collegeId, licenceNumber, planType, startDate, expiryDate, totalLicenceFee, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT INTO payments (
        collegeId, licenceId, invoiceNumber, totalAmount, paidAmount, outstandingAmount, dueDate, status, lastPaymentDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedColleges = [
      {
        name: 'College of Engineering Pune (COEP)',
        category: 'University',
        affiliatedUniversity: null,
        collegeCode: 'COEP-1854',
        uniqueId: 'UNQ-MH-COEP-01',
        state: 'Maharashtra',
        district: 'Pune',
        collegeType: 'Engineering',
        licenceStatus: 'Active',
        totalFee: 250000,
        paid: 250000,
        outstanding: 0,
        dueDate: '2026-08-15',
        paymentStatus: 'Paid',
        lastPayment: '2026-08-10'
      },
      {
        name: 'VJTI Technical Institute',
        category: 'Affiliated College',
        affiliatedUniversity: 'University of Mumbai',
        collegeCode: 'VJTI-1887',
        uniqueId: 'UNQ-MH-VJTI-02',
        state: 'Maharashtra',
        district: 'Mumbai',
        collegeType: 'Engineering',
        licenceStatus: 'Active',
        totalFee: 220000,
        paid: 100000,
        outstanding: 120000,
        dueDate: '2026-10-15', // Overdue
        paymentStatus: 'Overdue',
        lastPayment: '2026-05-12'
      },
      {
        name: 'Symbiosis International University',
        category: 'Deemed University',
        affiliatedUniversity: null,
        collegeCode: 'SIU-2002',
        uniqueId: 'UNQ-MH-SIU-03',
        state: 'Maharashtra',
        district: 'Pune',
        collegeType: 'Management',
        licenceStatus: 'Active',
        totalFee: 300000,
        paid: 150000,
        outstanding: 150000,
        dueDate: '2026-11-05', // Pending Payment
        paymentStatus: 'Pending Payment',
        lastPayment: '2026-04-20'
      },
      {
        name: 'Grant Medical College and Sir J.J. Hospital',
        category: 'Affiliated College',
        affiliatedUniversity: 'Maharashtra University of Health Sciences',
        collegeCode: 'GMC-1845',
        uniqueId: 'UNQ-MH-GMC-04',
        state: 'Maharashtra',
        district: 'Mumbai',
        collegeType: 'Medical',
        licenceStatus: 'Active',
        totalFee: 280000,
        paid: 280000,
        outstanding: 0,
        dueDate: '2026-07-30',
        paymentStatus: 'Paid',
        lastPayment: '2026-07-25'
      },
      {
        name: 'RV College of Engineering',
        category: 'Affiliated College',
        affiliatedUniversity: 'Visvesvaraya Technological University',
        collegeCode: 'RVCE-1963',
        uniqueId: 'UNQ-KA-RVCE-05',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        collegeType: 'Engineering',
        licenceStatus: 'Active',
        totalFee: 240000,
        paid: 160000,
        outstanding: 80000,
        dueDate: '2026-10-10', // Overdue
        paymentStatus: 'Overdue',
        lastPayment: '2026-06-14'
      },
      {
        name: 'National Law School of India University',
        category: 'University',
        affiliatedUniversity: null,
        collegeCode: 'NLSIU-1987',
        uniqueId: 'UNQ-KA-NLS-06',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        collegeType: 'Law',
        licenceStatus: 'Active',
        totalFee: 200000,
        paid: 200000,
        outstanding: 0,
        dueDate: '2026-09-01',
        paymentStatus: 'Paid',
        lastPayment: '2026-08-28'
      },
      {
        name: 'Madras Christian College',
        category: 'Affiliated College',
        affiliatedUniversity: 'University of Madras',
        collegeCode: 'MCC-1837',
        uniqueId: 'UNQ-TN-MCC-07',
        state: 'Tamil Nadu',
        district: 'Chennai',
        collegeType: 'Arts and Science',
        licenceStatus: 'Active',
        totalFee: 180000,
        paid: 90000,
        outstanding: 90000,
        dueDate: '2026-11-20',
        paymentStatus: 'Pending Payment',
        lastPayment: '2026-05-18'
      },
      {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        category: 'University',
        affiliatedUniversity: null,
        collegeCode: 'AIIMS-ND-1956',
        uniqueId: 'UNQ-DL-AIIMS-08',
        state: 'Delhi',
        district: 'New Delhi',
        collegeType: 'Medical',
        licenceStatus: 'Active',
        totalFee: 350000,
        paid: 350000,
        outstanding: 0,
        dueDate: '2026-08-30',
        paymentStatus: 'Paid',
        lastPayment: '2026-08-15'
      },
      {
        name: 'Faculty of Management Studies (FMS)',
        category: 'Affiliated College',
        affiliatedUniversity: 'University of Delhi',
        collegeCode: 'FMS-1954',
        uniqueId: 'UNQ-DL-FMS-09',
        state: 'Delhi',
        district: 'North Delhi',
        collegeType: 'Management',
        licenceStatus: 'Active',
        totalFee: 220000,
        paid: 220000,
        outstanding: 0,
        dueDate: '2026-09-15',
        paymentStatus: 'Paid',
        lastPayment: '2026-09-05'
      },
      {
        name: 'Maharashtra Institute of Technology (MIT-WPU)',
        category: 'University',
        affiliatedUniversity: null,
        collegeCode: 'MIT-1983',
        uniqueId: 'UNQ-MH-MIT-10',
        state: 'Maharashtra',
        district: 'Pune',
        collegeType: 'Engineering',
        licenceStatus: 'Pending Verification',
        totalFee: 0,
        paid: 0,
        outstanding: 0,
        dueDate: '2026-12-31',
        paymentStatus: 'Pending Verification',
        lastPayment: null
      }
    ];

    const insertTx = db.transaction(() => {
      seedColleges.forEach((c, idx) => {
        const result = insertCollege.run(
          c.name,
          c.category,
          c.affiliatedUniversity,
          c.collegeCode,
          c.uniqueId,
          c.state,
          c.district,
          c.collegeType,
          'uploads/sample_approval_doc.pdf',
          'Govt_Approval_Order_AICTE_UGC.pdf',
          245600,
          c.licenceStatus,
          new Date(Date.now() - (idx + 1) * 86400000 * 5).toISOString(),
          c.licenceStatus === 'Active' ? new Date(Date.now() - (idx + 1) * 86400000 * 4).toISOString() : null
        );

        const collegeId = result.lastInsertRowid;

        if (c.licenceStatus === 'Active') {
          const licResult = insertLicence.run(
            collegeId,
            `YASH-LIC-2026-${1000 + collegeId}`,
            'Annual Institution Access License',
            '2026-01-01',
            '2026-12-31',
            c.totalFee,
            'Active'
          );

          insertPayment.run(
            collegeId,
            licResult.lastInsertRowid,
            `INV-YASH-${202600 + collegeId}`,
            c.totalFee,
            c.paid,
            c.outstanding,
            c.dueDate,
            c.paymentStatus,
            c.lastPayment
          );
        }
      });
    });

    insertTx();
    console.log('Seeded initial college, licence, and payment records into SQLite.');
  }
}

module.exports = {
  db,
  initDB
};
