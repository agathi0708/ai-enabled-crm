const express = require("express");

const controller = require("./auth.controller");
const { requireAuth } = require("./auth.middleware");

const router = express.Router();

// Public authentication routes
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

router.post(
  "/password-reset/request",
  controller.requestPasswordReset
);

router.post(
  "/password-reset/confirm",
  controller.confirmPasswordReset
);

// Authenticated route
router.get(
  "/me",
  requireAuth,
  controller.me
);

module.exports = router;
