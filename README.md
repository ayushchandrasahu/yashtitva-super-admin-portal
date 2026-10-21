# Yashtitva Super Admin Portal

A clean, professional, secure, and fully functional **Super Admin portal for Yashtitva**, a college achievement and participation SaaS platform.

![Yashtitva Logo](public/yashtitva-logo.png)

## Overview & Architecture

Yashtitva Super Admin Portal provides a streamlined, secure management interface for college verification, licensing, and payment tracking.

- **Frontend**: React 19, Vite, Vanilla CSS design system tailored to the Yashtitva brand palette.
- **Backend**: Node.js & Express 5 API with JWT session management, rate limiting, and brute-force prevention.
- **Database**: SQLite with foreign-key constraints and WAL mode (`better-sqlite3`).
- **File Management**: Secure PDF upload handling with validation and restricted storage.

## Brand Colour Palette

| Element | Colour | Code |
| :--- | :--- | :--- |
| **Main Background** | Warm Ivory | `#FDFCF8` |
| **Cards & Surfaces** | Pure White | `#FFFFFF` |
| **Secondary Surfaces** | Soft Beige | `#F3D9BA` |
| **Accents & Highlights** | Golden Tan | `#E4B886` |
| **Headings & Primary Text** | Deep Espresso | `#2A1A14` |
| **Secondary Text** | Muted Brown | `#66564E` |

## Core Pages

1. **Page One — Secure Super Admin Login (`/login`)**:
   - Single centered login box with password visibility toggle.
   - Server-side authentication, rate limiting, and session security.
   - Default credentials: `admin` / `Admin@Yashtitva2026!`

2. **Page Two — Super Admin Home (`/super-admin`)**:
   - Exactly two clean sections:
     - **Section A**: *New College Registration*
     - **Section B**: *Registered Colleges*

3. **Page Three — New College Registration Form (`/super-admin/colleges/register`)**:
   - Sequential fields: Name of College, Institutional Category, Name of Affiliated University (conditional), College Code, Unique ID, Government Approval Document (PDF only).
   - Application status: `Pending Verification` (licences are not issued automatically).

4. **Page Four — Registered Colleges (`/super-admin/colleges`)**:
   - Dynamic cascading State and District filters (comprehensive India dataset).
   - College Type filtering, search, and pagination.
   - College detail view modal with approval document link.
   - **Separate Outstanding Licence Dues Box**: Tracks unpaid and overdue licence fees calculated from actual database records.

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
# Start backend API (Port 5000)
npm run server

# Start frontend development server (Port 3000)
npm run dev
```

### Build
```bash
npm run build
```
