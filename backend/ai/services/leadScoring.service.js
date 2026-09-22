const {
    getContactById,
    getDealsByContactId,
    getActivitiesByContactId,
    getTasksByContactId,
} = require("../ai.repository");

const {
    generateAIResponse,
} = require("../aiProvider");

const {
    buildLeadScoringPrompt,
} = require("../prompts/leadScoring.prompt");

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

function parseLeadScore(response) {
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
            "AI lead scoring response was not valid JSON"
        );
    }

    if (
        !Number.isInteger(parsed.score) ||
        parsed.score < 0 ||
        parsed.score > 100
    ) {
        throw new Error(
            "AI lead score must be an integer between 0 and 100"
        );
    }

    const allowedCategories = [
        "low",
        "medium",
        "high",
    ];

    if (
        !allowedCategories.includes(
            parsed.category
        )
    ) {
        throw new Error(
            "AI lead score category is invalid"
        );
    }

    if (
        !Array.isArray(parsed.reasons) ||
        parsed.reasons.length < 1 ||
        parsed.reasons.length > 5
    ) {
        throw new Error(
            "AI lead score reasons are invalid"
        );
    }

    if (
        !Array.isArray(parsed.recommendations) ||
        parsed.recommendations.length < 1 ||
        parsed.recommendations.length > 3
    ) {
        throw new Error(
            "AI lead score recommendations are invalid"
        );
    }

    return {
        score: parsed.score,
        category: parsed.category,
        reasons: parsed.reasons.map(String),
        recommendations:
            parsed.recommendations.map(String),
    };
}

async function scoreLead({
    contactId,
    ownerId,
}) {
    if (!contactId) {
        throw new Error(
            "Contact ID is required"
        );
    }

    if (!ownerId) {
        throw new Error(
            "Owner ID is required"
        );
    }

    const contact =
        await getContactById(
            contactId,
            ownerId
        );

    if (!contact) {
        throw new Error(
            "Contact not found"
        );
    }

    const [
        deals,
        activities,
        tasks,
    ] = await Promise.all([
        getDealsByContactId(
            contactId,
            ownerId
        ),
        getActivitiesByContactId(
            contactId,
            ownerId
        ),
        getTasksByContactId(
            contactId,
            ownerId
        ),
    ]);

    const prompt =
        buildLeadScoringPrompt({
            contact,
            deals,
            activities,
            tasks,
        });

    const aiResult =
        await generateAIResponse(prompt);

    const score =
        parseLeadScore(
            aiResult.response
        );

    return {
        ...score,
        provider: aiResult.provider,
        contact: {
            id: contact.id,
            name: contact.name,
            company: contact.company,
            status: contact.status,
        },
    };
}

module.exports = {
    scoreLead,
};