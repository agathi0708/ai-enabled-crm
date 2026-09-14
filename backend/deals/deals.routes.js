const express = require("express");

const controller = require("./deals.controller");

const router = express.Router();

/**
 * GET /api/v1/deals
 */
router.get(
  "/",
  controller.listDeals
);

/**
 * POST /api/v1/deals/from-contact/:id
 */
router.post(
  "/from-contact/:id",
  controller.convertFromContact
);

module.exports = router;