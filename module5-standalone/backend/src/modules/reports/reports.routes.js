const express = require("express");
const reportsController = require("./reports.controller");

const router = express.Router();

router.get(
    "/pipeline-summary",
    reportsController.getPipelineSummary
);

router.get(
    "/performance",
    reportsController.getPerformanceReport
);

module.exports = router;