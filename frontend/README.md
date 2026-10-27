# 🎓 CampusResolve Frontend — Premium SaaS Web Application

> An Apple-inspired, production-quality frontend for the **Smart Campus Complaint & Grievance Management System**, featuring Google Gemini 1.5 Flash automated triage, role-based workflows, strict SLA auditing, and reactive micro-interactions.

---

## ⚡ Tech Stack & Architecture

* **Framework:** React 19 (`react`, `react-dom`)
* **Build Tool:** Vite 8 with fast HMR & ES modules
* **Styling & Design System:** Tailwind CSS v4, custom Apple-inspired design tokens, glassmorphism (`backdrop-blur-xl`), and bespoke CSS animations
* **Typography:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & JetBrains Mono
* **Routing:** React Router DOM v7 with client-side SPA route rewrites for Vercel
* **State & Authentication:** Custom React Context (`AuthContext`, `ToastContext`) with JWT token persistence and 401 session recovery
* **Icons:** Lucide React
* **Confetti Engine:** Zero-dependency Canvas Confetti burst generator (`src/lib/confetti.js`)
* **Code Health & Linting:** Oxlint (0 errors)

---

## 🧭 Page & Route Inventory

| Route Path | Component | Target Role / Access | Features |
|---|---|---|---|
| `/` | `LandingPage` | Public | Hero with **1-Click Live Role Demo Switcher**, Bento grid features, Gemini AI demo card, trust metrics, footer. |
| `/login` | `LoginPage` | Public | Apple-style card, password toggle, session expiration notice, 1-click test credentials for judges. |
| `/register` | `RegisterPage` | Public | Visual role selector tiles, dynamic department picker for department staff, password strength guide. |
| `/student` | `StudentDashboard` | Student & Staff | 4 Bento KPI cards, tabbed filter ("All", "In Progress", "Submitted", "Resolved"), search, empty state. |
| `/student/complaints` | `MyComplaintsPage` | Student & Staff | Personal grievance archive with multi-criteria sorting (Newest/Oldest) and status/severity filters. |
| `/student/submit` | `SubmitComplaintPage` | Student & Staff | 8-item visual category chips, 4-tier urgency selector, drag-and-drop photo dropzone with instant preview. |
| `/complaints/:id` | `ComplaintDetailsPage` | Authenticated (Object-Level Access) | Two-column command center, zoomable photo evidence with token security, glowing Gemini AI card, vertical audit timeline, admin department assignment, status state machine modal with mandatory notes, interactive 1–5 star student feedback with confetti. |
| `/admin` | `AdminDashboard` | Administrator | Executive SLA analytics, 4 Bento KPI cards, status and severity distribution progress bars, departmental turnaround performance table. |
| `/admin/complaints` | `AllComplaintsPage` | Administrator | Master cross-campus registry, search across tickets/titles/authors, multi-select filters, filter reset button. |
| `/dept` | `DeptDashboard` | Department Staff | Operational workspace, 3 KPI cards for assigned queue, status filtering, direct links to grievance actions. |

---

## 🎨 Global UI Components & Drawers

* **Floating Apple Navbar (`Navbar.jsx`):** Frosted glass sticky header, dynamic brand badge, live role badge, notification bell, profile pill with avatar, and responsive mobile menu toggle.
* **Profile Drawer (`ProfileDrawer.jsx`):** Slide-over account panel displaying authenticated user credentials, assigned department, contact info, security capabilities, and 1-click sign out.
* **Notifications Drawer (`NotificationsDrawer.jsx`):** Slide-over activity center showing recent status transitions, Gemini AI triage logs, and SLA reminders.
* **Floating Toasts (`Toast.jsx`):** Apple-style floating toast notifications with auto-dismiss (`success`, `error`, `info`) replacing intrusive static banner alerts.
* **Shimmer Skeletons (`Skeleton.jsx`):** Reusable placeholder skeletons eliminating layout shift during data retrieval.
* **Status & Priority Badges (`StatusBadge.jsx`, `PriorityBadge.jsx`):** Pill-shaped indicators with glowing micro-dots and animated flame pulses for urgent tickets.
* **Responsive Layout (`DashboardLayout.jsx`):** Desktop sticky navigation sidebar paired with a smooth slide-out drawer on tablet and mobile viewports.

---

## 🔑 1-Click Pre-Seeded Accounts for Evaluation

| Role | Email | Password | Pre-Configured Scope |
|---|---|---|---|
| **Administrator** | `admin@campus.edu` | `AdminPass123!` | Executive SLA Analytics, cross-campus registry, department assignment, rejection authority. |
| **IT Staff Lead** | `it.staff@campus.edu` | `StaffPass123!` | IT department queue, progress notes, and verified resolution logging. |
| **Student** | `student@campus.edu` | `StudentPass123!` | Grievance submission with photo evidence, Gemini AI triage tracking, and 1–5 star resolution feedback. |

---

## 🚀 Development & Build

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Production build
npm run build

# 4. Code quality & linting
npm run lint
```
