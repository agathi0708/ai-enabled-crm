const leadScoringService = require("./services/leadScoring.service");
const summaryService = require("./services/summary.service");
const assistantService = require("./services/assistant.service");
const nextBestActionService = require("./services/nextBestAction.service");

const getLeadScore = async (contactId) => {
    return await leadScoringService.calculateLeadScore(
        contactId
    );
};

const getContactSummary = async (contactId) => {
    return await summaryService.generateContactSummary(
        contactId
    );
};

const processAssistantQuery = async (query) => {
    return await assistantService.processAssistantQuery(
        query
    );
};

const getNextBestAction = async (contactId) => {
    return await nextBestActionService.generateNextBestAction(
        contactId
    );
};

module.exports = {
    getLeadScore,
    getContactSummary,
    processAssistantQuery,
    getNextBestAction,
};