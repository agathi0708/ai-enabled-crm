const {
    getNextBestAction,
} = require("./services/nextBestAction.service");

async function nextBestActionController(req, res) {
    try {
        const { contactId } = req.body;

        const ownerId = req.user.id;

        const data = await getNextBestAction({
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
            "AI next best action error:",
            error
        );

        return res.status(500).json({
            data: null,
            meta: {},
            error: {
                code: "AI_NEXT_BEST_ACTION_ERROR",
                message:
                    error.message ||
                    "Failed to generate next best action",
            },
        });
    }
}

module.exports = {
    nextBestActionController,
};