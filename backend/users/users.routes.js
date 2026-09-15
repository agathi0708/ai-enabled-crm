const express = require("express");

const controller = require("./users.controller");

const {
  requireAuth,
  requireRoles,
} = require("../auth/auth.middleware");

const router = express.Router();

/**
 * All User Management routes require authentication
 * and Admin role.
 */

/**
 * GET /api/v1/users
 * List all users.
 */
router.get(
  "/",
  requireAuth,
  requireRoles("admin"),
  controller.listUsers
);

/**
 * POST /api/v1/users/invite
 * Invite a new user.
 */
router.post(
  "/invite",
  requireAuth,
  requireRoles("admin"),
  controller.inviteUser
);

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivate a user.
 */
router.patch(
  "/:id/deactivate",
  requireAuth,
  requireRoles("admin"),
  controller.deactivateUser
);

module.exports = router;