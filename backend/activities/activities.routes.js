const express = require("express");

const controller = require("./activities.controller");

const router = express.Router();

/**
 * POST /api/v1/activities
 */
router.post(
  "/",
  controller.createActivity
);

/**
 * DELETE /api/v1/activities/:id
 */
router.delete(
  "/:id",
  controller.deleteActivity
);

module.exports = router;