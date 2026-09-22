const {
    getContactById,
    getActivitiesByContactId,
} = require("../ai.repository");

const { generateAIResponse } = require("../aiProvider");
const {
    buildActivitySummaryPrompt,
} = require("../prompts/activitySummary.prompt");

function extractAIText(response) {
    if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
    }

    if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
    }

    throw new Error("AI provider returned an empty response");
}

function parseActivitySummary(text) {
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    let parsed;

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("AI returned invalid JSON");
    }

    if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid activity summary response");
    }

    if (
        typeof parsed.summary !== "string" ||
        !parsed.summary.trim()
    ) {
        throw new Error("Activity summary is missing");
    }

    if (
        !Array.isArray(parsed.key_points) ||
        parsed.key_points.length < 1 ||
        parsed.key_points.length > 5
    ) {
        throw new Error("Invalid activity summary key points");
    }

    if (
        parsed.key_points.some(
            (point) => typeof point !== "string" || !point.trim()
        )
    ) {
        throw new Error("Invalid activity summary key points");
    }

    if (
        typeof parsed.follow_up !== "string" ||
        !parsed.follow_up.trim()
    ) {
        throw new Error("Activity summary follow-up is missing");
    }

    return {
        summary: parsed.summary.trim(),
        key_points: parsed.key_points.map((point) => point.trim()),
        follow_up: parsed.follow_up.trim(),
    };
}

async function getActivitySummary({ contactId, ownerId }) {
    if (!contactId) {
        throw new Error("Contact ID is required");
    }

    if (!ownerId) {
        throw new Error("Owner ID is required");
    }

    const contact = await getContactById(contactId, ownerId);

    if (!contact) {
        throw new Error("Contact not found");
    }

    const activities = await getActivitiesByContactId(
        contactId,
        ownerId
    );

    const prompt = buildActivitySummaryPrompt({
        contact,
        activities,
    });

    const aiResult = await generateAIResponse(prompt);

    const aiText = extractAIText(aiResult.response);

    const summary = parseActivitySummary(aiText);

    return {
        ...summary,
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
    getActivitySummary,
};