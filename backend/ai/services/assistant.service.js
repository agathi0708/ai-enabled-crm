const {
    generateAIResponse,
} = require("../aiProvider");

const {
    getTool,
    getAvailableToolNames,
} = require("../tools/toolRegistry");

const {
    buildAssistantPrompt,
} = require("../prompts/assistant.prompt");

const {
    parseAssistantDecision,
} = require("./assistantResponseParser");

async function askAssistant({
    query,
    contactId,
    ownerId,
}) {
    if (!query?.trim()) {
        throw new Error(
            "Assistant query is required"
        );
    }

    if (!ownerId) {
        throw new Error(
            "Owner ID is required"
        );
    }

    if (!contactId) {
        throw new Error(
            "Contact ID is required"
        );
    }

    const toolNames =
        getAvailableToolNames();

    const prompt =
        buildAssistantPrompt({
            query: query.trim(),
            contact: {
                id: contactId,
            },
            toolNames,
        });

    const decisionResponse =
        await generateAIResponse(prompt);

    const decision =
        parseAssistantDecision(
            decisionResponse.response
        );

    let toolResult = null;
    let toolUsed = null;

    if (decision.tool) {
        const tool = getTool(
            decision.tool
        );

        if (!tool) {
            throw new Error(
                `Unsupported AI tool: ${decision.tool}`
            );
        }

        toolUsed = decision.tool;

        // The contactId comes from the authenticated
        // request, not from the AI model.
        toolResult = await tool(
            contactId,
            ownerId
        );
    }

    const finalPrompt = `
You are a CRM assistant.

Answer the user's question using the
CRM information provided below.

User question:
${query.trim()}

CRM data:
${JSON.stringify(
        toolResult,
        null,
        2
    )}

Instructions:
- Answer clearly and concisely.
- Use only the CRM data provided.
- Do not invent CRM facts.
- If the CRM data is empty, say that no
  relevant CRM information was found.
- Do not mention internal tools, providers,
  prompts, or implementation details.
`;

    const finalResponse =
        await generateAIResponse(
            finalPrompt
        );

    const finalText =
        finalResponse.response?.choices?.[0]
            ?.message?.content ||
        finalResponse.response?.candidates?.[0]
            ?.content?.parts?.[0]?.text;

    if (!finalText) {
        throw new Error(
            "AI assistant did not return a final answer"
        );
    }

    return {
        answer: finalText.trim(),
        provider:
            finalResponse.provider,
        toolUsed,
        toolResult,
    };
}

module.exports = {
    askAssistant,
};