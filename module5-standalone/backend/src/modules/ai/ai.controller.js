const aiService = require("./ai.service");

const getLeadScore = async (req, res, next) => {
    try {
        const { contactId } = req.params;

        const result =
            await aiService.getLeadScore(contactId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getContactSummary = async (req, res, next) => {
    try {
        const { contactId } = req.params;

        const result =
            await aiService.getContactSummary(contactId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const processAssistantQuery = async (req, res, next) => {
    try {
        const { query } = req.body;

        const result =
            await aiService.processAssistantQuery(
                query
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getNextBestAction = async (req, res, next) => {
    try {
        const { contactId } = req.params;

        const result =
            await aiService.getNextBestAction(
                contactId
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeadScore,
    getContactSummary,
    processAssistantQuery,
    getNextBestAction,
};