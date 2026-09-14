# AI-Enabled CRM App

A full-stack CRM foundation with a **FastAPI + PostgreSQL** backend and a **React (Vite) + React Router** frontend. The current codebase implements a complete, production-style **authentication, authorization, and user-management system** (register, login, JWT refresh, logout, password reset, role-based access control, and admin user invites/deactivation). The CRM domain screens (Contacts, Deals/Pipeline) are scaffolded in the UI as navigation targets but are **not yet implemented** — see [Roadmap](#roadmap--not-yet-implemented).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Default Admin Account](#default-admin-account)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Security Notes & Known Limitations](#security-notes--known-limitations)
- [Roadmap / Not Yet Implemented](#roadmap--not-yet-implemented)
- [License](#license)

---

## Tech Stack

**Backend**
| Component | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn (standard) |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 (Mapped / mapped_column style) |
| Auth | JWT via `python-jose` (access + refresh tokens) |
| Password hashing | `passlib` (bcrypt) |
| Rate limiting | `slowapi` |
| Config | `python-dotenv` |
| Validation | Pydantic v2 (`EmailStr`, custom validators) |

**Frontend**
| Component | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router v7 |
| HTTP client | Axios |
| Forms | React Hook Form |
| Linting | ESLint 10 |

---

## Features

### Authentication
- User registration with strong password rules (min 8 chars, upper + lower + digit + special character), enforced via Pydantic validators on both `RegisterRequest` and `PasswordResetConfirmRequest`.
- Login with email + password, returning a short-lived **access token** (JWT, default 15 min) and a longer-lived **refresh token** (JWT, default 7 days) which is also persisted server-side in a `refresh_tokens` table.
- Rate limiting on `/auth/login` (5 requests/minute per IP) via `slowapi`.
- Token refresh flow (`/auth/refresh`) that validates the stored refresh token, checks revocation/expiry, rotates it (revokes the old one, issues a new one), and returns a new token pair.
- Logout (`/auth/logout`) revokes the stored refresh token.
- `GET /api/v1/auth/me` returns the currently authenticated user's profile from the access token.

### Password Reset
- `/auth/password-reset/request` generates a single-use, time-limited (30 min) reset token and stores it in a `password_reset_tokens` table.
- Does **not** reveal whether an email exists (returns the same generic message either way).
- In the current build the reset token is **printed to the backend console** and also returned in the API response (`resetToken`) — this is explicitly marked in the code as development/testing behavior, not a production email flow (see [Security Notes](#security-notes--known-limitations)).
- `/auth/password-reset/confirm` validates the token (not used, not expired) and updates the user's password hash.

### Role-Based Access Control (RBAC)
- Four roles: `admin`, `manager`, `rep`, `viewer` (stored as a Postgres `ENUM` on the `users` table).
- New self-registrations always get the `rep` role.
- A `require_roles(*roles)` FastAPI dependency guards admin-only endpoints (e.g., user list, invite, deactivate) and returns `403 FORBIDDEN` for disallowed roles.
- Frontend mirrors this with a `<ProtectedRoute allowedRoles={[...]} />` wrapper that redirects unauthenticated users to `/login` and unauthorized users back to `/dashboard`.

### User Management (Admin only)
- `GET /users` — list all users (id, name, email, role, active status), newest first.
- `POST /users/invite` — admin creates a new user directly with a **temporary password** (currently hardcoded as `Temp@123` in `auth_service.invite_user`, returned in the API response — flagged for hardening).
- `PATCH /users/{user_id}/deactivate` — soft-deactivates a user (`is_active = false`); deactivated users can no longer log in or use existing tokens.

### Consistent API Response Envelope
Every endpoint returns the same shape, making frontend error handling uniform:
```json
{
  "data": { /* payload or null */ },
  "meta": { /* pagination/extra info or {} */ },
  "error": { "code": "SOME_CODE", "message": "Human readable message" } // or null
}
```
Global exception handlers cover `HTTPException`, request validation errors, rate-limit errors, and any uncaught `Exception` (mapped to `500 INTERNAL_ERROR`).

### Frontend Pages
`Login`, `Register`, `ForgotPassword`, `ResetPassword`, `Dashboard`, `Users` (admin), plus a reusable `Button` component and an `InviteUserModal` for the admin user-management screen.

---

## Project Structure

```
AI-CRM-App-updated/
├── .env                          # Environment variables (DB, JWT) — see below
├── backend/
│   ├── requirements.txt
│   ├── create_admin.py           # One-off script to seed an admin user
│   └── app/
│       ├── main.py               # FastAPI app, middleware, error handlers, routers
│       ├── api/
│       │   ├── dependencies.py   # get_current_user, require_roles
│       │   └── v1/
│       │       ├── auth.py       # /auth/* routes
│       │       └── users.py      # /users/* routes (admin only)
│       ├── core/
│       │   ├── config.py         # Settings loaded from .env
│       │   ├── jwt.py            # Access/refresh token creation & decoding
│       │   ├── security.py       # bcrypt password hashing
│       │   └── rate_limit.py     # slowapi limiter instance
│       ├── db/
│       │   └── database.py       # SQLAlchemy engine/session/Base
│       ├── models/
│       │   ├── user.py
│       │   ├── refresh_token.py
│       │   └── password_reset_token.py
│       ├── schemas/
│       │   └── auth.py           # Pydantic request/response models
│       └── services/
│           └── auth_service.py   # Business logic for auth & invites
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.jsx               # App entry, wraps App in AuthProvider + BrowserRouter
        ├── App.jsx                # Route definitions
        ├── api/client.js          # Axios instance with auth interceptor
        ├── features/auth/
        │   ├── AuthContext.jsx    # Global auth state (user, tokens, login/logout/refresh)
        │   ├── authApi.js         # Auth API calls
        │   └── usersApi.js        # User management API calls
        ├── routes/ProtectedRoute.jsx
        ├── components/
        │   ├── Button.jsx
        │   └── InviteUserModal.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── ForgotPassword.jsx
            ├── ResetPassword.jsx
            ├── Dashboard.jsx      # Includes placeholder nav to /contacts, /deals (not yet built)
            └── Users.jsx          # Admin: list, invite, deactivate users
```

---

## Prerequisites

- **Python** 3.12+ (the committed `__pycache__` files are compiled for 3.12)
- **PostgreSQL** 13+ running locally or accessible remotely
- **Node.js** 18+ and npm (for Vite 8 / React 19)
- `pip`, `venv` (or your preferred Python environment manager)

---

## Backend Setup

1. **Create and activate a virtual environment**
   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   > Note: `requirements.txt` does not pin `slowapi`, even though `app/core/rate_limit.py` and `app/main.py` import it. Install it explicitly if you hit an `ImportError`:
   > ```bash
   > pip install slowapi
   > ```

3. **Create the PostgreSQL database**
   ```sql
   CREATE DATABASE ai_crm;
   ```

4. **Configure environment variables** — create/update the `.env` file at the project root (see [Environment Variables](#environment-variables)). **Rotate the database password and JWT secret before doing anything beyond local testing** — the checked-in `.env` contains a real-looking DB password and a placeholder JWT secret (`change-this-to-a-random-secret-key`).

5. **Run the API** (tables are auto-created on startup via `Base.metadata.create_all`)
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

6. **(Optional) Seed an admin user**
   ```bash
   python create_admin.py
   ```
   Creates `admin@crm.com` / `Admin@123` if it doesn't already exist. **Change this password immediately after first login.**

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Dev server runs at `http://localhost:5173` (this exact origin is hardcoded into the backend's CORS allow-list in `app/main.py`).
- The Axios client (`src/api/client.js`) is hardcoded to call the backend at `http://localhost:8000/api/v1`. Update this if you deploy the backend elsewhere.
- Available scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

---

## Environment Variables

Defined in the root `.env` and loaded via `python-dotenv` in `app/core/config.py`:

| Variable | Description | Default (in code) |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/ai_crm` | *(empty)* |
| `JWT_SECRET_KEY` | Secret used to sign/verify JWTs | `development-secret-key` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` |

⚠️ **Rotate your credentials.** The uploaded `.env` contains a real-looking, URL-encoded PostgreSQL password. Treat that database and any account sharing the password as compromised, change the password, and keep `.env` out of version control and out of anything you share (it's already listed in `backend/.gitignore`, so make sure it never gets force-added or zipped up again).

---

## Default Admin Account

Created only if you run `create_admin.py`:

| Field | Value |
|---|---|
| Email | `admin@crm.com` |
| Password | `Admin@123` |
| Role | `admin` |

Change this password immediately in any non-local environment.

---

## API Reference

Base path: `/api/v1`

### Auth (`/auth`)

| Method | Endpoint | Auth required | Rate limited | Description |
|---|---|---|---|---|
| POST | `/auth/register` | No | No | Create a new user (always role `rep`) |
| POST | `/auth/login` | No | Yes (5/min) | Log in, returns access + refresh tokens |
| POST | `/auth/refresh` | No (valid refresh token in body) | No | Rotate refresh token, issue new access token |
| POST | `/auth/logout` | No (valid refresh token in body) | No | Revoke a refresh token |
| POST | `/auth/password-reset/request` | No | No | Generate a password reset token |
| POST | `/auth/password-reset/confirm` | No (valid reset token in body) | No | Set a new password |
| GET | `/auth/me` | Yes (Bearer access token) | No | Get current user's profile |

### Users (`/users`) — all require an `admin` role

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| POST | `/users/invite` | Create a user with a temporary password |
| PATCH | `/users/{user_id}/deactivate` | Deactivate a user account |

### Misc

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check — `{"message": "AI-Enabled CRM API is running"}` |
| GET | `/api/v1/admin-test` | Sample admin-only route for testing RBAC |

All endpoints (except `/` and `/docs`) return the standard `{data, meta, error}` envelope described above.

---

## Roles & Permissions

| Role | Can log in | Can view own profile | Can view CRM data (future) | Admin panel (`/users`) |
|---|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ | ✅ Full access |
| `manager` | ✅ | ✅ | ✅ (planned) | ❌ |
| `rep` (default on self-register) | ✅ | ✅ | ✅ (planned, own records) | ❌ |
| `viewer` | ✅ | ✅ | ✅ read-only (planned) | ❌ |

Only `admin` is currently enforced in code (via `require_roles("admin")`); `manager`/`rep`/`viewer` distinctions beyond default assignment are not yet enforced anywhere, since the CRM data endpoints don't exist yet.

---

## Security Notes & Known Limitations

These are things to address before any production or public deployment:

1. **Secrets in `.env` were committed/shared.** Rotate the database password and generate a strong random `JWT_SECRET_KEY` (the current value is a placeholder string).
2. **Password reset tokens are logged to the console and returned in the API response.** This is explicitly marked "development/testing only" in the code. In production, send the token via email instead and remove it from both the console output and the JSON response.
3. **Invited users get a hardcoded temporary password (`Temp@123`)** returned directly in the API response. This should be replaced with a random per-invite password and delivered out-of-band (email), not returned in the response body.
4. **Tokens are stored in `localStorage`** on the frontend (`AuthContext.jsx`, `api/client.js`), which is vulnerable to XSS-based token theft. Consider httpOnly cookies for production.
5. **CORS and API base URL are hardcoded** to `http://localhost:5173` (backend) and `http://localhost:8000/api/v1` (frontend) — parameterize these via environment variables before deploying.
6. **Rate limiting only covers `/auth/login`.** Registration, password-reset-request, and invite endpoints have no throttling, which could allow abuse (e.g., mass account creation or reset-token spam).
7. **`slowapi` is used but not listed in `requirements.txt`** — add it explicitly to avoid environment drift.
8. Refresh tokens are stored in plaintext in the `refresh_tokens` table; consider hashing them at rest, similar to password storage.

---

## Roadmap / Not Yet Implemented

The `Dashboard.jsx` UI already includes navigation and summary cards referencing CRM concepts (`/contacts`, `/deals`, "Contacts and leads", "Current pipeline", "Closed deals", "Deals by pipeline stage"), but:

- There are **no routes** for `/contacts` or `/deals` registered in `App.jsx`.
- There are **no backend models, schemas, or endpoints** for contacts, deals, leads, or pipeline stages.
- There is **no AI/LLM integration** currently wired into the backend or frontend (no calls to any AI provider) despite the project's name — this is expected to be a later milestone (e.g., lead scoring, email drafting, deal summarization).

Suggested next milestones:
1. Contacts CRUD (backend model + API + frontend pages)
2. Deals/Pipeline model with stages and a Kanban-style board
3. Activity/notes timeline per contact or deal
4. AI features (e.g., summarization, next-best-action suggestions) via an LLM provider
5. Email delivery service for invites and password resets (replacing console-logged tokens)
6. Test suite (none currently present in the repo)

---

## License

No license file is currently included in the repository. Add a `LICENSE` file to clarify usage rights before sharing or open-sourcing this project.
