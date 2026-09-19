const aiRepository = require("../ai.repository");

const {
    buildAssistantPrompt,
} = require("../prompts/assistant.prompt");

const {
    generateAIResponse,
} = require("../../../integrations/ai/aiProvider");

const {
    executeTool,
} = require("../tools/toolRegistry");

const extractTextFromAIResponse = (
    provider,
    response
) => {
    if (provider === "gemini") {
        return (
            response?.candidates?.[0]?.content?.parts?.[0]
                ?.text || ""
        );
    }

    return (
        response?.choices?.[0]?.message?.content || ""
    );
};

const parseToolDecision = (
    provider,
    response
) => {
    const text = extractTextFromAIResponse(
        provider,
        response
    );

    if (!text) {
        throw new Error(
            "AI assistant returned an empty response"
        );
    }

    const cleanedText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        throw new Error(
            "AI assistant returned an invalid tool decision"
        );
    }
};

const buildFinalAnswerPrompt = (
    userQuery,
    toolName,
    toolResult
) => {
    return `
You are an AI assistant for a CRM system.

Answer the user's question using the CRM tool result below.

User Question:
${userQuery}

Tool Used:
${toolName}

CRM Tool Result:
${JSON.stringify(toolResult, null, 2)}

Rules:
- Use only the information contained in the CRM tool result.
- Do not invent CRM information.
- Do not mention internal tool implementation details unless necessary.
- Give a concise and useful answer.
`;
};

const processAssistantQuery = async (
    userQuery
) => {
    if (!userQuery || !userQuery.trim()) {
        throw new Error(
            "Assistant query cannot be empty"
        );
    }

    const contacts = await aiRepository.getAllContacts();

    const initialPrompt =
        buildAssistantPrompt(
            userQuery,
            contacts
        );

    const aiResult =
        await generateAIResponse(initialPrompt);

    const decision =
        parseToolDecision(
            aiResult.provider,
            aiResult.response
        );

    if (!decision.useTool) {
        return {
            answer:
                decision.answer ||
                "I could not determine an answer from the available CRM information.",
            provider: aiResult.provider,
            toolUsed: null,
        };
    }

    const toolResult =
        await executeTool(
            decision.toolName,
            decision.arguments || {}
        );

    const finalPrompt =
        buildFinalAnswerPrompt(
            userQuery,
            decision.toolName,
            toolResult
        );

    const finalAIResult =
        await generateAIResponse(finalPrompt);

    const finalAnswer =
        extractTextFromAIResponse(
            finalAIResult.provider,
            finalAIResult.response
        );

    if (!finalAnswer) {
        throw new Error(
            "AI assistant returned an empty final answer"
        );
    }

    return {
        answer: finalAnswer.trim(),
        provider: finalAIResult.provider,
        toolUsed: decision.toolName,
    };
};

module.exports = {
    processAssistantQuery,
};