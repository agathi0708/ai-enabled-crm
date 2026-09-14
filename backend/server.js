const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth/auth.routes");
const contactsRoutes = require("./contacts/contacts.routes");
const activitiesRoutes = require("./activities/activities.routes");
const dealsRoutes = require("./deals/deals.routes");
const { requireAuth } = require("./auth/auth.middleware");

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
 * GET  /api/v1/auth/me
 */
app.use(
  "/api/v1/auth",
  authRoutes
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

app.listen(PORT, () => {
  console.log(
    `CRM API running on http://localhost:${PORT}`
  );
});