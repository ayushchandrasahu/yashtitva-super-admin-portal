# YASHTITVA — Super Admin & Business Command Center

The official centralized SaaS executive command center, financial intelligence suite, and institutional governance platform for the **YASHTITVA SaaS Ecosystem**.

![Yashtitva Logo](public/yashtitva-logo.png)

---

## 1. Ecosystem Overview

The YASHTITVA SaaS platform consists of three independent portals:
1. **Student User Portal**: Student achievement portfolio showcase, event participation records, and verifiable credentials.
2. **College Admin Portal**: College deans and event coordinators managing campus rosters and approving participation entries.
3. **Super Admin & Business Command Center** *(This Portal)*: The SaaS business owner's command center for financial health, recurring subscriptions, profit & loss, operating expenditures, support ticketing SLAs, and growth forecasting.

---

## 2. Official Brand Palette & Design System

Strictly constructed with the official Yashtitva warm-luxury academic aesthetic:

| Element | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Canvas** | Warm Ivory | `#FDFCF8` | Subtle background with light paper-grain gradient |
| **Surfaces & Cards** | Pure White | `#FFFFFF` | Dashboard metric cards, data tables, modals |
| **Secondary Surfaces**| Soft Beige | `#F3D9BA` | Sidebar, selected navigation pills, table highlights |
| **Accents & Highlights**| Golden Tan | `#E4B886` | Badges, chart accents, secondary action indicators |
| **Headings & Buttons** | Deep Espresso| `#2A1A14` | Primary typography, high-priority buttons, brand identity |
| **Supporting Text** | Muted Brown | `#66564E` | Subtitles, helper text, table column labels |
| **Positive Performance**| Forest Green| `#2B6E3F` | Profitable performance, paid invoices, up-trends |
| **Critical Alerts** | Deep Burgundy| `#A32929` | Losses, critical tickets, overdue balances |
| **Warnings** | Warm Amber | `#945B0A` | Pending verifications, approaching SLA limits |

---

## 3. The 12 Command Center Sections

1. **Business Overview (`/super-admin`)**: Executive dashboard featuring 12 master KPIs, previous period comparisons, trend indicators, live operational alerts, and IST reporting filters.
2. **Financial Analytics (`/super-admin/financial-analytics`)**: Dual-basis P&L ledger, gross vs. net revenue, 10-month historical revenue vs. expenses bar chart, profit margin trend, and Business Health Indicator badge.
3. **Colleges & Customers (`/super-admin/colleges`)**: Comprehensive institutional directory, AICTE/UGC legal approval document viewer, verification workflow (Approve/Reject), and Outstanding Licence Dues tracker.
4. **Subscription Management (`/super-admin/subscriptions`)**: Tier catalog (Standard, Pro, Enterprise), active campus contract portfolio, student seat counts, renewal dates, and churn metrics.
5. **Revenue & Payments (`/super-admin/revenue-payments`)**: Invoice ledger, payment collection logs, 18% statutory GST calculation (CGST 9% + SGST 9%), printable invoice preview, and offline payment recording.
6. **Expenses & Profitability (`/super-admin/expenses-profitability`)**: Itemized operating expenditure log (AWS hosting, AI tokens, developer payroll, software tools), recurring status tags, and "+ Add Expense" modal.
7. **Complaints & Support (`/super-admin/complaints-support`)**: Ticket queue from colleges and students, priority tags (Critical, High, Medium, Low), countdown SLA timers, and interactive ticket resolution modal.
8. **Growth & Forecasting (`/super-admin/growth-forecasting`)**: 12-month forward ARR/MRR forecast scenarios (Conservative, Expected Baseline, Aggressive Scale) and SaaS Unit Economics (CAC, LTV, LTV:CAC 27.4x, Payback Period 1.4 months).
9. **Platform Analytics (`/super-admin/platform-analytics`)**: Cross-portal telemetry, 99.98% live service uptime monitor, average API latency (42ms), active student sessions, and cloud storage consumption.
10. **Reports & Exports (`/super-admin/reports-exports`)**: One-click export generator for audited P&L Statements (CSV/JSON), Statutory GST 18% Ledgers, and Master College Directories.
11. **Team & Access Control (`/super-admin/team-access`)**: Platform administrator directory, role permissions matrix (Platform Owner, Financial Auditor, Operations Lead, Support Specialist), and secure access invite workflow.
12. **Settings & Audit Logs (`/super-admin/settings-audit`)**: Immutable append-only audit trail with instant keyword search, 2FA/MFA enforcement toggle, and session inactivity timeout controls.

---

## 4. Key Performance Indicators (KPIs)

The Business Overview dashboard computes 12 master KPIs directly from SQLite database records:
- **Total Registered Colleges**
- **Active Paying Colleges**
- **Colleges on Free Trials**
- **Active Subscriptions**
- **Monthly Recurring Revenue (MRR)**
- **Annual Recurring Revenue (ARR)**
- **Total Payments Collected** (Realized Bank Cash)
- **Outstanding Invoices** (Receivables)
- **Monthly Operating Expenses**
- **Monthly Operating Profit / Loss**
- **Unresolved Complaints**
- **Subscription Renewal Rate** (94.2%)

---

## 5. Security & Authentication Architecture

- **Role Gate**: Strictly reserved for `SUPER_ADMIN` platform owners. Ordinary college admin or student credentials from portals 1 & 2 are strictly blocked at the API gateway layer.
- **Two-Factor Authentication (2FA)**: Mandatory TOTP verification step on login.
- **Brute Force Lockout**: Failed login rate-limiting (5 attempts triggers a 15-minute lockout).
- **Session Security**: Signed JWT bearer tokens with configurable expiration (default 8–12 hours).
- **Audit Logging**: Every login, approval, expense entry, and payment recorded with admin ID, timestamp, and IP address.

---

## 6. Getting Started

### Installation
```bash
npm install
```

### Running Locally
```bash
# 1. Start backend server (Port 5000)
npm run server

# 2. In a separate terminal, start Vite frontend development server (Port 3000)
npm run dev
```

### Building for Production
```bash
npm run build
```

### Running Automated Test Suites
```bash
# Core College Registration & Outstanding Dues regression suite
node test_portal_e2e.js

# Comprehensive Business Command Center & Intelligence suite
node test_bi_command_center.js
```

### Super Admin Credentials
- **User ID**: `admin`
- **Password**: `Admin@Yashtitva2026!`
- **Demo 2FA Code**: `123456`
