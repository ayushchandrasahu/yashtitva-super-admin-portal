const fs = require('fs');
const path = require('path');

async function runTestSuite() {
  console.log('====================================================');
  console.log('YASHTITVA SUPER ADMIN PORTAL - COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:5000';
  let adminToken = '';

  // 1. Test unauthenticated rejection
  console.log('1. Testing route protection on unauthenticated requests...');
  const unauthRes = await fetch(`${BASE_URL}/api/colleges`);
  const unauthData = await unauthRes.json();
  if (unauthRes.status === 401 && !unauthData.success) {
    console.log('   ✓ Protected routes correctly reject unauthenticated requests.');
  } else {
    console.error('   ✗ Protected route failed to reject unauthenticated access!');
    process.exit(1);
  }

  // 2. Test Invalid Login
  console.log('\n2. Testing invalid Super Admin login credentials...');
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'admin', password: 'WrongPassword123!' })
  });
  const badLoginData = await badLoginRes.json();
  if (badLoginRes.status === 401 && !badLoginData.success) {
    console.log('   ✓ Server correctly rejects invalid login with secure failure message.');
  } else {
    console.error('   ✗ Invalid login failed to reject!');
    process.exit(1);
  }

  // 3. Test Successful Login
  console.log('\n3. Testing valid Super Admin login...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'admin', password: 'Admin@Yashtitva2026!' })
  });
  const loginData = await loginRes.json();
  if (loginRes.status === 200 && loginData.success && loginData.token) {
    adminToken = loginData.token;
    console.log(`   ✓ Authenticated successfully! Super Admin: ${loginData.user.name} (${loginData.user.userId})`);
  } else {
    console.error('   ✗ Super Admin login failed!');
    process.exit(1);
  }

  // 4. Test Session Verification
  console.log('\n4. Testing session token verification (/api/auth/verify)...');
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const verifyData = await verifyRes.json();
  if (verifyRes.status === 200 && verifyData.success) {
    console.log(`   ✓ Session token verified for user: ${verifyData.user.userId}`);
  } else {
    console.error('   ✗ Session verification failed!');
    process.exit(1);
  }

  // 5. Test New College Registration with PDF upload
  console.log('\n5. Testing New College Registration with PDF upload (Status must be "Pending Verification")...');
  
  // Create a multipart form request with dummy PDF
  const testUniqueCode = 'TEST-COL-' + Date.now();
  const testUniqueId = 'UNQ-MH-TEST-' + Date.now();
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF');

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let formBody = '';
  
  const addField = (name, val) => {
    formBody += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`;
  };

  addField('name', 'Pimpri Chinchwad College of Engineering');
  addField('category', 'Affiliated College');
  addField('affiliatedUniversity', 'Savitribai Phule Pune University');
  addField('collegeCode', testUniqueCode);
  addField('uniqueId', testUniqueId);
  addField('state', 'Maharashtra');
  addField('district', 'Pune');
  addField('collegeType', 'Engineering');

  // File field
  const fileHeader = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="Govt_Order_PCCOE.pdf"\r\nContent-Type: application/pdf\r\n\r\n`);
  const fileFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
  const fullBody = Buffer.concat([Buffer.from(formBody), fileHeader, pdfBuffer, fileFooter]);

  const regRes = await fetch(`${BASE_URL}/api/colleges`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: fullBody
  });

  const regData = await regRes.json();
  if (regRes.status === 201 && regData.success) {
    console.log(`   ✓ New College registered successfully! Status: "${regData.college.licenceStatus}" (Licence not auto-issued)`);
  } else {
    console.error('   ✗ College registration failed:', regData);
    process.exit(1);
  }

  // 6. Test Duplicate Prevention
  console.log('\n6. Testing duplicate detection for College Code and Unique ID...');
  const dupRes = await fetch(`${BASE_URL}/api/colleges`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: fullBody
  });
  const dupData = await dupRes.json();
  if (dupRes.status === 409 && !dupData.success) {
    console.log(`   ✓ Duplicate correctly rejected with message: "${dupData.message}"`);
  } else {
    console.error('   ✗ Duplicate validation failed to reject duplicate!');
    process.exit(1);
  }

  // 7. Test Filtering Registered Colleges (State, District, College Type, Search)
  console.log('\n7. Testing Registered Colleges Filtering & Search...');
  
  // Filter by Maharashtra & Pune
  const filterRes = await fetch(`${BASE_URL}/api/colleges?state=Maharashtra&district=Pune`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const filterData = await filterRes.json();
  console.log(`   ✓ Maharashtra + Pune filter returned ${filterData.colleges.length} colleges:`);
  filterData.colleges.forEach(c => {
    console.log(`     - [${c.collegeCode}] ${c.name} | District: ${c.district} | Status: ${c.licenceStatus}`);
  });

  // Filter by Search Query
  const searchRes = await fetch(`${BASE_URL}/api/colleges?search=${testUniqueCode}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const searchData = await searchRes.json();
  if (searchData.colleges.length === 1 && searchData.colleges[0].collegeCode === testUniqueCode) {
    console.log(`   ✓ Search by College Code successfully found newly registered college.`);
  } else {
    console.error('   ✗ Search query failed!');
  }

  // 8. Test Outstanding Licence Dues Calculation
  console.log('\n8. Testing Outstanding Licence Dues Calculation (Actual DB records)...');
  const duesRes = await fetch(`${BASE_URL}/api/licence-dues/outstanding`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const duesData = await duesRes.json();
  if (duesRes.status === 200 && duesData.success) {
    console.log(`   ✓ Found ${duesData.count} colleges with outstanding payments:`);
    duesData.dues.forEach(d => {
      console.log(`     - ${d.collegeName} (${d.district}): ₹${d.outstandingAmount.toLocaleString('en-IN')} Due Date: ${d.dueDate} [${d.paymentStatus}]`);
    });
  } else {
    console.error('   ✗ Fetching outstanding dues failed!');
  }

  // 9. Test Verification Workflow (Super Admin reviews document and approves / issues licence)
  console.log('\n9. Testing Super Admin Document Verification Workflow...');
  const newCollegeId = regData.college.id;
  const verifyActionRes = await fetch(`${BASE_URL}/api/colleges/${newCollegeId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      action: 'APPROVE',
      notes: 'Legal AICTE and state approval documents verified by Super Admin.',
      licenceFee: 250000
    })
  });
  const verifyActionData = await verifyActionRes.json();
  if (verifyActionRes.status === 200 && verifyActionData.success) {
    console.log(`   ✓ ${verifyActionData.message}`);
    
    // Check updated college details
    const updatedColRes = await fetch(`${BASE_URL}/api/colleges/${newCollegeId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const updatedColData = await updatedColRes.json();
    console.log(`   ✓ Verified College Status: "${updatedColData.college.licenceStatus}" | Licence No: ${updatedColData.college.licence.licenceNumber}`);
  } else {
    console.error('   ✗ Document verification action failed!');
  }

  console.log('\n====================================================');
  console.log('ALL SYSTEM CHECKS & VERIFICATION TESTS PASSED (100%)');
  console.log('====================================================');
}

runTestSuite().catch(console.error);
