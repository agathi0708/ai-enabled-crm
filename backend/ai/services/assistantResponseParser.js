function extractAIText(response) {
    if (
        response?.choices?.[0]?.message?.content
    ) {
        return response.choices[0].message.content;
    }

    if (
        response?.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
        return response.candidates[0].content.parts[0].text;
    }

    throw new Error(
        "AI response did not contain text"
    );
}

function parseAssistantDecision(response) {
    const text = extractAIText(response)
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(
            "AI assistant returned invalid JSON"
        );
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            parsed,
            "tool"
        )
    ) {
        throw new Error(
            "AI assistant response is missing tool"
        );
    }

    if (
        parsed.tool !== null &&
        typeof parsed.tool !== "string"
    ) {
        throw new Error(
            "AI assistant tool must be a string or null"
        );
    }

    if (
        parsed.contactId !== null &&
        parsed.contactId !== undefined &&
        typeof parsed.contactId !== "string"
    ) {
        throw new Error(
            "AI assistant contactId must be a string or null"
        );
    }

    return {
        tool: parsed.tool,
        contactId:
            parsed.contactId ?? null,
    };
}

module.exports = {
    parseAssistantDecision,
};