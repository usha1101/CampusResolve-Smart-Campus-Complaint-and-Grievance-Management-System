# 🎓 CampusResolve: Smart Campus Complaint & Grievance Management System

> Built for the 24-Hour Hackathon Practice.  
> An AI-augmented full-stack grievance redressal platform with strict role-based access control, automated state transitions, and Google Gemini AI triage.

---

## ⚡ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v6, Axios
* **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic
* **Database & Storage:** PostgreSQL / SQLite (Local & Test), Supabase Storage
* **AI Engine:** Google Gemini 1.5 Flash (Defensive fallback design)
* **Authentication:** JWT Bearer tokens with bcrypt password hashing & backend RBAC

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend

# 1. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

# 2. Run Database Migrations
alembic upgrade head

# 3. Seed Demo Accounts & Sample Grievances
python -m app.seed

# 4. Start Backend Server
uvicorn app.main:app --reload --port 8000
```

* **API Base URL:** `http://localhost:8000/api/v1`
* **Interactive Swagger UI:** `http://localhost:8000/docs`
* **Health Check:** `http://localhost:8000/health`

### 2. Frontend Setup

```bash
cd frontend

# 1. Install dependencies (if not already installed)
npm install

# 2. Start Vite Dev Server
npm run dev
```

* **Frontend App:** `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login Ready)

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin@campus.edu` | `AdminPass123!` | Executive SLA Analytics, cross-campus registry, department assignment, rejection authority |
| **IT Staff** | `it.staff@campus.edu` | `StaffPass123!` | View assigned IT queue, investigate, mark in-progress & resolved with resolution notes |
| **Maintenance Staff** | `maint.staff@campus.edu` | `StaffPass123!` | Facilities & maintenance queue, investigation, resolution logging |
| **Student** | `student@campus.edu` | `StudentPass123!` | File grievances, track audit timeline, submit 1–5 star resolution feedback |
| **Student 2** | `student2@campus.edu` | `StudentPass123!` | File tickets, track updates |

---

## 🔄 Complaint Status State Machine

```
              ┌───────────────┐
              │   SUBMITTED   │ ◄── Student files ticket (AI triage runs)
              └───────┬───────┘
                      │
         ┌────────────┴────────────┐
         │ (Admin assigns dept)    │ (Admin rejects with reason)
         ▼                         ▼
  ┌─────────────┐           ┌─────────────┐
  │ IN PROGRESS │           │  REJECTED   │ [Terminal State]
  └──────┬──────┘           └─────────────┘
         │
         │ (Staff fixes & provides resolution notes)
         ▼
  ┌─────────────┐
  │  RESOLVED   │ [Terminal State ── Student unlocks 1-5 Star Feedback]
  └─────────────┘
```

---

## 🧪 Automated Testing Suite

CampusResolve comes with an automated Pytest test suite covering:
* User registration, password hashing, and duplicate detection
* JWT authentication and token verification
* Role-based access control (RBAC) route security
* State machine enforcement (e.g., rejecting invalid transitions or missing resolution notes)
* Defensive Gemini AI fallback behavior

```bash
cd backend
.\venv\Scripts\pytest -v
```
*(All 11 tests pass with 100% success rate)*

---

## ☁️ Deployment Strategy

* **Frontend:** Deploy `frontend/` to **Vercel** (`npm run build`, output directory: `dist`).
* **Backend:** Deploy `backend/` to **Render** as a Python Web Service (`alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
* **Database:** Hosted PostgreSQL on **Supabase** or **Neon**.
