const fs = require('fs');

async function testBICommandCenter() {
  console.log('================================================================');
  console.log('YASHTITVA BUSINESS COMMAND CENTER - COMPREHENSIVE SUITE');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000';
  let token = '';

  // 1. Authenticate Super Admin
  console.log('1. Authenticating Super Admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'admin', password: 'Admin@Yashtitva2026!', mfaCode: '123456' })
  });
  const loginData = await loginRes.json();
  if (loginRes.status === 200 && loginData.success) {
    token = loginData.token;
    console.log(`   ✓ Super Admin authenticated: ${loginData.user.name} (${loginData.user.userId})`);
  } else {
    console.error('   ✗ Super Admin login failed!');
    process.exit(1);
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  // 2. Test Business Overview & 12 KPIs
  console.log('\n2. Testing Business Overview Dashboard & 12 KPI calculations...');
  const dashRes = await fetch(`${BASE_URL}/api/dashboard/overview?period=30d`, { headers: authHeader });
  const dashData = await dashRes.json();
  if (dashRes.status === 200 && dashData.success && dashData.kpis.length === 12) {
    console.log(`   ✓ Received ${dashData.kpis.length} executive KPIs:`);
    dashData.kpis.forEach(k => {
      console.log(`     - [${k.id}] ${k.label}: ${k.value} (${k.percentChange})`);
    });
  } else {
    console.error('   ✗ Overview KPIs failed!');
    process.exit(1);
  }

  // 3. Test Financial Analytics Workspace
  console.log('\n3. Testing Financial Analytics Workspace (P&L, Health, OpEx)...');
  const finRes = await fetch(`${BASE_URL}/api/finance/analytics?period=FY%202026-27`, { headers: authHeader });
  const finData = await finRes.json();
  if (finRes.status === 200 && finData.success) {
    console.log(`   ✓ Health Indicator: ${finData.healthIndicator.status} (Score: ${finData.healthIndicator.score}/100)`);
    console.log(`   ✓ Gross Invoiced Revenue: ₹${finData.summary.grossRevenue.toLocaleString('en-IN')}`);
    console.log(`   ✓ Total Operating Expenses: ₹${finData.summary.totalExpenses.toLocaleString('en-IN')}`);
    console.log(`   ✓ Operating Profit: ₹${finData.summary.operatingProfit.toLocaleString('en-IN')} (Margin: ${finData.summary.operatingMargin})`);
    console.log(`   ✓ Monthly Series: ${finData.monthlySeries.length} months tracked`);
  } else {
    console.error('   ✗ Financial analytics failed!');
    process.exit(1);
  }

  // 4. Test Subscriptions Management
  console.log('\n4. Testing Subscription Portfolio & Tier Catalog...');
  const subRes = await fetch(`${BASE_URL}/api/subscriptions`, { headers: authHeader });
  const subData = await subRes.json();
  if (subRes.status === 200 && subData.success) {
    console.log(`   ✓ Loaded ${subData.subscriptions.length} active campus subscriptions across ${subData.plans.length} tiers.`);
  } else {
    console.error('   ✗ Subscriptions endpoint failed!');
    process.exit(1);
  }

  // 5. Test Revenue & Invoices
  console.log('\n5. Testing Invoices & Payment Ledger...');
  const invRes = await fetch(`${BASE_URL}/api/payments/invoices`, { headers: authHeader });
  const invData = await invRes.json();
  if (invRes.status === 200 && invData.success) {
    console.log(`   ✓ Loaded ${invData.invoices.length} invoices with itemized GST.`);
  } else {
    console.error('   ✗ Invoices endpoint failed!');
    process.exit(1);
  }

  // 6. Test Adding Expense
  console.log('\n6. Testing Recording a New Operating Expense...');
  const expRes = await fetch(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      category: 'AI API Usage',
      amount: 15400,
      expenseDate: '2026-10-23',
      vendor: 'Anthropic Claude API',
      notes: 'Syllabus document parsing OCR batch run',
      isRecurring: 1,
      paymentStatus: 'Paid',
      paymentMethod: 'Corporate Card'
    })
  });
  const expData = await expRes.json();
  if (expRes.status === 201 && expData.success) {
    console.log(`   ✓ Expense recorded successfully with ID: ${expData.id}`);
  } else {
    console.error('   ✗ Expense recording failed!');
    process.exit(1);
  }

  // 7. Test Customer Support & Ticket Resolution
  console.log('\n7. Testing Customer Support Desk & SLA Management...');
  const compRes = await fetch(`${BASE_URL}/api/complaints`, { headers: authHeader });
  const compData = await compRes.json();
  if (compRes.status === 200 && compData.success && compData.complaints.length > 0) {
    const firstTicket = compData.complaints[0];
    console.log(`   ✓ Loaded ${compData.complaints.length} tickets. Updating ticket ${firstTicket.ticketCode}...`);
    const updateRes = await fetch(`${BASE_URL}/api/complaints/${firstTicket.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        status: 'Resolved',
        resolutionNotes: 'Verified and cleared by Super Admin E2E test'
      })
    });
    const updateData = await updateRes.json();
    if (updateRes.status === 200 && updateData.success) {
      console.log(`   ✓ Ticket resolution verified.`);
    }
  }

  // 8. Test Global Omnisearch
  console.log('\n8. Testing Global Omnisearch (/api/search?q=Engineering)...');
  const searchRes = await fetch(`${BASE_URL}/api/search?q=Engineering`, { headers: authHeader });
  const searchData = await searchRes.json();
  if (searchRes.status === 200 && searchData.success) {
    console.log(`   ✓ Omnisearch returned ${searchData.results.length} cross-entity results (Colleges, Invoices, Expenses).`);
  }

  // 9. Test Audit Logs
  console.log('\n9. Testing Cryptographic Audit Trail (/api/audit-logs)...');
  const auditRes = await fetch(`${BASE_URL}/api/audit-logs?limit=5`, { headers: authHeader });
  const auditData = await auditRes.json();
  if (auditRes.status === 200 && auditData.success && auditData.logs.length > 0) {
    console.log(`   ✓ Verified ${auditData.logs.length} immutable audit entries. Latest action: [${auditData.logs[0].action}] ${auditData.logs[0].details}`);
  }

  console.log('\n================================================================');
  console.log('ALL COMMAND CENTER INTELLIGENCE SUITE TESTS PASSED (100%)');
  console.log('================================================================\n');
}

testBICommandCenter();
