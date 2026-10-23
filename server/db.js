const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const os = require('os');

const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? path.join(os.tmpdir(), 'yashtitva.db') : path.join(__dirname, 'yashtitva.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
if (!isVercel) {
  try {
    db.pragma('journal_mode = WAL');
  } catch (e) {}
}
try {
  db.pragma('foreign_keys = ON');
} catch (e) {}

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
      paymentMethod TEXT DEFAULT 'Online Gateway (Razorpay)',
      taxGst REAL DEFAULT 0,
      gatewayFee REAL DEFAULT 0,
      refundedAmount REAL DEFAULT 0,
      FOREIGN KEY (collegeId) REFERENCES colleges(id) ON DELETE CASCADE,
      FOREIGN KEY (licenceId) REFERENCES licences(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      userId TEXT,
      attemptTime INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      expenseDate TEXT NOT NULL,
      vendor TEXT NOT NULL,
      notes TEXT,
      isRecurring INTEGER NOT NULL DEFAULT 0,
      paymentStatus TEXT NOT NULL DEFAULT 'Paid',
      paymentMethod TEXT DEFAULT 'Corporate Card',
      receiptName TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collegeId INTEGER NOT NULL,
      collegeName TEXT NOT NULL,
      planName TEXT NOT NULL,
      billingCycle TEXT NOT NULL DEFAULT 'Annual',
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      startDate TEXT NOT NULL,
      renewalDate TEXT NOT NULL,
      autoRenew INTEGER NOT NULL DEFAULT 1,
      studentsCount INTEGER DEFAULT 0,
      FOREIGN KEY (collegeId) REFERENCES colleges(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketCode TEXT UNIQUE NOT NULL,
      collegeId INTEGER,
      collegeName TEXT NOT NULL,
      submitterName TEXT NOT NULL,
      submitterRole TEXT NOT NULL DEFAULT 'College Admin',
      submitterEmail TEXT,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Open',
      slaHours INTEGER DEFAULT 24,
      createdAt TEXT NOT NULL,
      resolvedAt TEXT,
      resolutionNotes TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adminUserId TEXT NOT NULL,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT,
      details TEXT NOT NULL,
      ip TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
      status TEXT NOT NULL DEFAULT 'Active',
      lastActive TEXT,
      permissions TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  // Migrations for existing tables
  try { db.exec("ALTER TABLE payments ADD COLUMN paymentMethod TEXT DEFAULT 'Online Gateway (Razorpay)'"); } catch(e){}
  try { db.exec("ALTER TABLE payments ADD COLUMN taxGst REAL DEFAULT 0"); } catch(e){}
  try { db.exec("ALTER TABLE payments ADD COLUMN gatewayFee REAL DEFAULT 0"); } catch(e){}
  try { db.exec("ALTER TABLE payments ADD COLUMN refundedAmount REAL DEFAULT 0"); } catch(e){}
  try {
    db.exec(`
      UPDATE payments 
      SET taxGst = ROUND(totalAmount * 0.18),
          gatewayFee = ROUND(paidAmount * 0.02)
      WHERE taxGst = 0 OR taxGst IS NULL
    `);
  } catch (e) {}

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
    `).run('admin', passwordHash, 'Yashtitva Super Admin (Founder)', 'SUPER_ADMIN', new Date().toISOString());

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
        collegeId, licenceId, invoiceNumber, totalAmount, paidAmount, outstandingAmount, dueDate, status, lastPaymentDate, paymentMethod, taxGst, gatewayFee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        lastPayment: '2026-08-10',
        planName: 'Enterprise Campus Plan',
        students: 4500
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
        dueDate: '2026-10-15',
        paymentStatus: 'Overdue',
        lastPayment: '2026-05-12',
        planName: 'Pro Campus Plan',
        students: 3800
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
        dueDate: '2026-11-05',
        paymentStatus: 'Pending Payment',
        lastPayment: '2026-04-20',
        planName: 'Enterprise Campus Plan',
        students: 6200
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
        lastPayment: '2026-07-25',
        planName: 'Pro Campus Plan',
        students: 2100
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
        dueDate: '2026-10-10',
        paymentStatus: 'Overdue',
        lastPayment: '2026-06-14',
        planName: 'Pro Campus Plan',
        students: 4100
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
        lastPayment: '2026-08-28',
        planName: 'Standard Campus Plan',
        students: 1500
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
        lastPayment: '2026-05-18',
        planName: 'Standard Campus Plan',
        students: 3400
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
        lastPayment: '2026-08-15',
        planName: 'Enterprise Campus Plan',
        students: 2800
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
        lastPayment: '2026-09-05',
        planName: 'Pro Campus Plan',
        students: 1200
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
        lastPayment: null,
        planName: 'Pending Plan Selection',
        students: 0
      },
      {
        name: 'St. Xavier’s College Autonomous',
        category: 'Affiliated College',
        affiliatedUniversity: 'University of Mumbai',
        collegeCode: 'SXC-1869',
        uniqueId: 'UNQ-MH-SXC-11',
        state: 'Maharashtra',
        district: 'Mumbai',
        collegeType: 'Arts and Science',
        licenceStatus: 'Trial',
        totalFee: 150000,
        paid: 0,
        outstanding: 150000,
        dueDate: '2026-11-15',
        paymentStatus: 'Trial Period (30 Days)',
        lastPayment: null,
        planName: 'Free Trial (Expiring in 12 days)',
        students: 2900
      },
      {
        name: 'Birla Institute of Technology and Science (BITS Pilani)',
        category: 'Deemed University',
        affiliatedUniversity: null,
        collegeCode: 'BITS-1964',
        uniqueId: 'UNQ-RJ-BITS-12',
        state: 'Rajasthan',
        district: 'Jhunjhunu',
        collegeType: 'Engineering',
        licenceStatus: 'Active',
        totalFee: 320000,
        paid: 320000,
        outstanding: 0,
        dueDate: '2026-09-20',
        paymentStatus: 'Paid',
        lastPayment: '2026-09-12',
        planName: 'Enterprise Campus Plan',
        students: 5400
      }
    ];

    const insertSubscription = db.prepare(`
      INSERT INTO subscriptions (
        collegeId, collegeName, planName, billingCycle, amount, status, startDate, renewalDate, autoRenew, studentsCount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

        if (c.licenceStatus === 'Active' || c.licenceStatus === 'Trial') {
          const licResult = insertLicence.run(
            collegeId,
            `YASH-LIC-2026-${1000 + collegeId}`,
            c.planName,
            '2026-01-01',
            '2026-12-31',
            c.totalFee,
            c.licenceStatus
          );

          const tax = Math.round(c.totalFee * 0.18);
          const gateway = Math.round(c.paid * 0.02);

          insertPayment.run(
            collegeId,
            licResult.lastInsertRowid,
            `INV-YASH-${202600 + collegeId}`,
            c.totalFee,
            c.paid,
            c.outstanding,
            c.dueDate,
            c.paymentStatus,
            c.lastPayment,
            'Online Gateway (Razorpay)',
            tax,
            gateway
          );

          insertSubscription.run(
            collegeId,
            c.name,
            c.planName,
            'Annual',
            c.totalFee,
            c.licenceStatus === 'Trial' ? 'Trial' : 'Active',
            '2026-01-01',
            '2026-12-31',
            1,
            c.students
          );
        }
      });
    });

  }

  // Ensure subscriptions are populated if empty
  const subCount = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get().count;
  if (subCount === 0) {
    const collegesWithLicences = db.prepare(`
      SELECT c.id, c.name, c.licenceStatus, l.planType, l.totalLicenceFee, l.startDate, l.expiryDate
      FROM colleges c
      JOIN licences l ON c.id = l.collegeId
    `).all();

    const insertSub = db.prepare(`
      INSERT INTO subscriptions (
        collegeId, collegeName, planName, billingCycle, amount, status, startDate, renewalDate, autoRenew, studentsCount
      ) VALUES (?, ?, ?, 'Annual', ?, ?, ?, ?, 1, ?)
    `);

    const subTx = db.transaction(() => {
      collegesWithLicences.forEach((cl) => {
        const studentCount = 1500 + (cl.id * 350);
        insertSub.run(
          cl.id,
          cl.name,
          cl.planType || 'Standard Campus Plan',
          cl.totalLicenceFee || 220000,
          cl.licenceStatus === 'Trial' ? 'Trial' : 'Active',
          cl.startDate || '2026-01-01',
          cl.expiryDate || '2026-12-31',
          studentCount
        );
      });
    });
    subTx();
    console.log('Synchronized subscriptions from licences.');
  }

  // Seed Operating Expenses if table is empty
  const expenseCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
  if (expenseCount === 0) {
    const insertExp = db.prepare(`
      INSERT INTO expenses (category, amount, expenseDate, vendor, notes, isRecurring, paymentStatus, paymentMethod, receiptName, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedExpenses = [
      { category: 'Hosting & Cloud Infrastructure', amount: 48500, date: '2026-10-02', vendor: 'Amazon Web Services (AWS)', notes: 'EC2 production cluster, S3 storage & CloudFront CDN', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'AWS_Oct_Invoice_48500.pdf' },
      { category: 'Database Services', amount: 22000, date: '2026-10-05', vendor: 'MongoDB Atlas & SQLite Cloud', notes: 'Primary high-availability cluster & replication', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'DB_Cluster_Oct.pdf' },
      { category: 'AI API Usage', amount: 34200, date: '2026-10-10', vendor: 'Anthropic & OpenAI & Gemini', notes: 'Document verification OCR, student achievement summarization', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'AI_Token_Invoice_1026.pdf' },
      { category: 'SMS & Email Services', amount: 14500, date: '2026-10-12', vendor: 'Twilio & Resend', notes: 'Transactional student OTPs, college notification digests', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'Resend_Oct_Stmt.pdf' },
      { category: 'Storage & Bandwidth', amount: 8900, date: '2026-10-14', vendor: 'Cloudflare', notes: 'DDoS mitigation, enterprise SSL, R2 certificate asset storage', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'CF_Monthly_8900.pdf' },
      { category: 'Development & Engineering', amount: 185000, date: '2026-10-01', vendor: 'Core Engineering Team', notes: 'Monthly payroll for full-stack, mobile, and security engineers', recurring: 1, status: 'Paid', method: 'Bank Transfer (NEFT)', receipt: 'Payroll_Disbursement_Oct.pdf' },
      { category: 'Marketing & Advertising', amount: 42000, date: '2026-10-15', vendor: 'LinkedIn & EdTech Summit Ads', notes: 'Higher education dean outreach campaigns and summit sponsorship', recurring: 0, status: 'Paid', method: 'Corporate Card', receipt: 'LinkedIn_Campaign_Oct.pdf' },
      { category: 'Payment Gateway Fees', amount: 16800, date: '2026-10-18', vendor: 'Razorpay Software Pvt Ltd', notes: 'Payment processing fees on ₹8.4L collected payments (2%)', recurring: 1, status: 'Paid', method: 'Automated Deduction', receipt: 'Razorpay_Oct_Stmt.pdf' },
      { category: 'Software Subscriptions & SaaS', amount: 12500, date: '2026-10-04', vendor: 'GitHub, Figma, Slack, Jira', notes: 'Developer licenses and product design tool seats', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'SaaS_Tooling_Oct.pdf' },
      { category: 'Customer Support & Success', amount: 35000, date: '2026-10-01', vendor: 'Support Specialists', notes: 'College onboarding assistance and 24/7 student query desk', recurring: 1, status: 'Paid', method: 'Bank Transfer (NEFT)', receipt: 'Support_Retainer_Oct.pdf' },
      { category: 'Hosting & Cloud Infrastructure', amount: 46200, date: '2026-09-02', vendor: 'Amazon Web Services (AWS)', notes: 'September cloud compute & bandwidth', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'AWS_Sep_Invoice.pdf' },
      { category: 'Development & Engineering', amount: 185000, date: '2026-09-01', vendor: 'Core Engineering Team', notes: 'September developer payroll', recurring: 1, status: 'Paid', method: 'Bank Transfer (NEFT)', receipt: 'Payroll_Sep.pdf' },
      { category: 'AI API Usage', amount: 28500, date: '2026-09-10', vendor: 'Anthropic & Gemini', notes: 'September document parsing tokens', recurring: 1, status: 'Paid', method: 'Corporate Card', receipt: 'AI_Sep.pdf' }
    ];

    const expTx = db.transaction(() => {
      seedExpenses.forEach(exp => {
        insertExp.run(
          exp.category,
          exp.amount,
          exp.date,
          exp.vendor,
          exp.notes,
          exp.recurring,
          exp.status,
          exp.method,
          exp.receipt,
          new Date().toISOString()
        );
      });
    });
    expTx();
    console.log('Seeded operating expenses.');
  }

  // Seed Customer Complaints / Tickets if empty
  const complaintCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
  if (complaintCount === 0) {
    const insertComplaint = db.prepare(`
      INSERT INTO complaints (ticketCode, collegeId, collegeName, submitterName, submitterRole, submitterEmail, category, subject, description, priority, status, slaHours, createdAt, resolvedAt, resolutionNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedComplaints = [
      {
        ticketCode: 'TCK-2026-881',
        collegeId: 2,
        collegeName: 'VJTI Technical Institute',
        submitterName: 'Prof. Rajesh Sharma',
        submitterRole: 'College Admin',
        submitterEmail: 'admin.tech@vjti.ac.in',
        category: 'Licensing & Invoices',
        subject: 'Invoice GST breakdown clarification for Finance Office',
        description: 'Our accounts department requires split GST (CGST 9% + SGST 9%) clearly annotated on invoice INV-YASH-202602 to release the remaining balance.',
        priority: 'High',
        status: 'In Progress',
        slaHours: 24,
        createdAt: '2026-10-21T09:30:00Z',
        resolvedAt: null,
        notes: null
      },
      {
        ticketCode: 'TCK-2026-879',
        collegeId: 1,
        collegeName: 'College of Engineering Pune (COEP)',
        submitterName: 'Dr. Anita Deshmukh',
        submitterRole: 'College Admin',
        submitterEmail: 'dean.acad@coep.ac.in',
        category: 'Student Portal Sync',
        subject: 'Bulk student roster import CSV formatting error',
        description: 'Encountered duplicate roll number alert during second-year student batch upload. Need engineering assistance to skip existing records.',
        priority: 'Medium',
        status: 'Open',
        slaHours: 48,
        createdAt: '2026-10-22T14:15:00Z',
        resolvedAt: null,
        notes: null
      },
      {
        ticketCode: 'TCK-2026-865',
        collegeId: 5,
        collegeName: 'RV College of Engineering',
        submitterName: 'Karthik Ramanathan',
        submitterRole: 'Campus Coordinator',
        submitterEmail: 'karthik@rvce.edu.in',
        category: 'Certificate Generation',
        subject: 'QR code verification redirecting to staging domain',
        description: 'Event participation certificates issued yesterday contained verification QR codes pointing to temporary URL. All certificates re-issued correctly.',
        priority: 'Critical',
        status: 'Resolved',
        slaHours: 12,
        createdAt: '2026-10-18T11:00:00Z',
        resolvedAt: '2026-10-18T15:45:00Z',
        notes: 'DNS mapping issue resolved on Cloudflare edge. All generated PDF hashes updated.'
      },
      {
        ticketCode: 'TCK-2026-850',
        collegeId: 3,
        collegeName: 'Symbiosis International University',
        submitterName: 'Pooja Kulkarni',
        submitterRole: 'Faculty Coordinator',
        submitterEmail: 'pooja.k@siu.edu.in',
        category: 'Platform Access',
        subject: 'Department head permission delegation request',
        description: 'Need capability for 4 HoDs to approve student hackathon participation entries before final submission to Super Admin.',
        priority: 'Low',
        status: 'Resolved',
        slaHours: 72,
        createdAt: '2026-10-14T10:00:00Z',
        resolvedAt: '2026-10-15T16:20:00Z',
        notes: 'Enabled custom role RBAC preset on Symbiosis admin portal.'
      }
    ];

    const cTx = db.transaction(() => {
      seedComplaints.forEach(c => {
        insertComplaint.run(
          c.ticketCode,
          c.collegeId,
          c.collegeName,
          c.submitterName,
          c.submitterRole,
          c.submitterEmail,
          c.category,
          c.subject,
          c.description,
          c.priority,
          c.status,
          c.slaHours,
          c.createdAt,
          c.resolvedAt,
          c.notes
        );
      });
    });
    cTx();
    console.log('Seeded complaints and support tickets.');
  }

  // Seed Audit Logs if empty
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  if (auditCount === 0) {
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (adminUserId, action, entityType, entityId, details, ip, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const seedAudits = [
      { admin: 'admin', action: 'LOGIN_SUCCESS', entity: 'AUTH', id: 'admin', details: 'Successful authentication from authorized device (IP: 192.168.1.100)', ip: '192.168.1.100', time: '2026-10-23T16:45:00Z' },
      { admin: 'admin', action: 'COLLEGE_VERIFIED', entity: 'COLLEGES', id: '1', details: 'Verified and approved COEP application with licence YASH-LIC-2026-1001', ip: '192.168.1.100', time: '2026-10-20T11:20:00Z' },
      { admin: 'admin', action: 'EXPENSE_RECORDED', entity: 'FINANCE', id: 'EXP-101', details: 'Recorded AWS monthly hosting infrastructure expense: ₹48,500', ip: '192.168.1.100', time: '2026-10-15T14:10:00Z' },
      { admin: 'admin', action: 'INVOICE_GENERATED', entity: 'PAYMENTS', id: 'INV-YASH-202603', details: 'Issued annual licence invoice to Symbiosis International University (₹3,00,000)', ip: '192.168.1.100', time: '2026-10-10T09:15:00Z' },
      { admin: 'admin', action: 'SECURITY_SCAN', entity: 'SYSTEM', id: 'SCAN-09', details: 'Automated rate-limiting and SQL injection vulnerability audit completed (0 flags)', ip: '127.0.0.1', time: '2026-10-08T03:00:00Z' }
    ];

    const aTx = db.transaction(() => {
      seedAudits.forEach(a => {
        insertAudit.run(a.admin, a.action, a.entity, a.id, a.details, a.ip, a.time);
      });
    });
    aTx();
    console.log('Seeded audit logs.');
  }

  // Seed Team Members if empty
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM team_members').get().count;
  if (teamCount === 0) {
    const insertTeam = db.prepare(`
      INSERT INTO team_members (name, email, role, status, lastActive, permissions, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const seedTeam = [
      { name: 'Ayush Chandra Sahu', email: 'owner@yashtitva.com', role: 'PLATFORM_OWNER', status: 'Active', lastActive: '2026-10-23T22:30:00Z', perms: 'ALL_PERMISSIONS,FINANCE_ADMIN,VERIFICATION_SUPERVISOR,SYSTEM_SECURITY', created: '2026-01-01' },
      { name: 'Vikram Mehta, CA', email: 'vikram.finance@yashtitva.com', role: 'FINANCIAL_AUDITOR', status: 'Active', lastActive: '2026-10-22T17:15:00Z', perms: 'FINANCE_READ_WRITE,INVOICE_MANAGE,TAX_AUDIT,REPORTS_EXPORT', created: '2026-02-15' },
      { name: 'Dr. Rohini Sen', email: 'rohini.onboarding@yashtitva.com', role: 'COLLEGE_OPERATIONS_LEAD', status: 'Active', lastActive: '2026-10-23T11:45:00Z', perms: 'COLLEGE_VERIFY,SUBSCRIPTIONS_VIEW,COMPLAINTS_RESOLVE', created: '2026-03-01' },
      { name: 'Pawan Kalyan', email: 'support.lead@yashtitva.com', role: 'SUPPORT_SPECIALIST', status: 'Active', lastActive: '2026-10-23T20:10:00Z', perms: 'COMPLAINTS_READ_WRITE,STUDENT_VERIFICATION_SUPPORT', created: '2026-05-10' }
    ];

    const tTx = db.transaction(() => {
      seedTeam.forEach(t => {
        insertTeam.run(t.name, t.email, t.role, t.status, t.lastActive, t.perms, t.created);
      });
    });
    tTx();
    console.log('Seeded team members.');
  }
}

module.exports = {
  db,
  initDB
};
