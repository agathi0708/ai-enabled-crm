const {
    scoreLead,
} = require("./services/leadScoring.service");

async function scoreLeadController(req, res) {
    try {
        const { contactId } = req.body;

        const ownerId = req.user.id;

        const data = await scoreLead({
            contactId,
            ownerId,
        });

        return res.status(200).json({
            data,
            meta: {},
            error: null,
        });
    } catch (error) {
        console.error(
            "AI lead scoring error:",
            error
        );

        return res.status(500).json({
            data: null,
            meta: {},
            error: {
                code: "AI_LEAD_SCORING_ERROR",
                message:
                    error.message ||
                    "Failed to score lead",
            },
        });
    }
}

module.exports = {
    scoreLeadController,
};