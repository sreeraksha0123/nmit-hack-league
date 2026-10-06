# NMIT Hack League (V1)
> **Official Hackathon Management & Participation Platform**  
> **Nitte Meenakshi Institute of Technology (NMIT), Bengaluru**

[![NMIT](https://img.shields.io/badge/Institution-NMIT_Bengaluru-blue.svg)](https://nmit.ac.in)
[![Branch](https://img.shields.io/badge/Branch-v1-emerald.svg)](https://github.com/sreeraksha0123/nmit-hack-league/tree/v1)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-V1_Production_Ready-blue.svg)](#)

---

## 1. Problem Statement

Historically, hackathon and competition opportunities for engineering students at **Nitte Meenakshi Institute of Technology (NMIT)** have been circulated informally across WhatsApp groups, email chains, and social channels. This created severe operational problems:

- **Fragmented Circulation:** Students missed registration deadlines or received opportunities not suited to their academic branch.
- **Zero Eligibility Filtering:** Competitions restricted to specific departments (e.g. ISE/CSE) or graduation batches were circulated indiscriminately.
- **Lost Participation Records:** No central database recorded which students registered, participated, or reached advanced rounds.
- **Unrecognized Student Outcomes:** Finalists and winners lacked official club recognition and verified portfolios.
- **No Feedback Loop:** No structured mechanism existed to collect student reviews and assess event quality.

---

## 2. Solution: NMIT Hack League Platform

**NMIT Hack League V1** solves these challenges by providing an institutional web platform with:

1. **Centralized Hackathon Publishing:** Coordinators publish verified competitions with detailed problem statements, timelines, and prize pools.
2. **Automated Data-Driven Eligibility Engine:** The backend dynamically validates students against branch, graduation batch, and gender criteria.
3. **Intent-Tracking Registration Flow:** When a student clicks *“Participate with Hack League”*, the platform logs their intent in PostgreSQL and immediately redirects them to the organizer's official external registration portal.
4. **End-to-End Participation Tracking:** Coordinators can update participant outcomes (`REGISTERED` $\rightarrow$ `ROUND_1` $\rightarrow$ `FINALIST` $\rightarrow$ `WINNER`) with feedback notes.
5. **Student Hackathon Portfolio:** Students maintain an immutable timeline of their hackathons, round progressions, and achievements.
6. **Student Feedback System:** Verified participants submit 5-star ratings and reflections, feeding into coordinator analytics.

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NMIT HACK LEAGUE (V1)                           │
└────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────┐              ┌──────────────────────┐
     │   Student Browser    │              │    Admin Browser     │
     └──────────┬───────────┘              └──────────┬───────────┘
                │                                     │
                │  Devfolio-Style UI/UX               │  Coordinator Console
                ▼                                     ▼
     ┌────────────────────────────────────────────────────────────┐
     │           Frontend (React 18 + TypeScript + Tailwind)      │
     │   • Dark Slate Tech Palette         • Eligibility Badges   │
     │   • Role-Guarded Student Routes     • Admin Management UI  │
     │   • Intent-Tracking Redirect Modal  • Status Progression   │
     └─────────────────────────────┬──────────────────────────────┘
                                   │ REST API (JSON / JWT)
                                   ▼
     ┌────────────────────────────────────────────────────────────┐
     │         Backend API (Node.js + Express + TypeScript)       │
     │   • RBAC Middleware (Student vs Admin)                     │
     │   • Strict College Email Validation (@nmit.ac.in)          │
     │   • Data-Driven Eligibility Engine                         │
     │   • Transactional Intent-Tracking Handler                  │
     │   • Admin Auto-Seeder on Boot                              │
     └─────────────────────────────┬──────────────────────────────┘
                                   │ Prisma ORM
                                   ▼
     ┌────────────────────────────────────────────────────────────┐
     │                      PostgreSQL Database                   │
     │   • users (USN & Email UNIQUE, Role enum)                  │
     │   • hackathons (Event metadata, category, deadlines)       │
     │   • hackathon_eligibility (Department, Batch, Gender)      │
     │   • registrations (student_id + hackathon_id UNIQUE)       │
     │   • feedback (student_id + hackathon_id UNIQUE)            │
     └────────────────────────────────────────────────────────────┘
```

---

## 4. Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite, React Router v6, Axios
- **Design System:** Devfolio-inspired dark technology aesthetic (`#0a0d14` slate background, high-contrast typography, category badges, countdown pills, sticky details sidebar)
- **Backend:** Node.js, Express, TypeScript, Zod Validation, JSON Web Tokens (JWT), bcryptjs
- **Database:** PostgreSQL (Source of Truth), Prisma ORM
- **Security:** Strict RBAC, HTTP token authorization, server-side domain verification (`@nmit.ac.in`), tamper-proof role assignment

---

## 5. Key Features

### Student Features
- **Strict Verification:** Signup restricted strictly to verified `@nmit.ac.in` email addresses and unique college USN.
- **Flexible Login:** Log in using either College Email or USN + Password (case-normalized).
- **Personalized Dashboard:** Live metrics, active eligible competitions, category filters.
- **Devfolio-Style Details:** Countdown to registration deadline, prize pool, team size, eligibility checklist.
- **Participation Intent Flow:** Atomic database logging before redirection to the organizer portal.
- **My Hackathons:** Status progression tracking (`REGISTERED` $\rightarrow$ `PARTICIPATED` $\rightarrow$ `ROUND_1` $\rightarrow$ `ROUND_2` $\rightarrow$ `FINALIST` $\rightarrow$ `WINNER`).
- **Post-Hackathon Feedback:** Qualitative reflections and 1–5 star ratings (duplicate protected).
- **Profile Management:** View institutional profile with locked USN & email.

### Coordinator / Admin Features
- **Zero Public Admin Signup:** Exactly ONE administrator provisioned via environment variables (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- **Overview Dashboard:** Total Students, Hackathons, Registrations, Active Participants, recent activity stream.
- **Hackathon Publishing:** Form with custom eligibility matrix builder (Departments multi-select, Batches multi-select, Gender criteria).
- **Soft-Archiving:** Archive hackathons (`status: ARCHIVED`) while preserving historical student records.
- **Participant Tracking:** Paginated table per hackathon to update student status, round, and official coordinator feedback notes.
- **Student Directory:** Paginated list of registered students with search by USN/Name/Email, branch filter, and batch filter.
- **Feedback Inspector:** Review student reflections, ratings, and testimonials.

---

## 6. Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend API Server Port | `5000` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://postgres:postgrespassword@localhost:5432/nmit_hack_league?schema=public` |
| `COLLEGE_EMAIL_DOMAIN` | Mandatory College Email Domain | `nmit.ac.in` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_jwt_key_replace_in_production` |
| `JWT_EXPIRES_IN` | Token expiration period | `7d` |
| `ADMIN_NAME` | Administrator display name | `NMIT Hack League Admin` |
| `ADMIN_EMAIL` | Administrator login email | `admin@nmit.ac.in` |
| `ADMIN_PASSWORD` | Administrator initial password | `AdminHackLeague@2026` |
| `FRONTEND_URL` | Frontend client origin for CORS | `http://localhost:5173` |

---

## 7. Local Development Setup

### Prerequisites
- **Node.js:** v18 or higher (tested on v24)
- **npm:** v9 or higher
- **PostgreSQL:** Local service, Docker (`docker-compose up -d`), or cloud PostgreSQL (Neon, Supabase)

### Step 1: Clone Repository & Switch to `v1` Branch
```bash
git clone https://github.com/sreeraksha0123/nmit-hack-league.git
cd nmit-hack-league
git checkout v1
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 3: Database Migration & Seeding
If using Docker for PostgreSQL:
```bash
docker-compose up -d
```

Run Prisma schema sync and demo seed:
```bash
cd backend
npm run prisma:push
npm run prisma:seed
```

### Step 4: Start Development Servers
In terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Server boots on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd frontend
npm run dev
# Client boots on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 8. Demo Credentials (Development Only)

> [!NOTE]
> These credentials are seeded automatically by `npm run prisma:seed`.

### Administrator Account
- **Portal URL:** `http://localhost:5173/admin/login`
- **Email:** `admin@nmit.ac.in`
- **Password:** `AdminHackLeague@2026`

### Sample Student Accounts
- **Portal URL:** `http://localhost:5173/login`
- **Password for all demo students:** `Password123!`

| Student Name | USN | College Email | Department | Batch | Status in Demo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sree Raksha S P** | `1NT23IS089` | `sreeraksha@nmit.ac.in` | ISE | 2027 | KPIT K-IMPACT 2.0 (Finalist) |
| **Aarav Sharma** | `1NT23IS001` | `aarav.ise@nmit.ac.in` | ISE | 2027 | SIH (Registered), HCLTech (Winner) |
| **Kavya Raman** | `1NT22CS045` | `kavya.cs@nmit.ac.in` | CSE | 2026 | Ada Lovelace Hackathon (Round 1) |
| **Rohan Deshmukh** | `1NT24AI012` | `rohan.ai@nmit.ac.in` | AIML | 2028 | 2nd Year Explorer |
| **Vikramaditya Verma** | `1NT22ME019` | `vikram.me@nmit.ac.in` | ME | 2026 | Core Engineering Student |

---

## 9. Verification & Automated Test Suite

A complete integration test suite verifies all 20 critical flows including RBAC, college email domain verification, eligibility gatekeeping, duplicate prevention, and status progressions.

```bash
cd backend
npm test
```

Expected output:
```
  ✓ API Health Check is functional
  ✓ Rejects student signup with non-NMIT email (@gmail.com)
  ✓ Creates student account with @nmit.ac.in and enforces STUDENT role
  ✓ Rejects duplicate USN registration
  ✓ Student can log in using USN
  ✓ Student can log in using College Email
  ✓ Admin authenticates via dedicated endpoint
  ✓ Student is rejected with 403 when accessing Admin API
  ✓ Admin creates hackathon with department & batch eligibility rules
  ✓ Evaluates student eligibility for the created hackathon
  ✓ Student registers intent and receives external URL payload
  ✓ Subsequent registration attempt returns existing registration without creating duplicate
  ✓ Ineligible student is rejected from registering with 403 Forbidden
  ✓ Admin retrieves hackathon registrations and updates status to FINALIST
  ✓ Student sees updated FINALIST status in My Hackathons
  ✓ Student submits post-hackathon feedback
  ✓ Rejects duplicate feedback submission for the same student + hackathon
  ✓ Admin reviews feedback in administrative logs
  ✓ Admin statistics reflects total counts and recent activity
  ✓ Admin student directory returns paginated records without exposing passwords

  TEST RESULTS: 20 PASSED, 0 FAILED
```

---

## 10. Scope Breakdown

### Implemented in V1
- [x] Dual-role RBAC: Student and single secure Administrator
- [x] Strict `@nmit.ac.in` college email domain enforcement with whitespace & casing normalization
- [x] Dual-identifier student login (College Email or USN)
- [x] Relational eligibility engine (Department, Batch, Gender)
- [x] Intent-recording registration flow with countdown redirect modal
- [x] Duplicate registration prevention (`@@unique([studentId, hackathonId])`)
- [x] Duplicate feedback prevention (`@@unique([studentId, hackathonId])`)
- [x] Status progression tracking (`REGISTERED` through `WINNER`)
- [x] Coordinator notes and feedback comments
- [x] Soft-archiving of hackathons without loss of historical records
- [x] Devfolio-inspired UI/UX design with official NMIT logo integration
- [x] Fully responsive layout across Desktop, Tablet, and Mobile
- [x] Comprehensive 20-case automated test suite

### Intentionally Deferred to V2 (Out of V1 Scope)
- Advanced gamification, points, and badges
- Public student leaderboards
- AI-based hackathon recommendations
- WhatsApp / Email notifications integration
- Automatic team matchmaking
- Social post feeds
- Multi-admin role tiers

---

## 11. Production Deployment Guide

### Database (PostgreSQL)
1. Deploy a managed PostgreSQL instance (e.g. AWS RDS, Neon, Supabase, Railway).
2. Set `DATABASE_URL` in your server environment variables.
3. Run `npx prisma migrate deploy` to execute all DDL migrations.

### Backend (Node.js API)
1. Build the TypeScript source: `npm run build`.
2. Start the production server: `NODE_ENV=production npm start`.

### Frontend (SPA / Static Web)
1. Set `VITE_API_BASE_URL` to your backend production URL.
2. Build static production assets: `npm run build`.
3. Deploy `dist/` to any static hosting provider (Vercel, Netlify, Cloudflare Pages, NGINX).

---

## 12. Institutional Credits
Designed & Developed for **NMIT Hack League**, the official hackathon club of **Nitte Meenakshi Institute of Technology**, Yelahanka, Bengaluru - 560064.
