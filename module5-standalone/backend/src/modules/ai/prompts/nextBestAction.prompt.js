const buildNextBestActionPrompt = (
    contact,
    activities,
    tasks
) => {
    const activityText = activities
        .map(
            (activity) =>
                `- ${activity.type}: ${activity.description} (${activity.daysAgo} days ago)`
        )
        .join("\n");

    const taskText = tasks
        .map(
            (task) =>
                `- ${task.title} | Status: ${task.status} | Due in: ${task.dueInDays} days`
        )
        .join("\n");

    return `
You are an AI sales assistant for a CRM system.

Analyze the contact, recent activities, and tasks below.

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

Tasks:
${taskText || "No tasks available."}

Determine the single most appropriate next action
a sales representative should take for this contact.

Consider:
- Current contact status
- Recent engagement
- Recency of communication
- Existing pending tasks
- Potential deal value
- Recent activities

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "action": "Recommended next action",
  "reason": "Short explanation for the recommendation."
}

Rules:
- action must be a practical sales action.
- reason must be concise.
- Use only the information provided.
- Do not invent CRM information.
- Do not include markdown.
- Do not include code fences.
- Do not include any text before or after the JSON.
`;
};

module.exports = {
    buildNextBestActionPrompt,
};