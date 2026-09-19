const aiRepository = require("../ai.repository");

const {
    buildNextBestActionPrompt,
} = require("../prompts/nextBestAction.prompt");

const {
    generateAIResponse,
} = require("../../../integrations/ai/aiProvider");

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

const generateNextBestAction = async (contactId) => {
    const contact =
        await aiRepository.getContactById(contactId);

    if (!contact) {
        throw new Error("Contact not found");
    }

    const activities =
        await aiRepository.getActivitiesByContactId(
            contactId
        );

    // Temporary task data for Module 5 development.
    // This will later connect to Module 4's task repository.
    const tasks = [
        {
            id: 1,
            contactId: 1,
            title: "Follow up on CRM proposal",
            status: "pending",
            dueInDays: 2,
        },
        {
            id: 2,
            contactId: 1,
            title: "Schedule implementation discussion",
            status: "pending",
            dueInDays: 5,
        },
        {
            id: 3,
            contactId: 2,
            title: "Send product information",
            status: "completed",
            dueInDays: 0,
        },
        {
            id: 4,
            contactId: 3,
            title: "Follow up on contract negotiation",
            status: "pending",
            dueInDays: 1,
        },
    ];

    const contactTasks = tasks.filter(
        (task) =>
            task.contactId === Number(contactId)
    );

    const prompt = buildNextBestActionPrompt(
        contact,
        activities,
        contactTasks
    );

    console.log(
        "Generated AI Next Best Action Prompt:"
    );
    console.log(prompt);

    const aiResult =
        await generateAIResponse(prompt);

    const text = extractTextFromAIResponse(
        aiResult.provider,
        aiResult.response
    );

    if (!text) {
        throw new Error(
            "AI provider returned an empty next-best-action response"
        );
    }

    const cleanedText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    let parsedResult;

    try {
        parsedResult = JSON.parse(cleanedText);
    } catch (error) {
        throw new Error(
            "Unable to parse AI next-best-action response"
        );
    }

    if (
        !parsedResult.action ||
        !parsedResult.reason
    ) {
        throw new Error(
            "Invalid AI next-best-action response"
        );
    }

    return {
        contactId: contact.id,
        action: parsedResult.action,
        reason: parsedResult.reason,
        provider: aiResult.provider,
    };
};

module.exports = {
    generateNextBestAction,
};