const aiRepository = require("../ai.repository");

const {
    buildSummaryPrompt,
} = require("../prompts/summary.prompt");

const {
    generateAIResponse,
} = require("../../../integrations/ai/aiProvider");

const {
    parseSummaryResponse,
} = require("./summaryResponseParser");

const generateContactSummary = async (contactId) => {
    const contact =
        await aiRepository.getContactById(contactId);

    if (!contact) {
        throw new Error("Contact not found");
    }

    const activities =
        await aiRepository.getActivitiesByContactId(
            contactId
        );

    const prompt = buildSummaryPrompt(
        contact,
        activities
    );

    console.log(
        "Generated AI Summary Prompt:"
    );
    console.log(prompt);

    const aiResult =
        await generateAIResponse(prompt);

    const summary =
        parseSummaryResponse(
            aiResult.provider,
            aiResult.response
        );

    return {
        contactId: contact.id,
        summary,
        provider: aiResult.provider,
    };
};

module.exports = {
    generateContactSummary,
};