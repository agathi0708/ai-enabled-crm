const {
    extractTextFromAIResponse,
} = require("./aiResponseParser");

const parseSummaryResponse = (provider, response) => {
    const text = extractTextFromAIResponse(
        provider,
        response
    );

    if (!text) {
        throw new Error(
            "AI provider returned an empty summary response"
        );
    }

    return text.trim();
};

module.exports = {
    parseSummaryResponse,
};