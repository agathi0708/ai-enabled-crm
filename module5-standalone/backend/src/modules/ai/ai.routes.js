const express = require("express");
const aiController = require("./ai.controller");

const router = express.Router();

router.post(
    "/lead-score/:contactId",
    aiController.getLeadScore
);

router.post(
    "/summary/:contactId",
    aiController.getContactSummary
);

router.post(
    "/assistant/query",
    aiController.processAssistantQuery
);

router.post(
    "/next-best-action/:contactId",
    aiController.getNextBestAction
);

module.exports = router;