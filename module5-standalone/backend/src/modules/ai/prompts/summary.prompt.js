const buildSummaryPrompt = (contact, activities) => {
    const activityText = activities
        .map(
            (activity) =>
                `- ${activity.type}: ${activity.description}`
        )
        .join("\n");

    return `
You are an AI assistant for a CRM system.

Generate a concise summary of the following customer contact.

Contact Information:
Name: ${contact.name}
Company: ${contact.company}
Job Title: ${contact.jobTitle}
Status: ${contact.status}
Interactions: ${contact.interactions}
Days Since Last Contact: ${contact.lastContactDays}
Potential Deal Value: ₹${contact.dealValue}

Recent Activities:
${activityText || "No activities available."}

Your summary should:
- Explain the current status of the contact.
- Mention important recent activities.
- Mention the level of engagement.
- Mention the potential deal value when relevant.
- Be concise and useful for a sales representative.

Do not invent information that is not provided.
`;
};

module.exports = {
    buildSummaryPrompt,
};