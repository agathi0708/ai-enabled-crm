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
    buildNextBestActionPrompt,
} = require("../prompts/nextBestAction.prompt");

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

function parseNextBestAction(response) {
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
            "AI next best action response was not valid JSON"
        );
    }

    if (
        !parsed.action ||
        typeof parsed.action !== "string"
    ) {
        throw new Error(
            "AI next best action is invalid"
        );
    }

    if (
        !parsed.reason ||
        typeof parsed.reason !== "string"
    ) {
        throw new Error(
            "AI next best action reason is invalid"
        );
    }

    const allowedPriorities = [
        "low",
        "medium",
        "high",
    ];

    if (
        !allowedPriorities.includes(
            parsed.priority
        )
    ) {
        throw new Error(
            "AI next best action priority is invalid"
        );
    }

    return {
        action: parsed.action.trim(),
        reason: parsed.reason.trim(),
        priority: parsed.priority,
    };
}

async function getNextBestAction({
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
        buildNextBestActionPrompt({
            contact,
            deals,
            activities,
            tasks,
        });

    const aiResult =
        await generateAIResponse(prompt);

    const nextBestAction =
        parseNextBestAction(
            aiResult.response
        );

    return {
        ...nextBestAction,
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
    getNextBestAction,
};