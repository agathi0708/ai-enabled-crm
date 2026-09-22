const express = require("express");

const controller = require("./reports.controller");
const { requireAuth } = require("../auth/auth.middleware");

const router = express.Router();

router.get(
    "/pipeline-summary",
    requireAuth,
    controller.getPipelineSummary
);

router.get(
    "/performance",
    requireAuth,
    controller.getPerformance
);

module.exports = router;