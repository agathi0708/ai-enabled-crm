const {
    askAssistant,
} = require("./services/assistant.service");

/**
 * Handle CRM AI assistant requests.
 */
async function askAssistantController(
    req,
    res
) {
    try {
        const {
            query,
            contactId,
        } = req.body;

        const ownerId = req.user.id;

        const data =
            await askAssistant({
                query,
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
            "AI assistant error:",
            error
        );

        return res.status(500).json({
            data: null,
            meta: {},
            error: {
                code: "AI_ASSISTANT_ERROR",
                message:
                    error.message ||
                    "Failed to process AI assistant request",
            },
        });
    }
}

module.exports = {
    askAssistantController,
};