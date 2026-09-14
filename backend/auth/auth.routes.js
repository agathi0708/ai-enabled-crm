const express = require("express");

const controller = require("./auth.controller");
const {
  requireAuth,
} = require("./auth.middleware");

const router = express.Router();

/**
 * POST /api/v1/auth/register
 */
router.post(
  "/register",
  controller.register
);

/**
 * POST /api/v1/auth/login
 */
router.post(
  "/login",
  controller.login
);

/**
 * POST /api/v1/auth/refresh
 */
router.post(
  "/refresh",
  controller.refresh
);

/**
 * GET /api/v1/auth/me
 */
router.get(
  "/me",
  requireAuth,
  controller.me
);

module.exports = router;