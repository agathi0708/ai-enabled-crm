const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth/auth.routes");
const contactsRoutes = require("./contacts/contacts.routes");
const activitiesRoutes = require("./activities/activities.routes");
const tasksRoutes = require("./tasks/tasks.routes");
const dealsRoutes = require("./deals/deals.routes");
const usersRoutes = require("./users/users.routes");
const reportsRoutes = require("./reports/reports.routes");
const aiRoutes = require("./ai/ai.routes");

const {
  requireAuth,
} = require("./auth/auth.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
      ];

      // Allow requests without an Origin header
      // such as PowerShell/Postman.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    data: {
      status: "OK",
      message: "CRM API is running",
    },
    meta: {},
    error: null,
  });
});

/**
 * Authentication routes.
 *
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/refresh
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/password-reset/request
 * POST /api/v1/auth/password-reset/confirm
 * GET  /api/v1/auth/me
 */
app.use(
  "/api/v1/auth",
  authRoutes
);

/**
 * User Management routes.
 *
 * GET   /api/v1/users
 * POST  /api/v1/users/invite
 * PATCH /api/v1/users/:id/deactivate
 *
 * All user-management routes are protected
 * by authentication and admin role checks
 * inside users.routes.js.
 */
app.use(
  "/api/v1/users",
  usersRoutes
);

/**
 * Contact routes.
 */
app.use(
  "/api/v1/contacts",
  contactsRoutes
);

/**
 * Activities routes.
 *
 * POST   /api/v1/activities
 * DELETE /api/v1/activities/:id
 *
 * Authentication required.
 */
app.use(
  "/api/v1/activities",
  requireAuth,
  activitiesRoutes
);

/**
 * Tasks routes.
 *
 * GET    /api/v1/tasks
 * POST   /api/v1/tasks
 * PATCH  /api/v1/tasks/:id
 * DELETE /api/v1/tasks/:id
 * GET    /api/v1/tasks/notifications
 *
 * Authentication required.
 */
app.use(
  "/api/v1/tasks",
  requireAuth,
  tasksRoutes
);

/**
 * Deals routes.
 *
 * GET  /api/v1/deals
 * POST /api/v1/deals/from-contact/:id
 *
 * Authentication required.
 */
app.use(
  "/api/v1/deals",
  requireAuth,
  dealsRoutes
);

/**
 * Reports routes.
 *
 * GET /api/v1/reports/pipeline-summary
 * GET /api/v1/reports/performance
 *
 * Authentication required.
 */
app.use(
  "/api/v1/reports",
  reportsRoutes
);

/**
 * AI routes.
 *
 * POST /api/v1/ai/assistant/query
 *
 * Authentication required inside
 * ai.routes.js.
 */
app.use(
  "/api/v1/ai",
  aiRoutes
);

app.listen(PORT, () => {
  console.log(
    `CRM API running on http://localhost:${PORT}`
  );
});