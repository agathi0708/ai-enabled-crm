const extractTextFromAIResponse = (provider, response) => {
    if (provider === "gemini") {
        return (
            response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            ""
        );
    }

    return (
        response?.choices?.[0]?.message?.content ||
        ""
    );
};

const parseLeadScoreResponse = (provider, response) => {
    const text = extractTextFromAIResponse(
        provider,
        response
    );

    if (!text) {
        throw new Error(
            "AI provider returned an empty response"
        );
    }

    // Remove possible markdown code fences.
    const cleanedText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        const parsed = JSON.parse(cleanedText);

        const score = Number(parsed.score);
        const rationale = String(
            parsed.rationale || ""
        );

        if (
            Number.isNaN(score) ||
            score < 0 ||
            score > 100 ||
            !rationale
        ) {
            throw new Error(
                "Invalid lead score response"
            );
        }

        return {
            score,
            rationale,
        };
    } catch (error) {
        throw new Error(
            `Unable to parse AI lead score response: ${error.message}`
        );
    }
};

module.exports = {
    extractTextFromAIResponse,
    parseLeadScoreResponse,
};