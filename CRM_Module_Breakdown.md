# Module Breakdown & Team Allocation
## AI-Enabled CRM Application

**Document Version:** 1.0
**Related Documents:** FRD v1.0, TAD v1.0, TSD v1.0

---

## 1. Module Allocation

### Module 1 — Authentication & User Management
**Owner:** Shamsu Nisha

**Scope:**
- Registration, login, JWT issuance and refresh flow
- Role-based access control (Admin, Manager, Rep, Viewer) and route/middleware guards
- User invite/deactivate flows (Admin)
- Password reset flow
- Frontend: login/register pages, protected route wrapper, auth context/store

**Key deliverables:** `auth` backend module, `users` table + endpoints, React auth pages + `ProtectedRoute` component

**Depends on:** Nothing (build first — every other module needs auth)
**Blocks:** All other modules (they need login + role guards)

---

### Module 2 — Contacts & Lead Management
**Owner:** Agathiyan

**Scope:**
- Contact/lead CRUD, tagging, status (`new/hot/warm/cold/converted`)
- Search, filter, and CSV import
- Lead → Deal conversion action
- Frontend: contacts list/table, contact detail page, create/edit forms, import UI

**Key deliverables:** `contacts` backend module + table, `<ContactsTable />`, `<ContactDetail />`, `<ContactForm />`

**Depends on:** Module 1 (auth context, owner_id from logged-in user)
**Hands off to:** Module 3 (conversion creates a deal), Module 5 (lead scoring reads contact data)

---

### Module 3 — Deals & Pipeline Management
**Owner:** Nishaj

**Scope:**
- Deal CRUD, pipeline stages, stage-transition rules and audit trail
- Kanban board with drag-and-drop
- Deal detail page (linked contact, value, close date, history)

**Key deliverables:** `deals` backend module, `<PipelineBoard />`, `<DealDetail />`, stage-transition validation logic

**Depends on:** Module 1 (auth), Module 2 (contact must exist before a deal is linked)
**Hands off to:** Module 5 (pipeline data feeds dashboard/reports)

---

### Module 4 — Tasks, Activities & Notifications
**Owner:** Athim

**Scope:**
- Task CRUD linked to contacts/deals, due dates, priority, complete/incomplete
- Activity timeline (calls, emails, meetings, notes) per contact
- Reminder/notification dispatch (in-app, and email if time permits)

**Key deliverables:** `tasks` + `activities` backend modules, `<TaskList />`, `<ActivityTimeline />`, notification service

**Depends on:** Module 1 (auth), Module 2 (contacts must exist to attach activities/tasks)
**Can develop in parallel with:** Module 3 (no direct dependency on deals, only on contacts)

---

### Module 5 — Dashboard, Reporting & AI Integration
**Owner:** Ilavarasan

**Scope:**
- Dashboard metrics and charts (pipeline funnel, performance trends)
- Report export (CSV/PDF)
- AI features: lead scoring, activity summaries, chat assistant (tool-use pattern), next-best-action suggestions

**Key deliverables:** `reports` backend module, `ai` backend module, `<DashboardCharts />`, `<AIAssistantPanel />`

**Depends on:** Modules 2, 3, and 4 (dashboard/AI features read data from contacts, deals, and activities — this module naturally lands later in the timeline)

---

## 2. Shared / Cross-Cutting Work (not owned by a single module)

| Item | Suggested Owner | Notes |
|---|---|---|
| Design system components (Button, Modal, Input, Table shell) | Member 1 or rotated | Build early so Modules 2–5 reuse instead of duplicating |
| API response envelope & error handling middleware | Member 1 | Establish the pattern before other modules build endpoints |
| CI/CD pipeline setup | Member 1 or whoever is most backend-infra comfortable | One-time setup, early in the timeline |
| ERD / schema migrations coordination | All, reviewed together | Since modules share the DB, schema changes should be reviewed as a group to avoid conflicts |

---

## 3. Suggested Build Order (Dependency-Aware)

| Stage | Work |
|---|---|
| Stage 1 | Module 1 (Auth) + shared design system + CI/CD skeleton |
| Stage 2 | Module 2 (Contacts) and Module 4 (Tasks/Activities) in parallel — both only depend on Auth |
| Stage 3 | Module 3 (Deals) — depends on Contacts being in place |
| Stage 4 | Module 5 (Dashboard/AI) — depends on Contacts, Deals, and Activities all existing |
| Stage 5 | Integration testing, polish, deployment (all members) |

---

## 4. Coordination Notes
- Agree on the API contract (from the TSD) up front so frontend and backend work within a module — and across modules — don't drift.
- Since Module 5 depends on the other four, that member can start on dashboard UI with mock data early, then wire in real endpoints once Modules 2–4 land.
- Daily or twice-weekly sync recommended specifically around schema changes, since all modules share the same database.

