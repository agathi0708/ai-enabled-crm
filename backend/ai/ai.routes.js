const express = require("express");

const {
    requireAuth,
} = require("../auth/auth.middleware");

const {
    askAssistantController,
} = require("./ai.controller");

const {
    scoreLeadController,
} = require("./leadScoring.controller");

const {
    nextBestActionController,
} = require("./nextBestAction.controller");

const {
    activitySummaryController,
} = require("./activitySummary.controller");

const router = express.Router();

/**
 * CRM AI Assistant
 *
 * POST /api/v1/ai/assistant/query
 */
router.post(
    "/assistant/query",
    requireAuth,
    askAssistantController
);

/**
 * AI Lead Scoring
 *
 * POST /api/v1/ai/lead-score
 */
router.post(
    "/lead-score",
    requireAuth,
    scoreLeadController
);

/**
 * AI Next Best Action
 *
 * POST /api/v1/ai/next-best-action
 */
router.post(
    "/next-best-action",
    requireAuth,
    nextBestActionController
);

/**
 * AI Activity Summary
 *
 * POST /api/v1/ai/activity-summary
 */
router.post(
    "/activity-summary",
    requireAuth,
    activitySummaryController
);

module.exports = router;