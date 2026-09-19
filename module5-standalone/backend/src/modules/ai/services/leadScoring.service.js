const aiRepository = require("../ai.repository");

const {
    buildLeadScoringPrompt,
} = require("../prompts/leadScoring.prompt");

const {
    generateAIResponse,
} = require("../../../integrations/ai/aiProvider");

const {
    parseLeadScoreResponse,
} = require("./aiResponseParser");

const calculateLeadScore = async (contactId) => {
    const contact =
        await aiRepository.getContactById(contactId);

    if (!contact) {
        throw new Error("Contact not found");
    }

    const prompt =
        buildLeadScoringPrompt(contact);

    console.log(
        "Generated AI Lead Scoring Prompt:"
    );
    console.log(prompt);

    const aiResult =
        await generateAIResponse(prompt);

    const parsedResult =
        parseLeadScoreResponse(
            aiResult.provider,
            aiResult.response
        );

    return {
        contactId: contact.id,
        score: parsedResult.score,
        rationale: parsedResult.rationale,
        provider: aiResult.provider,
    };
};

module.exports = {
    calculateLeadScore,
};