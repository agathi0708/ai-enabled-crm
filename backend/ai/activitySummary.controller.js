const { getActivitySummary } = require("./services/activitySummary.service");

async function activitySummaryController(req, res) {
    try {
        const { contactId } = req.body;
        const ownerId = req.user.id;

        const data = await getActivitySummary({
            contactId,
            ownerId,
        });

        return res.status(200).json({
            data,
            meta: {},
            error: null,
        });
    } catch (error) {
        console.error("AI activity summary error:", error);

        return res.status(500).json({
            data: null,
            meta: {},
            error: {
                code: "AI_ACTIVITY_SUMMARY_ERROR",
                message:
                    error.message || "Failed to generate activity summary",
            },
        });
    }
}

module.exports = {
    activitySummaryController,
};