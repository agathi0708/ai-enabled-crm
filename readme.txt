## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- Git (optional, if cloning)

## Getting Started

### 1. Backend Setup (FastAPI)

```
cd backend

# Create and activate a virtual environment
python -m venv venv

# Activate it:
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (if not already present) with:

```
SECRET_KEY=change-this-to-a-long-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

> Change SECRET_KEY to a long, random, unique value before deploying anywhere beyond local development.

Run the backend server:

```
uvicorn app.main:app --reload
```

The API will be available at: http://127.0.0.1:8000
Interactive API docs (Swagger UI): http://127.0.0.1:8000/docs

The SQLite database (crm.db) and tables are created automatically on first run.

### 2. Frontend Setup (React + Vite)

Open a new terminal:

```
cd frontend

# Install dependencies
npm install
```

Create a `.env` file inside `frontend/` (if not already present) with:

```
VITE_API_URL=http://127.0.0.1:8000
```

Run the frontend dev server:

```
npm run dev
```

The app will be available at: http://localhost:5173

### 3. Using the App

1. Go to http://localhost:5173/register and create an account (default role: rep).
2. Log in at http://localhost:5173/login.
3. To access /admin and /admin/users, your account's role must be admin. Since new registrations default to rep, you'll need to manually promote a user to admin in the database (e.g., using a SQLite browser like DB Browser for SQLite: https://sqlitebrowser.org/) by updating the role column in the users table.

## API Overview

| Method | Endpoint                                 | Description                             | Access        |
|--------|-------------------------------------------|------------------------------------------|---------------|
| POST   | /auth/register                            | Register a new user                       | Public        |
| POST   | /auth/login                               | Login (returns access + refresh token)    | Public        |
| POST   | /auth/token                               | OAuth2-compatible token login             | Public        |
| POST   | /auth/refresh                             | Refresh access token                      | Public        |
| GET    | /auth/me                                  | Get current logged-in user                 | Authenticated |
| POST   | /auth/password-reset/request              | Request password reset token              | Public        |
| POST   | /auth/password-reset                      | Reset password using token                | Public        |
| POST   | /auth/admin/invite                        | Invite/create a new user                  | Admin only    |
| PATCH  | /auth/admin/users/{user_id}/deactivate    | Deactivate a user                          | Admin only    |
| GET    | /auth/admin-test                          | Test admin-only access                     | Admin only    |
| GET    | /auth/manager-test                        | Test manager-only access                   | Manager only  |
| GET    | /auth/admin-manager-test                  | Test admin or manager access               | Admin/Manager |

## Build for Production (Frontend)

```
cd frontend
npm run build
```

This generates a production-ready build in frontend/dist/.

## Notes

- The password reset flow currently returns the reset token directly in the API response for development/testing convenience. In production, this token should be sent via email instead.
- CORS is currently configured to allow only http://localhost:5173 and http://127.0.0.1:5173. Update backend/app/main.py if you deploy the frontend elsewhere.
- The SQLite database file (crm.db) is included for local development. Delete it if you want a fresh database (it will be recreated automatically on next server start).
