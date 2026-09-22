const express = require("express");
const controller = require("./deals.controller");

const router = express.Router();

/**
 * GET /api/v1/deals
 */
router.get("/", controller.listDeals);

/**
 * POST /api/v1/deals
 *
 * Create a new deal.
 */
router.post("/", controller.createDeal);

/**
 * POST /api/v1/deals/from-contact/:id
 */
router.post(
  "/from-contact/:id",
  controller.convertFromContact
);

/**
 * PATCH /api/v1/deals/:id
 *
 * Update deal details.
 */
router.patch(
  "/:id",
  controller.updateDeal
);

/**
 * PATCH /api/v1/deals/:id/stage
 *
 * Update deal pipeline stage.
 */
router.patch(
  "/:id/stage",
  controller.updateStage
);

/**
 * DELETE /api/v1/deals/:id
 *
 * Delete a deal.
 */
router.delete(
  "/:id",
  controller.deleteDeal
);

module.exports = router;